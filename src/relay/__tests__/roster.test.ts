import { isRosterCompetitor } from '../rosterCompetitors';
import { describe, expect, it } from 'vitest';

/**
 * The roster cache had NO filter — every participant the factory route returned became a PlayerInfo.
 * A GROUP has no `person`, so its own name became the player name and a coach's stable or a transport
 * cohort appeared on the scoreboard as a competitor.
 */

const player = { participantId: 'p1', participantType: 'INDIVIDUAL', participantRole: 'COMPETITOR' };
const roleless = { participantId: 'p2', participantType: 'INDIVIDUAL' };
const official = { participantId: 's1', participantType: 'INDIVIDUAL', participantRole: 'OFFICIAL' };
const physio = { participantId: 's2', participantType: 'INDIVIDUAL', participantRole: 'PHYSIO' };
const group = { participantId: 'g1', participantType: 'GROUP', participantRole: 'COACH', participantName: 'Van A' };
const pair = { participantId: 'd1', participantType: 'PAIR', participantRole: 'COMPETITOR' };
const team = { participantId: 't1', participantType: 'TEAM', participantRole: 'COMPETITOR' };

describe('isRosterCompetitor', () => {
  it('admits competitors', () => {
    expect(isRosterCompetitor(player)).toBe(true);
  });

  it('admits a participant carrying NO role', () => {
    // An empty scoreboard roster is a worse failure than the one being fixed, so an absent role is
    // treated as a player — records written before the role was universally present hold real players.
    expect(isRosterCompetitor(roleless)).toBe(true);
  });

  it('rejects personnel', () => {
    expect(isRosterCompetitor(official)).toBe(false);
    expect(isRosterCompetitor(physio)).toBe(false);
  });

  it('rejects a GROUP, which has no person and took its own name', () => {
    expect(isRosterCompetitor(group)).toBe(false);
  });

  it('KEEPS PAIR and TEAM — a doubles or tie side is one of these participantIds', () => {
    // Deliberately different from the tournament card's player COUNT, which excludes them. Counting a
    // pair alongside its members double-counts; failing to resolve a pair blanks the scoreboard.
    expect(isRosterCompetitor(pair)).toBe(true);
    expect(isRosterCompetitor(team)).toBe(true);
  });

  it('tolerates malformed entries without throwing', () => {
    expect(isRosterCompetitor(undefined)).toBe(true);
    expect(isRosterCompetitor({})).toBe(true);
  });
});
