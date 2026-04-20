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
  <div class="clock-row">
    <span class="clock-label">BOLT</span>
    <span class="clock-value" class:clock-active={activeClock === 'bolt'}>{boltDisplay}</span>
  </div>
  <div class="clock-row">
    <span class="clock-label">SERVE</span>
    <span class="clock-value">{serveDisplay}</span>
  </div>
  {#if secondaryDisplay()}
    <div class="clock-row clock-secondary">
      <span class="clock-label">{secondaryDisplay()!.label}</span>
      <span class="clock-value clock-active">{secondaryDisplay()!.value}</span>
    </div>
  {/if}
</div>

<style>
  .clock-panel {
    display: flex;
    flex-direction: column;
    gap: 0.25em;
    font-family: 'JetBrains Mono', 'SF Mono', monospace;
  }
  .clock-row {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    gap: 1em;
  }
  .clock-label {
    font-size: 0.9em;
    opacity: 0.6;
    text-transform: uppercase;
    letter-spacing: 0.15em;
  }
  .clock-value {
    font-size: 3em;
    font-weight: 700;
    font-variant-numeric: tabular-nums;
  }
  .clock-active {
    color: var(--arena-accent, #00e676);
  }
  .clock-secondary {
    margin-top: 0.5em;
    padding-top: 0.5em;
    border-top: 1px solid rgba(255, 255, 255, 0.1);
  }
</style>
