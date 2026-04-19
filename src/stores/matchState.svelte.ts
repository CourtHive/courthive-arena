/**
 * Reactive match state store using Svelte 5 runes.
 * Receives intennse snapshots from the relay and exposes
 * the current scoreboard state for display components.
 */

export interface ClockState {
  boltTimerRemainingMs: number;
  serveClockRemainingMs: number;
  activeClock: string;
  timeoutRemainingMs?: number;
  breakRemainingMs?: number;
}

export interface MatchState {
  matchUpId: string;
  tournamentId?: string;

  // Teams
  side1Name?: string;
  side2Name?: string;

  // Score
  scoreStringSide1?: string;
  scoreStringSide2?: string;
  sets?: any[];

  // INTENNSE-specific
  boltScore?: { side1: number; side2: number };
  arcScore?: { side1: number; side2: number };
  activePlayers?: { side1?: string; side2?: string };
  servingSide?: number;
  penaltyBox?: any[];

  // Clocks (updated by ticks at 10Hz)
  clock: ClockState;

  // Match status
  matchUpStatus?: string;
  winningSide?: number;

  // Raw snapshot
  lastSnapshot?: any;
  lastTickAt?: number;
}

function createInitialState(matchUpId: string): MatchState {
  return {
    matchUpId,
    clock: {
      boltTimerRemainingMs: 0,
      serveClockRemainingMs: 0,
      activeClock: 'none',
    },
  };
}

// Singleton reactive state — one match at a time on the scoreboard
let state = $state<MatchState>(createInitialState(''));

export function getMatchState(): MatchState {
  return state;
}

export function resetMatchState(matchUpId: string): void {
  state = createInitialState(matchUpId);
}

export function applyIntennseSnapshot(data: any): void {
  state.matchUpId = data.matchUpId;
  state.tournamentId = data.tournamentId;
  state.side1Name = data.side1Name ?? state.side1Name;
  state.side2Name = data.side2Name ?? state.side2Name;
  state.scoreStringSide1 = data.scoreStringSide1 ?? state.scoreStringSide1;
  state.scoreStringSide2 = data.scoreStringSide2 ?? state.scoreStringSide2;
  state.sets = data.sets ?? state.sets;
  state.boltScore = data.boltScore ?? state.boltScore;
  state.arcScore = data.arcScore ?? state.arcScore;
  state.activePlayers = data.activePlayers ?? state.activePlayers;
  state.servingSide = data.servingSide ?? state.servingSide;
  state.penaltyBox = data.penaltyBox ?? state.penaltyBox;
  state.matchUpStatus = data.matchUpStatus ?? state.matchUpStatus;
  state.winningSide = data.winningSide ?? state.winningSide;
  state.lastSnapshot = data;

  // Update clocks from snapshot
  if (typeof data.boltTimerRemainingMs === 'number') {
    state.clock.boltTimerRemainingMs = data.boltTimerRemainingMs;
  }
  if (typeof data.serveClockRemainingMs === 'number') {
    state.clock.serveClockRemainingMs = data.serveClockRemainingMs;
  }
}

export function applyScoreUpdate(data: any): void {
  state.scoreStringSide1 = data.score?.scoreStringSide1 ?? state.scoreStringSide1;
  state.scoreStringSide2 = data.score?.scoreStringSide2 ?? state.scoreStringSide2;
  state.sets = data.score?.sets ?? state.sets;
  state.matchUpStatus = data.matchUpStatus ?? state.matchUpStatus;
  state.winningSide = data.winningSide ?? state.winningSide;
}

export function applyClockTick(data: any): void {
  state.clock.boltTimerRemainingMs = data.boltTimerRemainingMs ?? state.clock.boltTimerRemainingMs;
  state.clock.serveClockRemainingMs = data.serveClockRemainingMs ?? state.clock.serveClockRemainingMs;
  state.clock.activeClock = data.activeClock ?? state.clock.activeClock;
  state.clock.timeoutRemainingMs = data.timeoutRemainingMs;
  state.clock.breakRemainingMs = data.breakRemainingMs;
  state.lastTickAt = Date.now();
}

export function applyClockSync(data: any): void {
  if (typeof data.boltTimerRemainingMs === 'number') {
    state.clock.boltTimerRemainingMs = data.boltTimerRemainingMs;
  }
  if (typeof data.serveClockRemainingMs === 'number') {
    state.clock.serveClockRemainingMs = data.serveClockRemainingMs;
  }
  state.clock.activeClock = data.activeClock ?? state.clock.activeClock;
}
