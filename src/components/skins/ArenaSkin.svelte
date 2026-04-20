<script lang="ts">
  import PlayerCard from '../PlayerCard.svelte';
  import PenaltyBox from '../PenaltyBox.svelte';
  import BreakOverlay from '../BreakOverlay.svelte';
  import MatchComplete from '../MatchComplete.svelte';
  import type { SkinProps } from './skinProps';

  let { match, side1Player, side2Player, formatMs }: SkinProps = $props();

  let viewMode = $derived<'waiting' | 'play' | 'break' | 'complete'>(() => {
    if (match.matchUpStatus === 'COMPLETED') return 'complete';
    if (match.clock.activeClock === 'break') return 'break';
    return 'play';
  });
</script>

<div class="arena-skin">
  {#if viewMode() === 'complete'}
    <MatchComplete {match} />
  {:else if viewMode() === 'break'}
    <BreakOverlay {match} clock={match.clock} />
  {:else}
    <div class="play-layout">
      <div class="side-column">
        <div class="team-name" class:serving={match.server === 0}>{match.side1Name ?? 'Team 1'}</div>
        {#if side1Player}
          <PlayerCard player={side1Player} side={1} isServing={match.server === 0} />
        {/if}
        <div class="side-score">
          <div class="arc-score">{match.arcScore?.side1 ?? 0}</div>
          {#if match.boltScore}
            <div class="bolt-score">{match.boltScore.side1}</div>
          {/if}
        </div>
      </div>

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
        <PenaltyBox penalties={match.penaltyBox ?? []} />
      </div>

      <div class="side-column">
        <div class="team-name" class:serving={match.server === 1}>{match.side2Name ?? 'Team 2'}</div>
        {#if side2Player}
          <PlayerCard player={side2Player} side={2} isServing={match.server === 1} />
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
  .arena-skin {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    padding: 2em;
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
  .clock-active .clock-time {
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
</style>
