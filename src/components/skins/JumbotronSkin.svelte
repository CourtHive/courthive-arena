<script lang="ts">
  import type { SkinProps } from './skinProps';

  let { match, config, formatMs }: SkinProps = $props();

  let showBolt = $derived(config.jumbotronShowBolt ?? true);
  let showServeClock = $derived(config.jumbotronShowServeClock ?? true);
  let isComplete = $derived(match.matchUpStatus === 'COMPLETED');
  let isBreak = $derived(match.clock.activeClock === 'break');
</script>

<div class="jumbotron-skin">
  {#if isComplete}
    <div class="jumbo-badge">FINAL</div>
  {:else if isBreak}
    <div class="jumbo-badge">BREAK</div>
  {/if}

  <!-- Side 1 -->
  <div class="jumbo-row" class:serving={match.server === 0} class:winner={isComplete && match.winningSide === 1}>
    <div class="jumbo-side-color side-1-bar"></div>
    <div class="jumbo-team">{match.side1Name ?? 'Team 1'}</div>
    <div class="jumbo-score-group">
      <div class="jumbo-arc">{match.arcScore?.side1 ?? 0}</div>
      {#if showBolt && match.boltScore && !isComplete}
        <div class="jumbo-bolt">{match.boltScore.side1}</div>
      {/if}
    </div>
  </div>

  <!-- Center: clocks + serve -->
  <div class="jumbo-center">
    {#if !isComplete}
      <div class="jumbo-clock-row">
        {#if match.server !== undefined}
          <span class="jumbo-serve-arrow" class:active={match.server === 0}>▲</span>
        {/if}
        <div class="jumbo-clock">
          <span class="jumbo-clock-label">{isBreak ? 'BREAK' : 'BOLT'}</span>
          <span class="jumbo-clock-value" class:clock-active={match.clock.activeClock === 'bolt' || isBreak}>
            {formatMs(isBreak ? (match.clock.breakRemainingMs ?? 0) : match.clock.boltTimerRemainingMs)}
          </span>
        </div>
        {#if showServeClock && !isBreak}
          <div class="jumbo-clock secondary">
            <span class="jumbo-clock-label">SERVE</span>
            <span class="jumbo-clock-value">{formatMs(match.clock.serveClockRemainingMs)}</span>
          </div>
        {/if}
        {#if match.server !== undefined}
          <span class="jumbo-serve-arrow" class:active={match.server === 1}>▼</span>
        {/if}
      </div>
    {/if}
  </div>

  <!-- Side 2 -->
  <div class="jumbo-row" class:serving={match.server === 1} class:winner={isComplete && match.winningSide === 2}>
    <div class="jumbo-side-color side-2-bar"></div>
    <div class="jumbo-team">{match.side2Name ?? 'Team 2'}</div>
    <div class="jumbo-score-group">
      <div class="jumbo-arc">{match.arcScore?.side2 ?? 0}</div>
      {#if showBolt && match.boltScore && !isComplete}
        <div class="jumbo-bolt">{match.boltScore.side2}</div>
      {/if}
    </div>
  </div>
</div>

<style>
  .jumbotron-skin {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    padding: 1em 2em;
    gap: 0;
  }
  .jumbo-badge {
    font-size: 1.5em;
    font-weight: 700;
    letter-spacing: 0.4em;
    color: var(--arena-accent, #00e676);
    margin-bottom: 0.5em;
  }
  .jumbo-row {
    display: flex;
    align-items: center;
    width: 100%;
    max-width: 1200px;
    padding: 0.3em 0;
    gap: 0.75em;
    opacity: 0.7;
    transition: opacity 0.3s;
  }
  .jumbo-row.serving,
  .jumbo-row.winner {
    opacity: 1;
  }
  .jumbo-side-color {
    width: 6px;
    align-self: stretch;
    border-radius: 3px;
    flex-shrink: 0;
  }
  .side-1-bar { background: var(--arena-side1, #4fc3f7); }
  .side-2-bar { background: var(--arena-side2, #ff7043); }
  .jumbo-team {
    font-size: 2.5em;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    flex: 1;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .jumbo-row.serving .jumbo-team {
    color: var(--arena-accent, #00e676);
  }
  .jumbo-score-group {
    display: flex;
    align-items: baseline;
    gap: 0.4em;
    flex-shrink: 0;
  }
  .jumbo-arc {
    font-size: 8em;
    font-weight: 900;
    font-variant-numeric: tabular-nums;
    line-height: 1;
  }
  .jumbo-bolt {
    font-size: 2em;
    font-weight: 600;
    opacity: 0.35;
    font-variant-numeric: tabular-nums;
    align-self: flex-end;
    margin-bottom: 0.2em;
  }
  .jumbo-center {
    width: 100%;
    max-width: 1200px;
    display: flex;
    justify-content: center;
    padding: 0.3em 0;
  }
  .jumbo-clock-row {
    display: flex;
    align-items: center;
    gap: 1.5em;
  }
  .jumbo-clock {
    display: flex;
    align-items: baseline;
    gap: 0.5em;
  }
  .jumbo-clock.secondary {
    opacity: 0.4;
  }
  .jumbo-clock-label {
    font-size: 0.9em;
    font-weight: 700;
    letter-spacing: 0.2em;
    opacity: 0.5;
    font-family: 'JetBrains Mono', 'SF Mono', monospace;
  }
  .jumbo-clock-value {
    font-size: 2.5em;
    font-weight: 700;
    font-variant-numeric: tabular-nums;
    font-family: 'JetBrains Mono', 'SF Mono', monospace;
    line-height: 1;
  }
  .jumbo-clock-value.clock-active {
    color: var(--arena-accent, #00e676);
  }
  .jumbo-serve-arrow {
    font-size: 1.5em;
    opacity: 0.15;
    transition: opacity 0.2s, color 0.2s;
  }
  .jumbo-serve-arrow.active {
    opacity: 1;
    color: var(--arena-accent, #00e676);
  }
</style>
