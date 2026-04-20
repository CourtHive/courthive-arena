<script lang="ts">
  import Scoreboard from './components/Scoreboard.svelte';
  import MatchList from './components/MatchList.svelte';
  import { disconnect } from './relay/client';

  // Match ID from URL query param: ?match=<id>
  const params = new URLSearchParams(window.location.search);
  let matchUpId = $state(params.get('match') || '');

  function selectMatch(id: string) {
    matchUpId = id;
    const url = new URL(window.location.href);
    url.searchParams.set('match', matchUpId);
    window.history.replaceState({}, '', url.toString());
  }

  function goBack() {
    disconnect();
    matchUpId = '';
    const url = new URL(window.location.href);
    url.searchParams.delete('match');
    window.history.replaceState({}, '', url.toString());
  }
</script>

{#if matchUpId}
  <div class="scoreboard-wrapper">
    <button class="back-btn" onclick={goBack}>← Matches</button>
    {#key matchUpId}
      <Scoreboard {matchUpId} />
    {/key}
  </div>
{:else}
  <MatchList onSelect={selectMatch} />
{/if}

<style>
  :global(body) {
    margin: 0;
    padding: 0;
    background: #0a0a0a;
    color: #ffffff;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    overflow: hidden;
  }
  :global(html, body, #app) {
    width: 100%;
    height: 100%;
  }
  .scoreboard-wrapper {
    width: 100%;
    height: 100%;
    position: relative;
  }
  .back-btn {
    position: absolute;
    top: 0.75em;
    left: 0.75em;
    z-index: 10;
    padding: 0.3em 0.8em;
    font-size: 0.8em;
    font-weight: 600;
    background: rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 0.25em;
    color: rgba(255, 255, 255, 0.6);
    cursor: pointer;
    font-family: inherit;
  }
  .back-btn:hover {
    background: rgba(255, 255, 255, 0.15);
    color: #fff;
  }
</style>
