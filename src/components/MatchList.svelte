<script lang="ts">
  import { subscribeAll, type ActiveMatchInfo } from '../relay/client';
  import { onMount, onDestroy } from 'svelte';

  let { onSelect }: { onSelect: (matchUpId: string) => void } = $props();

  let matches = $state<ActiveMatchInfo[]>([]);
  let connected = $state(false);
  let unsubscribe: (() => void) | null = null;

  onMount(() => {
    unsubscribe = subscribeAll((updated) => {
      matches = updated;
      connected = true;
    });
  });

  onDestroy(() => {
    unsubscribe?.();
  });
</script>

<div class="match-list">
  <h1 class="title">CourtHive Arena</h1>

  {#if !connected}
    <p class="status">Connecting to relay...</p>
  {:else if matches.length === 0}
    <p class="status">No active matches</p>
  {:else}
    <div class="matches">
      {#each matches as match}
        <button class="match-card" onclick={() => onSelect(match.matchUpId)}>
          <div class="match-teams">
            <span class="team">{match.side1Name ?? '—'}</span>
            <span class="vs">vs</span>
            <span class="team">{match.side2Name ?? '—'}</span>
          </div>
          {#if match.arcScore}
            <div class="match-score">
              <span>{match.arcScore.side1}</span>
              <span class="score-divider">–</span>
              <span>{match.arcScore.side2}</span>
            </div>
          {/if}
          {#if match.categoryLabel}
            <div class="match-category">{match.categoryLabel}</div>
          {/if}
          {#if match.matchUpStatus === 'COMPLETED'}
            <div class="match-badge">FINAL</div>
          {:else}
            <div class="match-badge match-badge--live">LIVE</div>
          {/if}
        </button>
      {/each}
    </div>
  {/if}
</div>

<style>
  .match-list {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 3em 2em;
    gap: 2em;
  }
  .title {
    font-size: 2em;
    font-weight: 300;
    letter-spacing: 0.1em;
    margin: 0;
  }
  .status {
    opacity: 0.5;
    font-size: 1.1em;
  }
  .matches {
    display: flex;
    flex-direction: column;
    gap: 1em;
    width: 100%;
    max-width: 600px;
  }
  .match-card {
    display: flex;
    flex-direction: column;
    gap: 0.5em;
    padding: 1.2em 1.5em;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 0.5em;
    cursor: pointer;
    color: inherit;
    text-align: left;
    font: inherit;
    transition: background 0.15s, border-color 0.15s;
    position: relative;
  }
  .match-card:hover {
    background: rgba(255, 255, 255, 0.1);
    border-color: var(--arena-accent, #00e676);
  }
  .match-teams {
    display: flex;
    align-items: baseline;
    gap: 0.5em;
    font-size: 1.2em;
  }
  .team {
    font-weight: 600;
  }
  .vs {
    font-size: 0.7em;
    opacity: 0.4;
    text-transform: uppercase;
  }
  .match-score {
    display: flex;
    gap: 0.4em;
    font-size: 1.5em;
    font-weight: 800;
    font-variant-numeric: tabular-nums;
  }
  .score-divider {
    opacity: 0.3;
  }
  .match-category {
    font-size: 0.8em;
    opacity: 0.4;
    letter-spacing: 0.05em;
  }
  .match-badge {
    position: absolute;
    top: 1em;
    right: 1em;
    font-size: 0.65em;
    font-weight: 700;
    letter-spacing: 0.15em;
    padding: 0.2em 0.6em;
    border-radius: 0.25em;
    border: 1px solid rgba(255, 255, 255, 0.2);
    opacity: 0.5;
  }
  .match-badge--live {
    color: var(--arena-accent, #00e676);
    border-color: var(--arena-accent, #00e676);
    opacity: 1;
  }
</style>
