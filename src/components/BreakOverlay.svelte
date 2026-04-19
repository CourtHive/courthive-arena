<script lang="ts">
  import type { MatchState } from '../stores/matchState.svelte';
  import type { ClockState } from '../stores/matchState.svelte';
  import { getPlayerOrFallback } from '../relay/roster';

  let { match, clock }: { match: MatchState; clock: ClockState } = $props();

  let stats = $derived(Object.entries(match.lastSnapshot?.playerStats ?? {}));

  // Split stats by side based on roster or snapshot activePlayers
  let side1Stats = $derived(
    stats.filter(([id]) => isSide(id, 1)).map(([id, s]) => ({ player: getPlayerOrFallback(id), stats: s as any })),
  );
  let side2Stats = $derived(
    stats.filter(([id]) => isSide(id, 2)).map(([id, s]) => ({ player: getPlayerOrFallback(id), stats: s as any })),
  );

  function isSide(participantId: string, side: number): boolean {
    const snapshot = match.lastSnapshot;
    if (!snapshot?.playerStats?.[participantId]) return false;
    // Use the playerStats.sideNumber if available, otherwise infer from teams
    const ps = snapshot.playerStats[participantId];
    if (ps.sideNumber) return ps.sideNumber === side;
    // Fallback: check activePlayers arrays
    const sideKey = side === 1 ? 'side1' : 'side2';
    const active = snapshot.activePlayers?.[sideKey] ?? [];
    return Array.isArray(active) ? active.includes(participantId) : active === participantId;
  }

  function formatMs(ms: number): string {
    if (ms <= 0) return '0:00';
    const totalSeconds = Math.ceil(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }
</script>

<div class="break-overlay">
  <div class="break-header">
    <div class="break-label">BREAK</div>
    {#if clock.breakRemainingMs !== undefined}
      <div class="break-clock">{formatMs(clock.breakRemainingMs)}</div>
    {/if}
  </div>

  <div class="score-summary">
    <div class="team-score">
      <div class="team-name">{match.side1Name ?? 'Team 1'}</div>
      <div class="arc-total">{match.arcScore?.side1 ?? 0}</div>
    </div>
    <div class="divider">—</div>
    <div class="team-score">
      <div class="arc-total">{match.arcScore?.side2 ?? 0}</div>
      <div class="team-name">{match.side2Name ?? 'Team 2'}</div>
    </div>
  </div>

  <div class="stats-grid">
    <div class="stats-column">
      <div class="column-header">{match.side1Name ?? 'Team 1'}</div>
      {#each side1Stats as { player, stats }}
        <div class="stat-row">
          <div class="stat-player">
            {#if player.jerseyNumber}<span class="stat-jersey">#{player.jerseyNumber}</span>{/if}
            <span>{player.participantName}</span>
          </div>
          <div class="stat-values">
            <span title="Points won">{stats.pointsWon ?? 0}pts</span>
            <span title="Winners">{stats.winners ?? 0}W</span>
            <span title="Aces">{stats.aces ?? 0}A</span>
            <span title="Unforced errors">{stats.unforcedErrors ?? 0}UE</span>
          </div>
        </div>
      {/each}
    </div>

    <div class="stats-column">
      <div class="column-header">{match.side2Name ?? 'Team 2'}</div>
      {#each side2Stats as { player, stats }}
        <div class="stat-row">
          <div class="stat-player">
            {#if player.jerseyNumber}<span class="stat-jersey">#{player.jerseyNumber}</span>{/if}
            <span>{player.participantName}</span>
          </div>
          <div class="stat-values">
            <span title="Points won">{stats.pointsWon ?? 0}pts</span>
            <span title="Winners">{stats.winners ?? 0}W</span>
            <span title="Aces">{stats.aces ?? 0}A</span>
            <span title="Unforced errors">{stats.unforcedErrors ?? 0}UE</span>
          </div>
        </div>
      {/each}
    </div>
  </div>
</div>

<style>
  .break-overlay {
    width: 100%;
    max-width: 1200px;
    display: flex;
    flex-direction: column;
    gap: 2em;
  }
  .break-header {
    display: flex;
    justify-content: center;
    align-items: baseline;
    gap: 1.5em;
  }
  .break-label {
    font-size: 1.2em;
    font-weight: 700;
    letter-spacing: 0.2em;
    opacity: 0.5;
  }
  .break-clock {
    font-family: 'JetBrains Mono', 'SF Mono', monospace;
    font-size: 2.5em;
    font-weight: 700;
    font-variant-numeric: tabular-nums;
    color: var(--arena-accent, #00e676);
  }
  .score-summary {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 2em;
  }
  .team-score {
    display: flex;
    align-items: baseline;
    gap: 0.75em;
  }
  .team-name {
    font-size: 1.3em;
    font-weight: 600;
  }
  .arc-total {
    font-size: 3em;
    font-weight: 900;
    font-variant-numeric: tabular-nums;
  }
  .divider {
    font-size: 2em;
    opacity: 0.3;
  }
  .stats-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 2em;
  }
  .stats-column {
    display: flex;
    flex-direction: column;
    gap: 0.5em;
  }
  .column-header {
    font-size: 0.8em;
    font-weight: 700;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    opacity: 0.5;
    padding-bottom: 0.5em;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  }
  .stat-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.4em 0;
  }
  .stat-player {
    display: flex;
    gap: 0.5em;
    align-items: baseline;
  }
  .stat-jersey {
    font-weight: 800;
    color: var(--arena-accent, #00e676);
    min-width: 2em;
  }
  .stat-values {
    display: flex;
    gap: 0.75em;
    font-size: 0.85em;
    opacity: 0.7;
    font-variant-numeric: tabular-nums;
  }
</style>
