<script lang="ts">
  import ArenaSkin from './skins/ArenaSkin.svelte';
  import BroadcastSkin from './skins/BroadcastSkin.svelte';
  import JumbotronSkin from './skins/JumbotronSkin.svelte';
  import DashboardSkin from './skins/DashboardSkin.svelte';
  import MinimalSkin from './skins/MinimalSkin.svelte';
  import {
    getMatchState,
    applyIntennseSnapshot,
    applyScoreUpdate,
    applyClockTick,
    applyClockSync,
    resetMatchState,
  } from '../stores/matchState.svelte';
  import { getSkinConfig, applyTheme } from '../stores/skinConfig.svelte';
  import { subscribeToMatch, type RelaySubscription } from '../relay/client';
  import { fetchRoster, getPlayerOrFallback } from '../relay/roster';
  import { onMount, onDestroy } from 'svelte';

  let { matchUpId }: { matchUpId: string } = $props();

  let subscription: RelaySubscription | null = null;
  let match = $derived(getMatchState());
  let config = $derived(getSkinConfig());
  let connected = $state(false);
  let rosterLoaded = $state(false);

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
    applyTheme();
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

  let skinProps = $derived({
    match,
    side1Player: side1Player(),
    side2Player: side2Player(),
    config,
    formatMs,
  });
</script>

<div class="scoreboard">
  {#if !connected}
    <div class="waiting">
      <div class="waiting-text">Waiting for match data...</div>
      <div class="match-id">{matchUpId}</div>
    </div>
  {:else if config.skin === 'broadcast'}
    <BroadcastSkin {...skinProps} />
  {:else if config.skin === 'jumbotron'}
    <JumbotronSkin {...skinProps} />
  {:else if config.skin === 'dashboard'}
    <DashboardSkin {...skinProps} />
  {:else if config.skin === 'minimal'}
    <MinimalSkin {...skinProps} />
  {:else}
    <ArenaSkin {...skinProps} />
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
    color: var(--arena-text, #ffffff);
    background: var(--arena-bg, #0a0a0a);
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
