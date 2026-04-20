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
          <div class="match-top-row">
            <div class="match-teams">
              <span class="team">{match.side1Name ?? match.matchUpId.slice(0, 8)}</span>
              <span class="vs">vs</span>
              <span class="team">{match.side2Name ?? '...'}</span>
            </div>
            {#if match.arcScore}
              <div class="match-score">{match.arcScore.side1}–{match.arcScore.side2}</div>
            {/if}
          </div>
          <div class="match-bottom-row">
            {#if match.categoryLabel}
              <span class="match-category">{match.categoryLabel}</span>
            {/if}
            {#if match.matchUpStatus === 'COMPLETED'}
              <span class="match-badge">FINAL</span>
            {:else}
              <span class="match-badge match-badge--live">LIVE</span>
            {/if}
          </div>
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
  .match-top-row {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
  }
  .match-score {
    font-size: 1.3em;
    font-weight: 800;
    font-variant-numeric: tabular-nums;
    flex-shrink: 0;
  }
  .match-bottom-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  .match-category {
    font-size: 0.8em;
    opacity: 0.4;
    letter-spacing: 0.05em;
  }
  .match-badge {
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
