<script lang="ts">
  import Scoreboard from './components/Scoreboard.svelte';

  // Match ID from URL query param: ?match=<id>
  const params = new URLSearchParams(window.location.search);
  let matchUpId = $state(params.get('match') || '');

  // If no match ID provided, show the config screen
  let inputValue = $state('');

  function startMatch() {
    if (inputValue.trim()) {
      matchUpId = inputValue.trim();
      // Update URL without reload
      const url = new URL(window.location.href);
      url.searchParams.set('match', matchUpId);
      window.history.replaceState({}, '', url.toString());
    }
  }
</script>

{#if matchUpId}
  <Scoreboard {matchUpId} />
{:else}
  <div class="config-screen">
    <h1>CourtHive Arena</h1>
    <p>Enter a match ID to display the scoreboard</p>
    <div class="config-form">
      <input
        type="text"
        bind:value={inputValue}
        placeholder="Match ID"
        onkeydown={(e) => e.key === 'Enter' && startMatch()}
      />
      <button onclick={startMatch}>Start</button>
    </div>
    <p class="hint">Or pass ?match=&lt;id&gt; in the URL</p>
  </div>
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
  .config-screen {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100%;
    gap: 1em;
  }
  .config-screen h1 {
    font-size: 2em;
    font-weight: 300;
    letter-spacing: 0.1em;
  }
  .config-screen p {
    opacity: 0.5;
  }
  .config-form {
    display: flex;
    gap: 0.5em;
  }
  .config-form input {
    padding: 0.5em 1em;
    font-size: 1em;
    background: rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 0.25em;
    color: #fff;
    outline: none;
    width: 300px;
  }
  .config-form button {
    padding: 0.5em 1.5em;
    font-size: 1em;
    background: var(--arena-accent, #00e676);
    color: #0a0a0a;
    border: none;
    border-radius: 0.25em;
    cursor: pointer;
    font-weight: 600;
  }
  .hint {
    font-size: 0.8em;
    opacity: 0.3;
  }
</style>
