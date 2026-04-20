<script lang="ts">
  import type { ClockState } from '../stores/matchState.svelte';

  let { clock }: { clock: ClockState } = $props();

  function formatMs(ms: number): string {
    if (ms <= 0) return '0:00';
    const totalSeconds = Math.ceil(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }

  let activeClock = $derived(clock.activeClock);
  let boltDisplay = $derived(formatMs(clock.boltTimerRemainingMs));
  let serveDisplay = $derived(formatMs(clock.serveClockRemainingMs));

  let secondaryDisplay = $derived(() => {
    if (activeClock === 'timeout' && clock.timeoutRemainingMs !== undefined) {
      return { label: 'TIMEOUT', value: formatMs(clock.timeoutRemainingMs) };
    }
    if (activeClock === 'break' && clock.breakRemainingMs !== undefined) {
      return { label: 'BREAK', value: formatMs(clock.breakRemainingMs) };
    }
    return null;
  });
</script>

<div class="clock-panel">
  <div class="clock-block" class:clock-active={activeClock === 'bolt'}>
    <div class="clock-label">BOLT</div>
    <div class="clock-value">{boltDisplay}</div>
  </div>
  <div class="clock-block">
    <div class="clock-label">SERVE</div>
    <div class="clock-value">{serveDisplay}</div>
  </div>
  {#if secondaryDisplay()}
    <div class="clock-block clock-active clock-secondary">
      <div class="clock-label">{secondaryDisplay()!.label}</div>
      <div class="clock-value">{secondaryDisplay()!.value}</div>
    </div>
  {/if}
</div>

<style>
  .clock-panel {
    display: flex;
    gap: 2em;
    font-family: 'JetBrains Mono', 'SF Mono', monospace;
    align-items: flex-start;
  }
  .clock-block {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.15em;
  }
  .clock-label {
    font-size: 0.75em;
    opacity: 0.5;
    text-transform: uppercase;
    letter-spacing: 0.2em;
  }
  .clock-value {
    font-size: 3em;
    font-weight: 700;
    font-variant-numeric: tabular-nums;
    line-height: 1;
  }
  .clock-active .clock-value {
    color: var(--arena-accent, #00e676);
  }
  .clock-active .clock-label {
    opacity: 0.8;
  }
  .clock-secondary {
    padding-left: 2em;
    border-left: 1px solid rgba(255, 255, 255, 0.1);
  }
</style>
