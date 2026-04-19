<script lang="ts">
  import PlayerCard from './PlayerCard.svelte';
  import { getPlayerOrFallback } from '../relay/roster';

  let { penalties = [] }: { penalties: any[] } = $props();

  function formatMs(ms: number): string {
    if (ms <= 0) return '0:00';
    const totalSeconds = Math.ceil(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }
</script>

{#if penalties.length > 0}
  <div class="penalty-box">
    <div class="penalty-header">PENALTY BOX</div>
    <div class="penalty-entries">
      {#each penalties as penalty}
        {@const player = getPlayerOrFallback(penalty.participantId)}
        <div class="penalty-entry">
          <PlayerCard {player} compact />
          <div class="penalty-time">{formatMs(penalty.remainingMs)}</div>
        </div>
      {/each}
    </div>
  </div>
{/if}

<style>
  .penalty-box {
    background: rgba(255, 60, 60, 0.1);
    border: 1px solid rgba(255, 60, 60, 0.3);
    border-radius: 0.5em;
    padding: 0.75em;
  }
  .penalty-header {
    font-size: 0.7em;
    font-weight: 700;
    letter-spacing: 0.15em;
    text-transform: uppercase;
    color: #ff5252;
    margin-bottom: 0.5em;
  }
  .penalty-entries {
    display: flex;
    flex-direction: column;
    gap: 0.5em;
  }
  .penalty-entry {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1em;
  }
  .penalty-time {
    font-family: 'JetBrains Mono', 'SF Mono', monospace;
    font-size: 1.4em;
    font-weight: 700;
    font-variant-numeric: tabular-nums;
    color: #ff5252;
    flex-shrink: 0;
  }
</style>
