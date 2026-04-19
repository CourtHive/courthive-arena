<script lang="ts">
  import Clock from './Clock.svelte';
  import ScorePanel from './ScorePanel.svelte';
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

  // Derive view mode from match state
  let viewMode = $derived<'waiting' | 'play' | 'break' | 'complete'>(() => {
    if (!connected) return 'waiting';
    if (match.matchUpStatus === 'COMPLETED') return 'complete';
    if (match.clock.activeClock === 'break') return 'break';
    return 'play';
  });

  // Resolve active players from roster
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

      // Fetch roster on first snapshot if we have a tournamentId
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
    <!-- During-play layout -->
    <div class="play-layout">
      <div class="main-content">
        <div class="score-section">
          <ScorePanel {match} />
        </div>

        <!-- Active players with jersey numbers -->
        <div class="active-players">
          {#if side1Player()}
            <PlayerCard player={side1Player()!} side={1} isServing={match.servingSide === 1} />
          {/if}
          {#if side2Player()}
            <PlayerCard player={side2Player()!} side={2} isServing={match.servingSide === 2} />
          {/if}
        </div>
      </div>

      <div class="side-panel">
        <Clock clock={match.clock} />
        <PenaltyBox penalties={match.penaltyBox ?? []} />
      </div>
    </div>
  {/if}

  {#if match.lastSnapshot?.categoryLabel && viewMode() !== 'complete'}
    <div class="category-bar">{match.lastSnapshot.categoryLabel}</div>
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
    position: relative;
  }
  .play-layout {
    display: grid;
    grid-template-columns: 1fr 280px;
    gap: 3em;
    align-items: start;
    width: 100%;
    max-width: 1200px;
  }
  .main-content {
    display: flex;
    flex-direction: column;
    gap: 1.5em;
  }
  .active-players {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1em;
  }
  .side-panel {
    display: flex;
    flex-direction: column;
    gap: 1.5em;
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
  .category-bar {
    position: absolute;
    bottom: 1em;
    left: 50%;
    transform: translateX(-50%);
    font-size: 0.8em;
    opacity: 0.3;
    letter-spacing: 0.1em;
  }
</style>
