<script lang="ts">
  import type { SkinProps } from './skinProps';

  let { match, side1Player, side2Player, config, formatMs }: SkinProps = $props();

  let position = $derived(config.broadcastPosition ?? 'bottom');
  let opacity = $derived(config.broadcastOpacity ?? 0.85);

  let isComplete = $derived(match.matchUpStatus === 'COMPLETED');
  let isBreak = $derived(match.clock.activeClock === 'break');
</script>

<div class="broadcast-skin" class:pos-top={position === 'top'} class:pos-bottom={position === 'bottom'}>
  <div class="scorebug" style:--bug-opacity={opacity}>
    <!-- Side 1 -->
    <div class="bug-side side-1">
      {#if side1Player?.imageUrl}
        <img class="bug-avatar" src={side1Player.imageUrl} alt="" />
      {/if}
      {#if side1Player?.jerseyNumber}
        <span class="bug-jersey">#{side1Player.jerseyNumber}</span>
      {/if}
      <span class="bug-player">{side1Player?.participantName ?? ''}</span>
    </div>

    <div class="bug-team" class:serving={match.server === 0}>
      <span class="bug-team-name">{match.side1Name ?? 'Team 1'}</span>
    </div>

    <!-- Score -->
    <div class="bug-score-block">
      <div class="bug-arc">
        <span class="bug-arc-num" class:winner={isComplete && match.winningSide === 1}>{match.arcScore?.side1 ?? 0}</span>
        <span class="bug-dash">—</span>
        <span class="bug-arc-num" class:winner={isComplete && match.winningSide === 2}>{match.arcScore?.side2 ?? 0}</span>
      </div>
      {#if match.boltScore && !isComplete}
        <div class="bug-bolt">
          <span>{match.boltScore.side1}</span>
          <span class="bug-bolt-sep">·</span>
          <span>{match.boltScore.side2}</span>
        </div>
      {/if}
    </div>

    <div class="bug-team" class:serving={match.server === 1}>
      <span class="bug-team-name">{match.side2Name ?? 'Team 2'}</span>
    </div>

    <!-- Side 2 -->
    <div class="bug-side side-2">
      {#if side2Player?.jerseyNumber}
        <span class="bug-jersey">#{side2Player.jerseyNumber}</span>
      {/if}
      <span class="bug-player">{side2Player?.participantName ?? ''}</span>
      {#if side2Player?.imageUrl}
        <img class="bug-avatar" src={side2Player.imageUrl} alt="" />
      {/if}
    </div>

    <!-- Clock + Status -->
    <div class="bug-clock">
      {#if isComplete}
        <span class="bug-status-badge">FINAL</span>
      {:else if isBreak}
        <div class="bug-clock-value">{formatMs(match.clock.breakRemainingMs ?? 0)}</div>
        <div class="bug-clock-label">BREAK</div>
      {:else}
        <div class="bug-clock-value" class:clock-active={match.clock.activeClock === 'bolt'}>{formatMs(match.clock.boltTimerRemainingMs)}</div>
        <div class="bug-clock-label">BOLT</div>
      {/if}
    </div>

    <!-- Serve indicator -->
    {#if match.server !== undefined && !isComplete}
      <div class="bug-serve">
        {#if match.server === 0}
          <span class="serve-dot">◀</span>
        {/if}
        <span class="serve-court-label">{match.serveSide === 'AD' ? 'AD' : 'D'}</span>
        {#if match.server === 1}
          <span class="serve-dot">▶</span>
        {/if}
      </div>
    {/if}
  </div>
</div>

<style>
  .broadcast-skin {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: flex-end;
    pointer-events: none;
  }
  .broadcast-skin.pos-top {
    align-items: flex-start;
  }
  .scorebug {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 1em;
    padding: 0.6em 1.5em;
    background: rgba(10, 10, 10, var(--bug-opacity, 0.85));
    border-top: 1px solid rgba(255, 255, 255, 0.1);
    pointer-events: auto;
    flex-wrap: nowrap;
    min-height: 3.5em;
  }
  .pos-top .scorebug {
    border-top: none;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  }
  .bug-side {
    display: flex;
    align-items: center;
    gap: 0.5em;
    min-width: 0;
    flex-shrink: 1;
  }
  .bug-side.side-1 {
    border-left: 3px solid var(--arena-side1, #4fc3f7);
    padding-left: 0.5em;
  }
  .bug-side.side-2 {
    border-right: 3px solid var(--arena-side2, #ff7043);
    padding-right: 0.5em;
    flex-direction: row;
  }
  .bug-avatar {
    width: 2em;
    height: 2em;
    border-radius: 50%;
    object-fit: cover;
    flex-shrink: 0;
  }
  .bug-jersey {
    font-weight: 800;
    font-size: 0.85em;
    color: var(--arena-accent, #00e676);
    font-variant-numeric: tabular-nums;
  }
  .bug-player {
    font-size: 0.85em;
    font-weight: 600;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 10em;
  }
  .bug-team {
    flex-shrink: 0;
  }
  .bug-team-name {
    font-size: 1.1em;
    font-weight: 700;
    letter-spacing: 0.02em;
    transition: color 0.2s;
  }
  .bug-team.serving .bug-team-name {
    color: var(--arena-accent, #00e676);
  }
  .bug-score-block {
    display: flex;
    flex-direction: column;
    align-items: center;
    flex-shrink: 0;
    padding: 0 0.5em;
  }
  .bug-arc {
    display: flex;
    align-items: baseline;
    gap: 0.3em;
  }
  .bug-arc-num {
    font-size: 1.8em;
    font-weight: 900;
    font-variant-numeric: tabular-nums;
    line-height: 1;
  }
  .bug-arc-num.winner {
    color: var(--arena-accent, #00e676);
  }
  .bug-dash {
    font-size: 1.2em;
    opacity: 0.3;
  }
  .bug-bolt {
    display: flex;
    gap: 0.3em;
    font-size: 0.75em;
    opacity: 0.5;
    font-variant-numeric: tabular-nums;
  }
  .bug-bolt-sep {
    opacity: 0.4;
  }
  .bug-clock {
    display: flex;
    flex-direction: column;
    align-items: center;
    flex-shrink: 0;
    min-width: 4em;
  }
  .bug-clock-value {
    font-family: 'JetBrains Mono', 'SF Mono', monospace;
    font-size: 1.3em;
    font-weight: 700;
    font-variant-numeric: tabular-nums;
    line-height: 1;
  }
  .bug-clock-value.clock-active {
    color: var(--arena-accent, #00e676);
  }
  .bug-clock-label {
    font-size: 0.55em;
    opacity: 0.5;
    letter-spacing: 0.15em;
    text-transform: uppercase;
    font-family: 'JetBrains Mono', 'SF Mono', monospace;
  }
  .bug-status-badge {
    font-size: 0.75em;
    font-weight: 700;
    letter-spacing: 0.2em;
    color: var(--arena-accent, #00e676);
    border: 1px solid var(--arena-accent, #00e676);
    padding: 0.15em 0.5em;
    border-radius: 0.2em;
  }
  .bug-serve {
    display: flex;
    align-items: center;
    gap: 0.25em;
    flex-shrink: 0;
    font-size: 0.8em;
    opacity: 0.6;
  }
  .serve-dot {
    color: var(--arena-accent, #00e676);
    font-size: 0.8em;
  }
  .serve-court-label {
    font-weight: 700;
    font-size: 0.85em;
    letter-spacing: 0.1em;
  }
</style>
