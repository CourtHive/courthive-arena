<script lang="ts">
  import type { MatchState } from '../stores/matchState.svelte';

  let { match }: { match: MatchState } = $props();
</script>

<div class="score-panel">
  <div class="team-row" class:serving={match.servingSide === 1}>
    <div class="team-name">{match.side1Name ?? 'Team 1'}</div>
    <div class="scores">
      {#if match.arcScore}
        <div class="arc-score">{match.arcScore.side1}</div>
      {/if}
      {#if match.boltScore}
        <div class="bolt-score">{match.boltScore.side1}</div>
      {/if}
    </div>
  </div>

  <div class="team-row" class:serving={match.servingSide === 2}>
    <div class="team-name">{match.side2Name ?? 'Team 2'}</div>
    <div class="scores">
      {#if match.arcScore}
        <div class="arc-score">{match.arcScore.side2}</div>
      {/if}
      {#if match.boltScore}
        <div class="bolt-score">{match.boltScore.side2}</div>
      {/if}
    </div>
  </div>

  {#if match.activePlayers}
    <div class="active-players">
      <span>{match.activePlayers.side1 ?? ''}</span>
      <span class="vs">vs</span>
      <span>{match.activePlayers.side2 ?? ''}</span>
    </div>
  {/if}
</div>

<style>
  .score-panel {
    display: flex;
    flex-direction: column;
    gap: 0.5em;
  }
  .team-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.5em 1em;
    border-radius: 0.25em;
    background: rgba(255, 255, 255, 0.05);
    transition: background 0.2s;
  }
  .team-row.serving {
    background: rgba(255, 255, 255, 0.1);
    border-left: 3px solid var(--arena-accent, #00e676);
  }
  .team-name {
    font-size: 1.4em;
    font-weight: 600;
  }
  .scores {
    display: flex;
    gap: 1em;
    align-items: baseline;
  }
  .arc-score {
    font-size: 2.5em;
    font-weight: 800;
    font-variant-numeric: tabular-nums;
  }
  .bolt-score {
    font-size: 1.6em;
    font-weight: 600;
    opacity: 0.7;
    font-variant-numeric: tabular-nums;
  }
  .active-players {
    display: flex;
    justify-content: center;
    gap: 1em;
    font-size: 0.9em;
    opacity: 0.6;
    padding-top: 0.25em;
  }
  .vs {
    text-transform: uppercase;
    font-size: 0.7em;
    opacity: 0.5;
  }
</style>
