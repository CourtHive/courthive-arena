import { applyIntennseSnapshot, applyTeamBranding, getMatchState, resetMatchState } from '../matchState.svelte';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { getSkinConfig } from '../skinConfig.svelte';

vi.mock('../../relay/roster', () => ({ mergeRelayRoster: vi.fn() }));
const frame = {
  matchUpId: 'one',
  teams: { 1: { participantId: 'alpha', participantName: 'Alpha', colors: { primary: '#aabbcc' } } },
};
beforeEach(() => resetMatchState('one'));

describe('match-scoped team branding', () => {
  it('replays identity without a live score and preserves it through legacy snapshots', () => {
    const preferences = JSON.stringify(getSkinConfig());
    applyTeamBranding(frame);
    expect(getMatchState().side1Name).toBe('Alpha');
    expect(getMatchState().teamBranding?.teams[1]?.colors?.primary).toBe('#AABBCC');
    applyIntennseSnapshot({ matchUpId: 'one', boltScore: { side1: 3, side2: 2 } });
    expect(getMatchState().teamBranding?.teams[1]?.participantId).toBe('alpha');
    expect(JSON.stringify(getSkinConfig())).toBe(preferences);
  });
  it('clears colors by complete replacement and cannot leak across match changes', () => {
    applyTeamBranding(frame);
    applyTeamBranding({ matchUpId: 'one', teams: { 1: { participantId: 'alpha', participantName: 'Alpha' } } });
    expect(getMatchState().teamBranding?.teams[1]?.colors).toBeUndefined();
    applyTeamBranding(frame);
    resetMatchState('two');
    applyTeamBranding(frame);
    expect(getMatchState().teamBranding).toBeUndefined();
    expect(getMatchState().side1Name).toBeUndefined();
  });
  it('refuses malformed metadata without overwriting a good frame', () => {
    applyTeamBranding(frame);
    const before = JSON.stringify(getMatchState());
    for (const teams of [
      [],
      { 0: { participantId: 'a' } },
      { 1: { participantId: 'alpha', colors: { primary: 'red' } } },
    ]) {
      applyTeamBranding({ matchUpId: 'one', teams });
      expect(JSON.stringify(getMatchState())).toBe(before);
    }
  });
});
