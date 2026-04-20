<script lang="ts">
  import PenaltyBox from '../PenaltyBox.svelte';
  import { getPlayerOrFallback } from '../../relay/roster';
  import type { SkinProps } from './skinProps';

  let { match, side1Player, side2Player, formatMs }: SkinProps = $props();

  let isComplete = $derived(match.matchUpStatus === 'COMPLETED');
  let isBreak = $derived(match.clock.activeClock === 'break');

  let stats = $derived(Object.entries(match.lastSnapshot?.playerStats ?? {}));

  function isSide(participantId: string, side: number): boolean {
    const snapshot = match.lastSnapshot;
    if (!snapshot?.playerStats?.[participantId]) return false;
    const ps = snapshot.playerStats[participantId];
    if (ps.sideNumber) return ps.sideNumber === side;
    const sideKey = side === 1 ? 'side1' : 'side2';
    const active = snapshot.activePlayers?.[sideKey] ?? [];
    return Array.isArray(active) ? active.includes(participantId) : active === participantId;
  }

  let side1Stats = $derived(
    stats.filter(([id]) => isSide(id, 1)).map(([id, s]) => ({ player: getPlayerOrFallback(id), stats: s as any })),
  );
  let side2Stats = $derived(
    stats.filter(([id]) => isSide(id, 2)).map(([id, s]) => ({ player: getPlayerOrFallback(id), stats: s as any })),
  );
</script>

<div class="dashboard-skin">
  <!-- Score header -->
  <div class="dash-header">
    <div class="dash-team-block side-1">
      <div class="dash-side-bar"></div>
      <div class="dash-team-info">
        <div class="dash-team-name" class:serving={match.server === 0}>{match.side1Name ?? 'Team 1'}</div>
        {#if side1Player}
          <div class="dash-active-player">
            {#if side1Player.jerseyNumber}<span class="dash-jersey">#{side1Player.jerseyNumber}</span>{/if}
            {side1Player.participantName}
          </div>
        {/if}
      </div>
      <div class="dash-score-col">
        <div class="dash-arc">{match.arcScore?.side1 ?? 0}</div>
        {#if match.boltScore && !isComplete}
          <div class="dash-bolt">{match.boltScore.side1}</div>
        {/if}
      </div>
    </div>

    <div class="dash-center">
      {#if isComplete}
        <div class="dash-status">FINAL</div>
      {:else if isBreak}
        <div class="dash-clock-block">
          <div class="dash-clock-label">BREAK</div>
          <div class="dash-clock-value active">{formatMs(match.clock.breakRemainingMs ?? 0)}</div>
        </div>
      {:else}
        <div class="dash-clock-block">
          <div class="dash-clock-label">BOLT</div>
          <div class="dash-clock-value" class:active={match.clock.activeClock === 'bolt'}>{formatMs(match.clock.boltTimerRemainingMs)}</div>
        </div>
        <div class="dash-serve-info">
          {#if match.server !== undefined}
            <span class="dash-arrow" class:active={match.server === 0}>◀</span>
            <span class="dash-court">{match.serveSide === 'AD' ? 'AD' : 'DEUCE'}</span>
            <span class="dash-arrow" class:active={match.server === 1}>▶</span>
          {/if}
        </div>
        <div class="dash-clock-block secondary">
          <div class="dash-clock-label">SERVE</div>
          <div class="dash-clock-value">{formatMs(match.clock.serveClockRemainingMs)}</div>
        </div>
      {/if}
    </div>

    <div class="dash-team-block side-2">
      <div class="dash-score-col">
        <div class="dash-arc">{match.arcScore?.side2 ?? 0}</div>
        {#if match.boltScore && !isComplete}
          <div class="dash-bolt">{match.boltScore.side2}</div>
        {/if}
      </div>
      <div class="dash-team-info right">
        <div class="dash-team-name" class:serving={match.server === 1}>{match.side2Name ?? 'Team 2'}</div>
        {#if side2Player}
          <div class="dash-active-player">
            {#if side2Player.jerseyNumber}<span class="dash-jersey">#{side2Player.jerseyNumber}</span>{/if}
            {side2Player.participantName}
          </div>
        {/if}
      </div>
      <div class="dash-side-bar bar-2"></div>
    </div>
  </div>

  <!-- Stats table -->
  <div class="dash-stats">
    <div class="dash-stats-panel">
      <div class="dash-panel-header">{match.side1Name ?? 'Team 1'}</div>
      {#if side1Stats.length > 0}
        <div class="dash-stat-header-row">
          <span class="dash-stat-name-col">Player</span>
          <span class="dash-stat-val">PTS</span>
          <span class="dash-stat-val">W</span>
          <span class="dash-stat-val">A</span>
          <span class="dash-stat-val">UE</span>
        </div>
        {#each side1Stats as { player, stats }}
          <div class="dash-stat-row">
            <span class="dash-stat-name-col">
              {#if player.jerseyNumber}<span class="dash-jersey">#{player.jerseyNumber}</span>{/if}
              {player.participantName}
            </span>
            <span class="dash-stat-val">{stats.pointsWon ?? 0}</span>
            <span class="dash-stat-val">{stats.winners ?? 0}</span>
            <span class="dash-stat-val">{stats.aces ?? 0}</span>
            <span class="dash-stat-val">{stats.unforcedErrors ?? 0}</span>
          </div>
        {/each}
      {:else}
        <div class="dash-no-stats">No player stats yet</div>
      {/if}
    </div>

    <div class="dash-stats-panel">
      <div class="dash-panel-header">{match.side2Name ?? 'Team 2'}</div>
      {#if side2Stats.length > 0}
        <div class="dash-stat-header-row">
          <span class="dash-stat-name-col">Player</span>
          <span class="dash-stat-val">PTS</span>
          <span class="dash-stat-val">W</span>
          <span class="dash-stat-val">A</span>
          <span class="dash-stat-val">UE</span>
        </div>
        {#each side2Stats as { player, stats }}
          <div class="dash-stat-row">
            <span class="dash-stat-name-col">
              {#if player.jerseyNumber}<span class="dash-jersey">#{player.jerseyNumber}</span>{/if}
              {player.participantName}
            </span>
            <span class="dash-stat-val">{stats.pointsWon ?? 0}</span>
            <span class="dash-stat-val">{stats.winners ?? 0}</span>
            <span class="dash-stat-val">{stats.aces ?? 0}</span>
            <span class="dash-stat-val">{stats.unforcedErrors ?? 0}</span>
          </div>
        {/each}
      {:else}
        <div class="dash-no-stats">No player stats yet</div>
      {/if}
    </div>
  </div>

  <!-- Penalties -->
  {#if (match.penaltyBox ?? []).length > 0}
    <div class="dash-penalty">
      <PenaltyBox penalties={match.penaltyBox ?? []} />
    </div>
  {/if}
</div>

<style>
  .dashboard-skin {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    padding: 1.5em;
    gap: 1.5em;
    overflow-y: auto;
  }

  /* Header */
  .dash-header {
    display: grid;
    grid-template-columns: 1fr auto 1fr;
    gap: 1em;
    align-items: center;
    flex-shrink: 0;
  }
  .dash-team-block {
    display: flex;
    align-items: center;
    gap: 0.75em;
  }
  .dash-team-block.side-2 {
    justify-content: flex-end;
  }
  .dash-side-bar {
    width: 4px;
    align-self: stretch;
    border-radius: 2px;
    background: var(--arena-side1, #4fc3f7);
  }
  .dash-side-bar.bar-2 {
    background: var(--arena-side2, #ff7043);
  }
  .dash-team-info {
    display: flex;
    flex-direction: column;
    min-width: 0;
  }
  .dash-team-info.right {
    text-align: right;
    align-items: flex-end;
  }
  .dash-team-name {
    font-size: 1.3em;
    font-weight: 700;
    transition: color 0.2s;
  }
  .dash-team-name.serving {
    color: var(--arena-accent, #00e676);
  }
  .dash-active-player {
    font-size: 0.8em;
    opacity: 0.5;
    display: flex;
    gap: 0.4em;
    align-items: baseline;
  }
  .dash-score-col {
    display: flex;
    align-items: baseline;
    gap: 0.3em;
    flex-shrink: 0;
  }
  .dash-arc {
    font-size: 3em;
    font-weight: 900;
    font-variant-numeric: tabular-nums;
    line-height: 1;
  }
  .dash-bolt {
    font-size: 1.2em;
    font-weight: 600;
    opacity: 0.35;
    font-variant-numeric: tabular-nums;
  }
  .dash-center {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.3em;
    min-width: 160px;
  }
  .dash-clock-block {
    display: flex;
    align-items: baseline;
    gap: 0.4em;
  }
  .dash-clock-block.secondary {
    opacity: 0.4;
  }
  .dash-clock-label {
    font-size: 0.6em;
    letter-spacing: 0.15em;
    opacity: 0.5;
    font-family: 'JetBrains Mono', 'SF Mono', monospace;
  }
  .dash-clock-value {
    font-size: 1.8em;
    font-weight: 700;
    font-variant-numeric: tabular-nums;
    font-family: 'JetBrains Mono', 'SF Mono', monospace;
    line-height: 1;
  }
  .dash-clock-value.active {
    color: var(--arena-accent, #00e676);
  }
  .dash-serve-info {
    display: flex;
    align-items: center;
    gap: 0.5em;
    font-size: 0.9em;
    font-weight: 700;
  }
  .dash-arrow {
    opacity: 0.15;
    transition: opacity 0.2s, color 0.2s;
  }
  .dash-arrow.active {
    opacity: 1;
    color: var(--arena-accent, #00e676);
  }
  .dash-court {
    letter-spacing: 0.1em;
    min-width: 3.5em;
    text-align: center;
  }
  .dash-status {
    font-size: 1em;
    font-weight: 700;
    letter-spacing: 0.3em;
    color: var(--arena-accent, #00e676);
    border: 1px solid var(--arena-accent, #00e676);
    padding: 0.2em 1em;
    border-radius: 0.2em;
  }

  /* Stats */
  .dash-stats {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1.5em;
    flex: 1;
    min-height: 0;
  }
  .dash-stats-panel {
    display: flex;
    flex-direction: column;
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 0.5em;
    padding: 0.75em 1em;
    overflow-y: auto;
  }
  .dash-panel-header {
    font-size: 0.7em;
    font-weight: 700;
    letter-spacing: 0.15em;
    text-transform: uppercase;
    opacity: 0.4;
    padding-bottom: 0.5em;
    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
    margin-bottom: 0.3em;
  }
  .dash-stat-header-row {
    display: flex;
    gap: 0.5em;
    font-size: 0.65em;
    font-weight: 700;
    opacity: 0.35;
    letter-spacing: 0.1em;
    padding: 0.3em 0;
  }
  .dash-stat-row {
    display: flex;
    gap: 0.5em;
    padding: 0.4em 0;
    font-size: 0.85em;
    border-bottom: 1px solid rgba(255, 255, 255, 0.04);
  }
  .dash-stat-name-col {
    flex: 1;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    display: flex;
    gap: 0.4em;
    align-items: baseline;
  }
  .dash-stat-val {
    width: 3em;
    text-align: right;
    font-variant-numeric: tabular-nums;
    flex-shrink: 0;
  }
  .dash-jersey {
    font-weight: 800;
    color: var(--arena-accent, #00e676);
    font-variant-numeric: tabular-nums;
  }
  .dash-no-stats {
    font-size: 0.8em;
    opacity: 0.3;
    padding: 1em 0;
    text-align: center;
  }
  .dash-penalty {
    flex-shrink: 0;
  }
</style>
