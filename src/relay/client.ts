import { io, Socket } from 'socket.io-client';

const RELAY_URL = import.meta.env.VITE_RELAY_URL || 'http://localhost:8384';

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

export function disconnect(): void {
  socket?.disconnect();
  socket = null;
}
