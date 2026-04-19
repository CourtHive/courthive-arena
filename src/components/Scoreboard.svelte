<script lang="ts">
  import Clock from './Clock.svelte';
  import ScorePanel from './ScorePanel.svelte';
  import {
    getMatchState,
    applyIntennseSnapshot,
    applyScoreUpdate,
    applyClockTick,
    applyClockSync,
    resetMatchState,
  } from '../stores/matchState.svelte';
  import { subscribeToMatch, type RelaySubscription } from '../relay/client';
  import { onMount, onDestroy } from 'svelte';

  let { matchUpId }: { matchUpId: string } = $props();

  let subscription: RelaySubscription | null = null;
  let match = $derived(getMatchState());
  let connected = $state(false);

  onMount(() => {
    resetMatchState(matchUpId);
    subscription = subscribeToMatch(matchUpId);

    subscription.onIntennse((data) => {
      applyIntennseSnapshot(data);
      connected = true;
    });

    subscription.onScore((data) => {
      applyScoreUpdate(data);
      connected = true;
    });

    subscription.onTick((data) => {
      applyClockTick(data);
    });

    subscription.onClockSync((data) => {
      applyClockSync(data);
    });
  });

  onDestroy(() => {
    subscription?.unsubscribe();
  });
</script>

<div class="scoreboard">
  {#if !connected}
    <div class="waiting">
      <div class="waiting-text">Waiting for match data...</div>
      <div class="match-id">{matchUpId}</div>
    </div>
  {:else}
    <div class="scoreboard-layout">
      <div class="score-section">
        <ScorePanel {match} />
      </div>
      <div class="clock-section">
        <Clock clock={match.clock} />
      </div>
    </div>

    {#if match.matchUpStatus === 'COMPLETED'}
      <div class="match-complete">FINAL</div>
    {/if}
  {/if}
</div>

<style>
  .scoreboard {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    padding: 2em;
    color: var(--arena-text, #ffffff);
    background: var(--arena-bg, #0a0a0a);
  }
  .scoreboard-layout {
    display: grid;
    grid-template-columns: 1fr auto;
    gap: 3em;
    align-items: center;
    width: 100%;
    max-width: 1200px;
  }
  .waiting {
    text-align: center;
    opacity: 0.5;
  }
  .waiting-text {
    font-size: 1.5em;
    margin-bottom: 0.5em;
  }
  .match-id {
    font-family: monospace;
    font-size: 0.8em;
    opacity: 0.4;
  }
  .match-complete {
    margin-top: 1em;
    font-size: 1.2em;
    font-weight: 700;
    letter-spacing: 0.2em;
    color: var(--arena-accent, #00e676);
  }
</style>
