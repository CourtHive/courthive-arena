<script lang="ts">
  import type { PlayerInfo } from '../relay/roster';

  let {
    player,
    side = 1,
    isServing = false,
    compact = false,
  }: {
    player: PlayerInfo;
    side?: number;
    isServing?: boolean;
    compact?: boolean;
  } = $props();

  let initials = $derived(
    player.participantName
      .split(' ')
      .map((w) => w[0])
      .join('')
      .toUpperCase()
      .slice(0, 2),
  );
</script>

<div class="player-card" class:side-1={side === 1} class:side-2={side === 2} class:compact class:serving={isServing}>
  {#if player.jerseyNumber}
    <div class="jersey">{player.jerseyNumber}</div>
  {/if}

  <div class="avatar">
    {#if player.imageUrl}
      <img src={player.imageUrl} alt={player.participantName} class="avatar-img" />
    {:else}
      <div class="avatar-placeholder">{initials}</div>
    {/if}
  </div>

  <div class="name">{player.participantName}</div>

  {#if isServing}
    <div class="serve-indicator"></div>
  {/if}
</div>

<style>
  .player-card {
    display: flex;
    align-items: center;
    gap: 0.75em;
    padding: 0.5em 0.75em;
    border-radius: 0.5em;
    background: rgba(255, 255, 255, 0.05);
    position: relative;
    width: 100%;
  }
  .player-card.serving {
    background: rgba(255, 255, 255, 0.1);
  }
  .jersey {
    font-size: 2.2em;
    font-weight: 900;
    font-variant-numeric: tabular-nums;
    min-width: 1.5em;
    text-align: center;
    line-height: 1;
    color: var(--arena-accent, #00e676);
  }
  .compact .jersey {
    font-size: 1.4em;
  }
  .avatar {
    width: 3em;
    height: 3em;
    border-radius: 50%;
    overflow: hidden;
    flex-shrink: 0;
  }
  .compact .avatar {
    width: 2em;
    height: 2em;
  }
  .avatar-img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  .avatar-placeholder {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(255, 255, 255, 0.15);
    font-weight: 700;
    font-size: 0.9em;
    color: rgba(255, 255, 255, 0.6);
  }
  .name {
    font-size: 1.2em;
    font-weight: 600;
    flex: 1;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .compact .name {
    font-size: 0.9em;
  }
  .serve-indicator {
    position: absolute;
    right: 0.5em;
    top: 50%;
    transform: translateY(-50%);
    width: 0.5em;
    height: 0.5em;
    border-radius: 50%;
    background: var(--arena-accent, #00e676);
    box-shadow: 0 0 6px var(--arena-accent, #00e676);
  }
  .side-1 {
    border-left: 3px solid var(--arena-side1, #4fc3f7);
  }
  .side-2 {
    border-left: 3px solid var(--arena-side2, #ff7043);
  }
</style>
