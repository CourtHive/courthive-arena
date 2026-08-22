/**
 * Who belongs in the roster cache.
 *
 * `fetchRoster` had NO filter: every participant the factory route returned became a `PlayerInfo`.
 * That included personnel — an OFFICIAL or a PHYSIO is an INDIVIDUAL participant exactly as a player
 * is — and GROUPs, which have no `person` at all, so `participantName` fell through to the group's own
 * name and a coach's stable or a transport cohort appeared on the scoreboard as a player.
 *
 * CFS now filters its public participants route, so this is defence in depth rather than an active
 * leak — but arena was the only one of the three named consumers with no guard of its own, and the
 * scoreboard is the surface where a wrong name is most visible.
 *
 * Lives in its own module so it can be tested: `roster.ts` reads `window.location.hostname` at module
 * scope to derive the factory URL, and this repo's vitest runner has no DOM.
 */

/**
 * "Has a role and it is not COMPETITOR", never "is COMPETITOR": a participant carrying no role is a
 * player from a record written before the role was universally present, and an empty scoreboard roster
 * is a worse failure than the one being fixed. Same phrasing as the factory's entry gate, CFS's public
 * route, and courthive-public's Players tab.
 *
 * PAIR and TEAM are deliberately KEPT, unlike in the tournament card's player COUNT. This is a
 * participantId → display lookup, and a doubles or tie side IS a PAIR or TEAM participantId — dropping
 * them would leave those sides unresolvable. Counting and resolving want different sets: counting a
 * pair alongside its members double-counts, whereas failing to resolve a pair blanks the scoreboard.
 */
export function isRosterCompetitor(participant: any): boolean {
  if (participant?.participantType === 'GROUP') return false;
  return !participant?.participantRole || participant.participantRole === 'COMPETITOR';
}
