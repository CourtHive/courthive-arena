import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  getMatchState,
  resetMatchState,
  applyIntennseSnapshot,
  applyScoreUpdate,
  applyClockTick,
  applyClockSync,
} from '../matchState.svelte';

// Mock the relay roster module — we don't want real HTTP calls
vi.mock('../../relay/roster', () => ({
  mergeRelayRoster: vi.fn(),
}));

beforeEach(() => {
  resetMatchState('test-match-001');
});

describe('resetMatchState', () => {
  it('should initialize with the given matchUpId', () => {
    const state = getMatchState();
    expect(state.matchUpId).toBe('test-match-001');
  });

  it('should set clocks to zero', () => {
    const state = getMatchState();
    expect(state.clock.boltTimerRemainingMs).toBe(0);
    expect(state.clock.serveClockRemainingMs).toBe(0);
    expect(state.clock.activeClock).toBe('none');
  });

  it('should have undefined optional fields', () => {
    const state = getMatchState();
    expect(state.side1Name).toBeUndefined();
    expect(state.side2Name).toBeUndefined();
    expect(state.arcScore).toBeUndefined();
    expect(state.boltScore).toBeUndefined();
    expect(state.server).toBeUndefined();
    expect(state.matchUpStatus).toBeUndefined();
    expect(state.winningSide).toBeUndefined();
  });
});

describe('applyIntennseSnapshot', () => {
  it('should apply team names and scores', () => {
    applyIntennseSnapshot({
      matchUpId: 'test-match-001',
      side1Name: 'Tigers',
      side2Name: 'Hawks',
      arcScore: { side1: 3, side2: 2 },
      boltScore: { side1: 1, side2: 0 },
    });

    const state = getMatchState();
    expect(state.side1Name).toBe('Tigers');
    expect(state.side2Name).toBe('Hawks');
    expect(state.arcScore).toEqual({ side1: 3, side2: 2 });
    expect(state.boltScore).toEqual({ side1: 1, side2: 0 });
  });

  it('should accept aggregateScore as arcScore', () => {
    applyIntennseSnapshot({
      matchUpId: 'test-match-001',
      aggregateScore: { side1: 5, side2: 4 },
    });

    expect(getMatchState().arcScore).toEqual({ side1: 5, side2: 4 });
  });

  it('should prefer aggregateScore over arcScore', () => {
    applyIntennseSnapshot({
      matchUpId: 'test-match-001',
      aggregateScore: { side1: 5, side2: 4 },
      arcScore: { side1: 3, side2: 2 },
    });

    expect(getMatchState().arcScore).toEqual({ side1: 5, side2: 4 });
  });

  it('should update clocks from snapshot', () => {
    applyIntennseSnapshot({
      matchUpId: 'test-match-001',
      boltTimerRemainingMs: 120000,
      serveClockRemainingMs: 8000,
    });

    const { clock } = getMatchState();
    expect(clock.boltTimerRemainingMs).toBe(120000);
    expect(clock.serveClockRemainingMs).toBe(8000);
  });

  it('should retain previous values when fields are missing', () => {
    applyIntennseSnapshot({
      matchUpId: 'test-match-001',
      side1Name: 'Tigers',
      side2Name: 'Hawks',
    });

    applyIntennseSnapshot({
      matchUpId: 'test-match-001',
      arcScore: { side1: 1, side2: 0 },
    });

    const state = getMatchState();
    expect(state.side1Name).toBe('Tigers');
    expect(state.side2Name).toBe('Hawks');
    expect(state.arcScore).toEqual({ side1: 1, side2: 0 });
  });

  it('should set server and serveSide', () => {
    applyIntennseSnapshot({
      matchUpId: 'test-match-001',
      server: 0,
      serveSide: 'DEUCE',
    });

    const state = getMatchState();
    expect(state.server).toBe(0);
    expect(state.serveSide).toBe('DEUCE');
  });

  it('should store raw snapshot in lastSnapshot', () => {
    const snapshot = { matchUpId: 'test-match-001', custom: 'data' };
    applyIntennseSnapshot(snapshot);
    expect(getMatchState().lastSnapshot).toBe(snapshot);
  });
});

describe('applyScoreUpdate', () => {
  it('should update score strings', () => {
    applyScoreUpdate({
      score: {
        scoreStringSide1: '6-4 3-2',
        scoreStringSide2: '4-6 2-3',
        sets: [
          { side1Score: 6, side2Score: 4 },
          { side1Score: 3, side2Score: 2 },
        ],
      },
    });

    const state = getMatchState();
    expect(state.scoreStringSide1).toBe('6-4 3-2');
    expect(state.scoreStringSide2).toBe('4-6 2-3');
    expect(state.sets).toHaveLength(2);
  });

  it('should update matchUpStatus and winningSide', () => {
    applyScoreUpdate({
      matchUpStatus: 'COMPLETED',
      winningSide: 1,
    });

    const state = getMatchState();
    expect(state.matchUpStatus).toBe('COMPLETED');
    expect(state.winningSide).toBe(1);
  });

  it('should retain previous values when fields are missing', () => {
    applyScoreUpdate({
      score: { scoreStringSide1: '6-4' },
    });

    applyScoreUpdate({
      matchUpStatus: 'IN_PROGRESS',
    });

    expect(getMatchState().scoreStringSide1).toBe('6-4');
    expect(getMatchState().matchUpStatus).toBe('IN_PROGRESS');
  });
});

describe('applyClockTick', () => {
  it('should update clock values', () => {
    applyClockTick({
      boltTimerRemainingMs: 90000,
      serveClockRemainingMs: 5000,
      activeClock: 'bolt',
    });

    const { clock } = getMatchState();
    expect(clock.boltTimerRemainingMs).toBe(90000);
    expect(clock.serveClockRemainingMs).toBe(5000);
    expect(clock.activeClock).toBe('bolt');
  });

  it('should set break and timeout remaining', () => {
    applyClockTick({
      activeClock: 'break',
      breakRemainingMs: 45000,
    });

    const { clock } = getMatchState();
    expect(clock.activeClock).toBe('break');
    expect(clock.breakRemainingMs).toBe(45000);
  });

  it('should set lastTickAt timestamp', () => {
    const before = Date.now();
    applyClockTick({ activeClock: 'bolt' });
    const after = Date.now();

    const { lastTickAt } = getMatchState();
    expect(lastTickAt).toBeGreaterThanOrEqual(before);
    expect(lastTickAt).toBeLessThanOrEqual(after);
  });

  it('should clear break/timeout when not present', () => {
    applyClockTick({ activeClock: 'break', breakRemainingMs: 45000 });
    applyClockTick({ activeClock: 'bolt' });

    const { clock } = getMatchState();
    expect(clock.activeClock).toBe('bolt');
    expect(clock.breakRemainingMs).toBeUndefined();
    expect(clock.timeoutRemainingMs).toBeUndefined();
  });
});

describe('applyClockSync', () => {
  it('should sync clock values', () => {
    applyClockSync({
      boltTimerRemainingMs: 60000,
      serveClockRemainingMs: 10000,
      activeClock: 'serve',
    });

    const { clock } = getMatchState();
    expect(clock.boltTimerRemainingMs).toBe(60000);
    expect(clock.serveClockRemainingMs).toBe(10000);
    expect(clock.activeClock).toBe('serve');
  });

  it('should only update fields that are present', () => {
    applyClockTick({
      boltTimerRemainingMs: 120000,
      serveClockRemainingMs: 8000,
      activeClock: 'bolt',
    });

    applyClockSync({
      boltTimerRemainingMs: 119500,
    });

    const { clock } = getMatchState();
    expect(clock.boltTimerRemainingMs).toBe(119500);
    expect(clock.serveClockRemainingMs).toBe(8000);
    expect(clock.activeClock).toBe('bolt');
  });

  it('should ignore non-numeric values', () => {
    applyClockTick({
      boltTimerRemainingMs: 60000,
      serveClockRemainingMs: 5000,
      activeClock: 'bolt',
    });

    applyClockSync({
      boltTimerRemainingMs: 'invalid',
      serveClockRemainingMs: null,
    });

    const { clock } = getMatchState();
    expect(clock.boltTimerRemainingMs).toBe(60000);
    expect(clock.serveClockRemainingMs).toBe(5000);
  });
});
