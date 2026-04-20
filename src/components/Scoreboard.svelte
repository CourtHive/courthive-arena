<script lang="ts">
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

  function formatMs(ms: number): string {
    if (ms <= 0) return '0:00';
    const totalSeconds = Math.ceil(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }
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
        <div class="team-name" class:serving={match.server === 0}>{match.side1Name ?? 'Team 1'}</div>
        {#if side1Player()}
          <PlayerCard player={side1Player()!} side={1} isServing={match.server === 0} />
        {/if}
        <div class="side-score">
          <div class="arc-score">{match.arcScore?.side1 ?? 0}</div>
          {#if match.boltScore}
            <div class="bolt-score">{match.boltScore.side1}</div>
          {/if}
        </div>
      </div>

      <!-- Center: bolt clock, serve indicator, category, serve clock, penalty box -->
      <div class="center-column">
        <div class="clock-block">
          <div class="clock-heading">BOLT</div>
          <div class="clock-time" class:clock-active={match.clock.activeClock === 'bolt'}>{formatMs(match.clock.boltTimerRemainingMs)}</div>
        </div>
        {#if match.server !== undefined}
          <div class="serve-indicator">
            <span class="serve-arrow" class:serve-left={match.server === 0}>◀</span>
            <span class="serve-court">{match.serveSide === 'AD' ? 'AD' : 'DEUCE'}</span>
            <span class="serve-arrow" class:serve-right={match.server === 1}>▶</span>
          </div>
        {/if}
        {#if match.lastSnapshot?.categoryLabel}
          <div class="category-label">{match.lastSnapshot.categoryLabel}</div>
        {/if}
        <div class="clock-block">
          <div class="clock-heading">SERVE</div>
          <div class="clock-time">{formatMs(match.clock.serveClockRemainingMs)}</div>
        </div>
        {#if match.clock.activeClock === 'timeout' && match.clock.timeoutRemainingMs !== undefined}
          <div class="clock-block clock-active">
            <div class="clock-heading">TIMEOUT</div>
            <div class="clock-time">{formatMs(match.clock.timeoutRemainingMs)}</div>
          </div>
        {/if}
        {#if match.clock.activeClock === 'break' && match.clock.breakRemainingMs !== undefined}
          <div class="clock-block clock-active">
            <div class="clock-heading">BREAK</div>
            <div class="clock-time">{formatMs(match.clock.breakRemainingMs)}</div>
          </div>
        {/if}
        <PenaltyBox penalties={match.penaltyBox ?? []} />
      </div>

      <!-- Side 2 -->
      <div class="side-column">
        <div class="team-name" class:serving={match.server === 1}>{match.side2Name ?? 'Team 2'}</div>
        {#if side2Player()}
          <PlayerCard player={side2Player()!} side={2} isServing={match.server === 1} />
        {/if}
        <div class="side-score">
          <div class="arc-score">{match.arcScore?.side2 ?? 0}</div>
          {#if match.boltScore}
            <div class="bolt-score">{match.boltScore.side2}</div>
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
    gap: 2em;
    align-items: center;
    width: 100%;
    max-width: 1400px;
  }
  .side-column {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.75em;
    min-width: 0;
  }
  .team-name {
    font-size: 1.6em;
    font-weight: 700;
    text-align: center;
    letter-spacing: 0.02em;
    transition: color 0.2s;
  }
  .team-name.serving {
    color: var(--arena-accent, #00e676);
  }
  .side-score {
    display: flex;
    flex-direction: column;
    align-items: center;
  }
  .arc-score {
    font-size: 4em;
    font-weight: 900;
    font-variant-numeric: tabular-nums;
    line-height: 1;
  }
  .bolt-score {
    font-size: 1.4em;
    font-weight: 600;
    opacity: 0.4;
    font-variant-numeric: tabular-nums;
    margin-top: 0.15em;
  }
  .center-column {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.6em;
    min-width: 200px;
  }
  .clock-block {
    display: flex;
    flex-direction: column;
    align-items: center;
  }
  .clock-heading {
    font-size: 0.7em;
    opacity: 0.5;
    text-transform: uppercase;
    letter-spacing: 0.2em;
    font-family: 'JetBrains Mono', 'SF Mono', monospace;
  }
  .clock-time {
    font-size: 2.8em;
    font-weight: 700;
    font-variant-numeric: tabular-nums;
    font-family: 'JetBrains Mono', 'SF Mono', monospace;
    line-height: 1.1;
  }
  .clock-active .clock-time,
  .clock-active.clock-time {
    color: var(--arena-accent, #00e676);
  }
  .serve-indicator {
    display: flex;
    align-items: center;
    gap: 0.75em;
    font-size: 1.1em;
    font-weight: 700;
  }
  .serve-arrow {
    opacity: 0.15;
    font-size: 0.9em;
    transition: opacity 0.2s, color 0.2s;
  }
  .serve-arrow.serve-left,
  .serve-arrow.serve-right {
    opacity: 1;
    color: var(--arena-accent, #00e676);
  }
  .serve-court {
    letter-spacing: 0.15em;
    font-size: 0.9em;
    min-width: 4em;
    text-align: center;
  }
  .category-label {
    font-size: 0.8em;
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
