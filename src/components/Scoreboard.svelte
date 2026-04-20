<script lang="ts">
  import Clock from './Clock.svelte';
  import PlayerCard from './PlayerCard.svelte';
  import PenaltyBox from './PenaltyBox.svelte';
  import BreakOverlay from './BreakOverlay.svelte';
  import MatchComplete from './MatchComplete.svelte';
  import {
    getMatchState,
    applyIntennseSnapshot,
    applyScoreUpdate,
    applyClockTick,
    applyClockSync,
    resetMatchState,
  } from '../stores/matchState.svelte';
  import { subscribeToMatch, type RelaySubscription } from '../relay/client';
  import { fetchRoster, getPlayerOrFallback } from '../relay/roster';
  import { onMount, onDestroy } from 'svelte';

  let { matchUpId }: { matchUpId: string } = $props();

  let subscription: RelaySubscription | null = null;
  let match = $derived(getMatchState());
  let connected = $state(false);
  let rosterLoaded = $state(false);

  let viewMode = $derived<'waiting' | 'play' | 'break' | 'complete'>(() => {
    if (!connected) return 'waiting';
    if (match.matchUpStatus === 'COMPLETED') return 'complete';
    if (match.clock.activeClock === 'break') return 'break';
    return 'play';
  });

  let side1Player = $derived(() => {
    const ids = match.lastSnapshot?.activePlayers?.side1;
    const id = Array.isArray(ids) ? ids[0] : ids;
    return id ? getPlayerOrFallback(id) : undefined;
  });

  let side2Player = $derived(() => {
    const ids = match.lastSnapshot?.activePlayers?.side2;
    const id = Array.isArray(ids) ? ids[0] : ids;
    return id ? getPlayerOrFallback(id) : undefined;
  });

  onMount(async () => {
    resetMatchState(matchUpId);
    subscription = subscribeToMatch(matchUpId);

    subscription.onIntennse((data) => {
      applyIntennseSnapshot(data);
      connected = true;

      if (!rosterLoaded && data.tournamentId) {
        fetchRoster(data.tournamentId).then(() => { rosterLoaded = true; });
      }
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
  {#if viewMode() === 'waiting'}
    <div class="waiting">
      <div class="waiting-text">Waiting for match data...</div>
      <div class="match-id">{matchUpId}</div>
    </div>
  {:else if viewMode() === 'complete'}
    <MatchComplete {match} />
  {:else if viewMode() === 'break'}
    <BreakOverlay {match} clock={match.clock} />
  {:else}
    <!-- During-play: [Team 1 | Clocks | Team 2] -->
    <div class="play-layout">
      <!-- Side 1 -->
      <div class="side-column">
        <div class="team-name">{match.side1Name ?? 'Team 1'}</div>
        {#if side1Player()}
          <PlayerCard player={side1Player()!} side={1} isServing={match.servingSide === 1} />
        {/if}
        <div class="side-score">
          <div class="arc-score">{match.arcScore?.side1 ?? 0}</div>
          {#if match.boltScore}
            <div class="bolt-score">Bolt: {match.boltScore.side1}</div>
          {/if}
        </div>
      </div>

      <!-- Center: clocks + penalty box -->
      <div class="center-column">
        <Clock clock={match.clock} />
        {#if match.lastSnapshot?.categoryLabel}
          <div class="category-label">{match.lastSnapshot.categoryLabel}</div>
        {/if}
        <PenaltyBox penalties={match.penaltyBox ?? []} />
      </div>

      <!-- Side 2 -->
      <div class="side-column">
        <div class="team-name">{match.side2Name ?? 'Team 2'}</div>
        {#if side2Player()}
          <PlayerCard player={side2Player()!} side={2} isServing={match.servingSide === 2} />
        {/if}
        <div class="side-score">
          <div class="arc-score">{match.arcScore?.side2 ?? 0}</div>
          {#if match.boltScore}
            <div class="bolt-score">Bolt: {match.boltScore.side2}</div>
          {/if}
        </div>
      </div>
    </div>
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
  .play-layout {
    display: grid;
    grid-template-columns: 1fr auto 1fr;
    gap: 3em;
    align-items: start;
    width: 100%;
    max-width: 1400px;
  }
  .side-column {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1em;
  }
  .team-name {
    font-size: 1.6em;
    font-weight: 700;
    text-align: center;
    letter-spacing: 0.02em;
  }
  .side-score {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.25em;
  }
  .arc-score {
    font-size: 4em;
    font-weight: 900;
    font-variant-numeric: tabular-nums;
    line-height: 1;
  }
  .bolt-score {
    font-size: 1.2em;
    font-weight: 600;
    opacity: 0.5;
    font-variant-numeric: tabular-nums;
  }
  .center-column {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1.5em;
    min-width: 240px;
  }
  .category-label {
    font-size: 0.85em;
    opacity: 0.4;
    letter-spacing: 0.1em;
    text-align: center;
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
</style>
