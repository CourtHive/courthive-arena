/**
 * Fetches tournament participant roster from the local factory server.
 * Resolves participant IDs to display-ready data: name, jersey number,
 * and image URL from onlineResources.
 */

// Default to same hostname as the page, port 8383 — works on LAN without config
const FACTORY_URL = import.meta.env.VITE_FACTORY_URL || `http://${window.location.hostname}:8383`;

export interface PlayerInfo {
  participantId: string;
  participantName: string;
  jerseyNumber?: string;
  imageUrl?: string;
  teamName?: string;
  sideNumber?: number;
}

let rosterCache: Map<string, PlayerInfo> = new Map();
let cachedTournamentId: string | undefined;

/**
 * Fetch the participant roster for a tournament from the factory server.
 * Builds a lookup map of participantId → PlayerInfo.
 */
export async function fetchRoster(tournamentId: string): Promise<Map<string, PlayerInfo>> {
  if (cachedTournamentId === tournamentId && rosterCache.size > 0) {
    return rosterCache;
  }

  try {
    const response = await fetch(`${FACTORY_URL}/factory/participants`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ params: { tournamentId } }),
    });

    if (!response.ok) {
      console.warn(`[roster] fetch failed: HTTP ${response.status}`);
      return rosterCache;
    }

    const data = await response.json();
    const participants = data?.participants ?? [];
    const map = new Map<string, PlayerInfo>();

    for (const p of participants) {
      const info: PlayerInfo = {
        participantId: p.participantId,
        participantName: p.participantName ?? buildNameFromPerson(p.person),
        jerseyNumber: resolveJerseyNumber(p),
        imageUrl: resolveImageUrl(p),
      };
      map.set(p.participantId, info);
    }

    rosterCache = map;
    cachedTournamentId = tournamentId;
    console.log(`[roster] loaded ${map.size} participants for ${tournamentId}`);
    return map;
  } catch (err) {
    console.warn(`[roster] fetch error: ${(err as Error).message}`);
    return rosterCache;
  }
}

/**
 * Look up a participant by ID from the cached roster.
 */
export function getPlayer(participantId: string): PlayerInfo | undefined {
  return rosterCache.get(participantId);
}

/**
 * Look up a player, returning a fallback with just the ID as the name.
 */
export function getPlayerOrFallback(participantId: string): PlayerInfo {
  return rosterCache.get(participantId) ?? {
    participantId,
    participantName: participantId.slice(0, 8),
  };
}

/**
 * Merge roster data from an intennse relay snapshot into the cache.
 * The relay carries a `roster` map so arena clients can resolve IDs
 * without needing a factory server fetch.
 */
export function mergeRelayRoster(roster: Record<string, any>): void {
  for (const [id, detail] of Object.entries(roster)) {
    if (!rosterCache.has(id)) {
      rosterCache.set(id, {
        participantId: id,
        participantName: detail.participantName ?? id.slice(0, 8),
        jerseyNumber: detail.jerseyNumber,
        imageUrl: detail.imageUrl,
        sideNumber: detail.sideNumber,
      });
    }
  }
}

export function clearRoster(): void {
  rosterCache.clear();
  cachedTournamentId = undefined;
}

// --- Private helpers ---

function buildNameFromPerson(person: any): string {
  if (!person) return '';
  const given = person.standardGivenName ?? '';
  const family = person.standardFamilyName ?? '';
  return `${given} ${family}`.trim();
}

/**
 * Resolve jersey number from participant extensions or person extensions.
 * Convention: extension named 'jerseyNumber' with a string or number value.
 */
function resolveJerseyNumber(participant: any): string | undefined {
  const ext = findExtension(participant, 'jerseyNumber')
    ?? findExtension(participant?.person, 'jerseyNumber');
  if (ext?.value !== undefined) return String(ext.value);
  return undefined;
}

/**
 * Resolve player image URL from onlineResources on the participant or person.
 * Looks for resourceType 'URL' with resourceSubType 'PHOTO' or name 'playerImage'.
 */
function resolveImageUrl(participant: any): string | undefined {
  const resources = participant?.onlineResources ?? participant?.person?.onlineResources ?? [];
  for (const r of resources) {
    if (r.resourceSubType === 'PHOTO' || r.name === 'playerImage') {
      return r.identifier ?? r.name;
    }
  }
  return undefined;
}

function findExtension(obj: any, name: string): any {
  if (!obj?.extensions) return undefined;
  return obj.extensions.find((e: any) => e.name === name);
}
