<script lang="ts">
  import type { SkinProps } from './skinProps';

  let { match, formatMs }: SkinProps = $props();

  let isComplete = $derived(match.matchUpStatus === 'COMPLETED');
  let isBreak = $derived(match.clock.activeClock === 'break');
</script>

<div class="minimal-skin">
  <div class="minimal-scores">
    <div class="minimal-row" class:serving={match.server === 0} class:winner={isComplete && match.winningSide === 1}>
      <div class="minimal-serve-bar" class:active={match.server === 0}></div>
      <div class="minimal-team">{match.side1Name ?? 'Team 1'}</div>
      <div class="minimal-arc">{match.arcScore?.side1 ?? 0}</div>
    </div>
    <div class="minimal-row" class:serving={match.server === 1} class:winner={isComplete && match.winningSide === 2}>
      <div class="minimal-serve-bar" class:active={match.server === 1}></div>
      <div class="minimal-team">{match.side2Name ?? 'Team 2'}</div>
      <div class="minimal-arc">{match.arcScore?.side2 ?? 0}</div>
    </div>
  </div>

  {#if isComplete}
    <div class="minimal-status">FINAL</div>
  {:else}
    <div class="minimal-clock" class:clock-active={match.clock.activeClock === 'bolt' || isBreak}>
      {formatMs(isBreak ? (match.clock.breakRemainingMs ?? 0) : match.clock.boltTimerRemainingMs)}
    </div>
    {#if isBreak}
      <div class="minimal-label">BREAK</div>
    {/if}
  {/if}
</div>

<style>
  .minimal-skin {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    gap: 1.5em;
    padding: 2em;
  }
  .minimal-scores {
    display: flex;
    flex-direction: column;
    gap: 0.5em;
  }
  .minimal-row {
    display: flex;
    align-items: baseline;
    gap: 1em;
    opacity: 0.6;
    transition: opacity 0.3s;
  }
  .minimal-row.serving,
  .minimal-row.winner {
    opacity: 1;
  }
  .minimal-serve-bar {
    width: 4px;
    height: 1.2em;
    border-radius: 2px;
    background: transparent;
    align-self: center;
    transition: background 0.2s;
  }
  .minimal-serve-bar.active {
    background: var(--arena-accent, #00e676);
  }
  .minimal-team {
    font-size: 2.5em;
    font-weight: 600;
    min-width: 6em;
    letter-spacing: 0.02em;
  }
  .minimal-arc {
    font-size: 4em;
    font-weight: 900;
    font-variant-numeric: tabular-nums;
    line-height: 1;
    min-width: 1.5em;
    text-align: right;
  }
  .minimal-clock {
    font-family: 'JetBrains Mono', 'SF Mono', monospace;
    font-size: 3em;
    font-weight: 700;
    font-variant-numeric: tabular-nums;
    opacity: 0.5;
    transition: opacity 0.2s, color 0.2s;
  }
  .minimal-clock.clock-active {
    opacity: 1;
    color: var(--arena-accent, #00e676);
  }
  .minimal-label {
    font-size: 0.8em;
    letter-spacing: 0.3em;
    opacity: 0.4;
    font-weight: 700;
  }
  .minimal-status {
    font-size: 1em;
    font-weight: 700;
    letter-spacing: 0.3em;
    color: var(--arena-accent, #00e676);
  }
</style>
