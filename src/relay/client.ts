import { io, Socket } from 'socket.io-client';

// Default to same hostname as the page, port 8384 — works on LAN without config
const RELAY_URL = import.meta.env.VITE_RELAY_URL || `http://${window.location.hostname}:8384`;

let socket: Socket | null = null;

export type RelayEventHandler = (data: any) => void;

export interface RelaySubscription {
  onScore: (handler: RelayEventHandler) => void;
  onIntennse: (handler: RelayEventHandler) => void;
  onClockSync: (handler: RelayEventHandler) => void;
  onHistory: (handler: RelayEventHandler) => void;
  onTick: (handler: RelayEventHandler) => void;
  unsubscribe: () => void;
}

/**
 * Connect to the score-relay /live namespace.
 * Returns the raw socket for lifecycle management.
 */
export function connect(): Socket {
  if (socket?.connected) return socket;

  socket = io(`${RELAY_URL}/live`, {
    transports: ['websocket'],
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 10000,
  });

  socket.on('connect', () => {
    console.log(`[arena] connected to relay: ${RELAY_URL}/live`);
  });

  socket.on('disconnect', (reason) => {
    console.log(`[arena] disconnected: ${reason}`);
  });

  socket.on('connect_error', (err) => {
    console.warn(`[arena] connection error: ${err.message}`);
  });

  return socket;
}

/**
 * Subscribe to a specific matchUp and return event handlers.
 */
export function subscribeToMatch(matchUpId: string): RelaySubscription {
  const s = connect();
  s.emit('subscribe', matchUpId);

  const handlers: Array<[string, RelayEventHandler]> = [];

  function on(event: string, handler: RelayEventHandler) {
    const wrapped: RelayEventHandler = (data) => {
      if (data?.matchUpId === matchUpId) handler(data);
    };
    handlers.push([event, wrapped]);
    s.on(event, wrapped);
  }

  return {
    onScore: (h) => on('score', h),
    onIntennse: (h) => on('intennse', h),
    onClockSync: (h) => on('clockSync', h),
    onHistory: (h) => on('history', h),
    onTick: (h) => on('scorebug-tick', h),
    unsubscribe: () => {
      s.emit('unsubscribe', matchUpId);
      for (const [event, handler] of handlers) {
        s.off(event, handler);
      }
    },
  };
}

/**
 * Subscribe to all matches for a tournament.
 */
export function subscribeToTournament(tournamentId: string): RelaySubscription {
  const s = connect();
  s.emit('subscribe:tournament', tournamentId);

  const handlers: Array<[string, RelayEventHandler]> = [];

  function on(event: string, handler: RelayEventHandler) {
    handlers.push([event, handler]);
    s.on(event, handler);
  }

  return {
    onScore: (h) => on('score', h),
    onIntennse: (h) => on('intennse', h),
    onClockSync: (h) => on('clockSync', h),
    onHistory: (h) => on('history', h),
    onTick: (h) => on('scorebug-tick', h),
    unsubscribe: () => {
      s.emit('unsubscribe:tournament', tournamentId);
      for (const [event, handler] of handlers) {
        s.off(event, handler);
      }
    },
  };
}

export interface ActiveMatchInfo {
  matchUpId: string;
  side1Name?: string;
  side2Name?: string;
  categoryLabel?: string;
  matchUpStatus?: string;
  boltScore?: { side1: number; side2: number };
  arcScore?: { side1: number; side2: number };
}

/**
 * Subscribe to all active matches. Returns the match list and
 * enriches entries as intennse/score events arrive.
 */
export function subscribeAll(onChange: (matches: ActiveMatchInfo[]) => void): () => void {
  const s = connect();
  const matchMap = new Map<string, ActiveMatchInfo>();

  function emitSubscribe() {
    s.emit('subscribe:all');
  }

  // Emit after connect — Socket.IO buffers but the relay only responds
  // to subscribe:all when the socket is in the /live room, which requires
  // a completed connection handshake.
  if (s.connected) {
    emitSubscribe();
  }
  s.on('connect', emitSubscribe);

  function notify() {
    onChange(Array.from(matchMap.values()));
  }

  function handleActive(matchIds: string[]) {
    const current = new Set(matchIds);
    for (const id of matchMap.keys()) {
      if (!current.has(id)) matchMap.delete(id);
    }
    for (const id of matchIds) {
      if (!matchMap.has(id)) {
        matchMap.set(id, { matchUpId: id });
        // Subscribe to each match to get current state (relay sends
        // last known score on subscribe)
        s.emit('subscribe', id);
      }
    }
    notify();
  }

  function handleIntennse(data: any) {
    if (!data?.matchUpId) return;
    const existing = matchMap.get(data.matchUpId) ?? { matchUpId: data.matchUpId };
    existing.side1Name = data.side1Name ?? existing.side1Name;
    existing.side2Name = data.side2Name ?? existing.side2Name;
    existing.categoryLabel = data.categoryLabel ?? existing.categoryLabel;
    existing.matchUpStatus = data.matchUpStatus ?? existing.matchUpStatus;
    existing.boltScore = data.boltScore ?? existing.boltScore;
    existing.arcScore = data.aggregateScore ?? data.arcScore ?? existing.arcScore;
    matchMap.set(data.matchUpId, existing);
    notify();
  }

  function handleScore(data: any) {
    if (!data?.matchUpId) return;
    const existing = matchMap.get(data.matchUpId) ?? { matchUpId: data.matchUpId };
    existing.matchUpStatus = data.matchUpStatus ?? existing.matchUpStatus;
    matchMap.set(data.matchUpId, existing);
    notify();
  }

  s.on('active', handleActive);
  s.on('intennse', handleIntennse);
  s.on('score', handleScore);

  return () => {
    s.emit('unsubscribe:all');
    s.off('connect', emitSubscribe);
    s.off('active', handleActive);
    s.off('intennse', handleIntennse);
    s.off('score', handleScore);
  };
}

export function disconnect(): void {
  socket?.disconnect();
  socket = null;
}
