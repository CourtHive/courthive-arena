<script lang="ts">
  import type { MatchState } from '../stores/matchState.svelte';

  let { match }: { match: MatchState } = $props();

  let winnerName = $derived(
    match.winningSide === 1 ? match.side1Name : match.winningSide === 2 ? match.side2Name : undefined,
  );
</script>

<div class="match-complete">
  <div class="final-badge">FINAL</div>

  <div class="final-score">
    <div class="final-team" class:winner={match.winningSide === 1}>
      <div class="final-team-name">{match.side1Name ?? 'Team 1'}</div>
      <div class="final-arc">{match.arcScore?.side1 ?? 0}</div>
    </div>

    <div class="final-divider">—</div>

    <div class="final-team" class:winner={match.winningSide === 2}>
      <div class="final-arc">{match.arcScore?.side2 ?? 0}</div>
      <div class="final-team-name">{match.side2Name ?? 'Team 2'}</div>
    </div>
  </div>

  {#if winnerName}
    <div class="winner-label">{winnerName} wins</div>
  {/if}

  {#if match.lastSnapshot?.categoryLabel}
    <div class="category">{match.lastSnapshot.categoryLabel}</div>
  {/if}
</div>

<style>
  .match-complete {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1.5em;
    width: 100%;
    max-width: 1000px;
  }
  .final-badge {
    font-size: 1em;
    font-weight: 700;
    letter-spacing: 0.3em;
    padding: 0.3em 1.5em;
    border: 2px solid var(--arena-accent, #00e676);
    border-radius: 0.25em;
    color: var(--arena-accent, #00e676);
  }
  .final-score {
    display: flex;
    align-items: center;
    gap: 2em;
  }
  .final-team {
    display: flex;
    align-items: baseline;
    gap: 1em;
    opacity: 0.6;
    transition: opacity 0.3s;
  }
  .final-team.winner {
    opacity: 1;
  }
  .final-team-name {
    font-size: 1.8em;
    font-weight: 600;
  }
  .final-arc {
    font-size: 4em;
    font-weight: 900;
    font-variant-numeric: tabular-nums;
  }
  .final-divider {
    font-size: 2.5em;
    opacity: 0.2;
  }
  .winner-label {
    font-size: 1.3em;
    font-weight: 600;
    color: var(--arena-accent, #00e676);
  }
  .category {
    font-size: 0.9em;
    opacity: 0.4;
    letter-spacing: 0.1em;
  }
</style>
