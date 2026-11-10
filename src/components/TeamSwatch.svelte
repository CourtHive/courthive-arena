<script lang="ts">
  // constants and types
  import type { MatchState } from '../stores/matchState.svelte';

  let { match, side }: { match: MatchState; side: 1 | 2 } = $props();
  const colors = $derived(match.teamBranding?.teams[side]?.colors);
</script>

{#if colors?.roles['team.accent']}
  <span class="team-swatch" data-team-side={side} style:background={`var(--arena-side${side})`} aria-hidden="true"
  ></span>
{/if}

<style>
  .team-swatch {
    display: inline-block;
    inline-size: 0.65em;
    block-size: 0.65em;
    margin-inline-end: 0.35em;
    vertical-align: baseline;
    border: 1px solid var(--arena-text, #ffffff);
    border-radius: 0.125em;
  }
</style>
