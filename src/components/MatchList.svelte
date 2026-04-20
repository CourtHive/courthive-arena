<script lang="ts">
  import { subscribeAll, type ActiveMatchInfo } from '../relay/client';
  import {
    getSkinConfig,
    setSkin,
    setTheme,
    setCustomColors,
    updateSkinOption,
    applyTheme,
    SKIN_META,
    THEME_PRESETS,
  } from '../stores/skinConfig.svelte';
  import type { SkinName } from '../stores/skinConfig.svelte';
  import { onMount, onDestroy } from 'svelte';

  let { onSelect }: { onSelect: (matchUpId: string) => void } = $props();

  let matches = $state<ActiveMatchInfo[]>([]);
  let connected = $state(false);
  let showConfig = $state(false);
  let unsubscribe: (() => void) | null = null;

  let config = $derived(getSkinConfig());
  let skinNames = Object.keys(SKIN_META) as SkinName[];
  let themeNames = Object.keys(THEME_PRESETS);

  onMount(() => {
    applyTheme();
    unsubscribe = subscribeAll((updated) => {
      matches = updated;
      connected = true;
    });
  });

  onDestroy(() => {
    unsubscribe?.();
  });

  function selectSkin(skin: SkinName) {
    setSkin(skin);
    applyTheme();
  }

  function selectTheme(theme: string) {
    setTheme(theme);
    applyTheme();
  }

  function onSide1Color(e: Event) {
    const value = (e.target as HTMLInputElement).value;
    setCustomColors({ side1: value });
    applyTheme();
  }

  function onSide2Color(e: Event) {
    const value = (e.target as HTMLInputElement).value;
    setCustomColors({ side2: value });
    applyTheme();
  }

  function onAccentColor(e: Event) {
    const value = (e.target as HTMLInputElement).value;
    setCustomColors({ accent: value });
    applyTheme();
  }

  function resetColors() {
    setCustomColors({ side1: undefined as any, side2: undefined as any, accent: undefined as any });
    applyTheme();
  }
</script>

<div class="match-list">
  <div class="header-row">
    <h1 class="title">CourtHive Arena</h1>
    <button class="config-btn" onclick={() => { showConfig = !showConfig; }} title="Display settings">
      {showConfig ? '✕' : '⚙'}
    </button>
  </div>

  {#if showConfig}
    <div class="config-panel">
      <!-- Skin selector -->
      <div class="config-section">
        <div class="config-label">Skin</div>
        <div class="skin-grid">
          {#each skinNames as skin}
            <button
              class="skin-card"
              class:selected={config.skin === skin}
              onclick={() => selectSkin(skin)}
            >
              <div class="skin-preview skin-preview--{skin}">
                {#if skin === 'arena'}
                  <div class="sp-row"><span class="sp-block"></span><span class="sp-block sm"></span><span class="sp-block"></span></div>
                {:else if skin === 'broadcast'}
                  <div class="sp-bar"></div>
                {:else if skin === 'jumbotron'}
                  <div class="sp-big">3—2</div>
                {:else if skin === 'dashboard'}
                  <div class="sp-row"><span class="sp-block"></span><span class="sp-block"></span></div>
                  <div class="sp-lines"><span></span><span></span><span></span></div>
                {:else if skin === 'minimal'}
                  <div class="sp-min">3<br>2</div>
                {/if}
              </div>
              <div class="skin-label">{SKIN_META[skin].label}</div>
              <div class="skin-desc">{SKIN_META[skin].description}</div>
            </button>
          {/each}
        </div>
      </div>

      <!-- Theme -->
      <div class="config-section">
        <div class="config-label">Theme</div>
        <div class="theme-row">
          {#each themeNames as theme}
            <button
              class="theme-swatch"
              class:selected={config.theme === theme}
              style:--swatch-color={THEME_PRESETS[theme].accent}
              onclick={() => selectTheme(theme)}
              title={THEME_PRESETS[theme].name}
            >
              <div class="swatch-dot"></div>
              <span class="swatch-name">{THEME_PRESETS[theme].name}</span>
            </button>
          {/each}
        </div>
      </div>

      <!-- Custom colors -->
      <div class="config-section">
        <div class="config-label">
          Custom Colors
          <button class="reset-btn" onclick={resetColors}>Reset</button>
        </div>
        <div class="color-row">
          <label class="color-input">
            <span>Accent</span>
            <input type="color" value={config.customColors.accent ?? THEME_PRESETS[config.theme]?.accent ?? '#00e676'} oninput={onAccentColor} />
          </label>
          <label class="color-input">
            <span>Side 1</span>
            <input type="color" value={config.customColors.side1 ?? THEME_PRESETS[config.theme]?.side1 ?? '#4fc3f7'} oninput={onSide1Color} />
          </label>
          <label class="color-input">
            <span>Side 2</span>
            <input type="color" value={config.customColors.side2 ?? THEME_PRESETS[config.theme]?.side2 ?? '#ff7043'} oninput={onSide2Color} />
          </label>
        </div>
      </div>

      <!-- Per-skin options -->
      {#if config.skin === 'broadcast'}
        <div class="config-section">
          <div class="config-label">Broadcast Options</div>
          <div class="option-row">
            <span>Position</span>
            <select
              value={config.broadcastPosition}
              onchange={(e) => updateSkinOption('broadcastPosition', (e.target as HTMLSelectElement).value as 'top' | 'bottom')}
            >
              <option value="bottom">Bottom</option>
              <option value="top">Top</option>
            </select>
          </div>
          <div class="option-row">
            <span>Opacity</span>
            <input
              type="range"
              min="0.3"
              max="1"
              step="0.05"
              value={config.broadcastOpacity}
              oninput={(e) => updateSkinOption('broadcastOpacity', Number.parseFloat((e.target as HTMLInputElement).value))}
            />
            <span class="option-val">{Math.round(config.broadcastOpacity * 100)}%</span>
          </div>
        </div>
      {/if}

      {#if config.skin === 'jumbotron'}
        <div class="config-section">
          <div class="config-label">Jumbotron Options</div>
          <label class="option-check">
            <input
              type="checkbox"
              checked={config.jumbotronShowBolt}
              onchange={(e) => updateSkinOption('jumbotronShowBolt', (e.target as HTMLInputElement).checked)}
            />
            Show bolt score
          </label>
          <label class="option-check">
            <input
              type="checkbox"
              checked={config.jumbotronShowServeClock}
              onchange={(e) => updateSkinOption('jumbotronShowServeClock', (e.target as HTMLInputElement).checked)}
            />
            Show serve clock
          </label>
        </div>
      {/if}
    </div>
  {/if}

  <!-- Match list -->
  {#if !connected}
    <p class="status">Connecting to relay...</p>
  {:else if matches.length === 0}
    <p class="status">No active matches</p>
  {:else}
    <div class="matches">
      {#each matches as match}
        <button class="match-card" onclick={() => onSelect(match.matchUpId)}>
          <div class="match-top-row">
            <div class="match-teams">
              <span class="team">{match.side1Name ?? match.matchUpId.slice(0, 8)}</span>
              <span class="vs">vs</span>
              <span class="team">{match.side2Name ?? '...'}</span>
            </div>
            {#if match.arcScore}
              <div class="match-score">{match.arcScore.side1}–{match.arcScore.side2}</div>
            {/if}
          </div>
          <div class="match-bottom-row">
            {#if match.categoryLabel}
              <span class="match-category">{match.categoryLabel}</span>
            {/if}
            {#if match.matchUpStatus === 'COMPLETED'}
              <span class="match-badge">FINAL</span>
            {:else}
              <span class="match-badge match-badge--live">LIVE</span>
            {/if}
          </div>
        </button>
      {/each}
    </div>
  {/if}
</div>

<style>
  .match-list {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 2em 2em;
    gap: 1.5em;
    overflow-y: auto;
  }
  .header-row {
    display: flex;
    align-items: center;
    gap: 1em;
    width: 100%;
    max-width: 800px;
    justify-content: space-between;
  }
  .title {
    font-size: 2em;
    font-weight: 300;
    letter-spacing: 0.1em;
    margin: 0;
  }
  .config-btn {
    font-size: 1.4em;
    background: rgba(255, 255, 255, 0.08);
    border: 1px solid rgba(255, 255, 255, 0.15);
    border-radius: 0.3em;
    color: inherit;
    cursor: pointer;
    width: 2em;
    height: 2em;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: background 0.15s;
  }
  .config-btn:hover {
    background: rgba(255, 255, 255, 0.15);
  }
  .status {
    opacity: 0.5;
    font-size: 1.1em;
  }

  /* Config panel */
  .config-panel {
    width: 100%;
    max-width: 800px;
    display: flex;
    flex-direction: column;
    gap: 1.5em;
    padding: 1.5em;
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 0.5em;
  }
  .config-section {
    display: flex;
    flex-direction: column;
    gap: 0.6em;
  }
  .config-label {
    font-size: 0.75em;
    font-weight: 700;
    letter-spacing: 0.15em;
    text-transform: uppercase;
    opacity: 0.5;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  .reset-btn {
    font-size: 0.9em;
    background: none;
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 0.2em;
    color: rgba(255, 255, 255, 0.5);
    cursor: pointer;
    padding: 0.1em 0.5em;
    text-transform: none;
    letter-spacing: 0;
    font-weight: 500;
  }
  .reset-btn:hover {
    color: #fff;
    border-color: rgba(255, 255, 255, 0.4);
  }

  /* Skin grid */
  .skin-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
    gap: 0.75em;
  }
  .skin-card {
    display: flex;
    flex-direction: column;
    gap: 0.4em;
    padding: 0.75em;
    background: rgba(255, 255, 255, 0.04);
    border: 2px solid transparent;
    border-radius: 0.5em;
    cursor: pointer;
    color: inherit;
    text-align: left;
    font: inherit;
    transition: border-color 0.15s, background 0.15s;
  }
  .skin-card:hover {
    background: rgba(255, 255, 255, 0.08);
  }
  .skin-card.selected {
    border-color: var(--arena-accent, #00e676);
    background: rgba(255, 255, 255, 0.06);
  }
  .skin-preview {
    height: 50px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    gap: 3px;
    background: rgba(0, 0, 0, 0.3);
    border-radius: 0.25em;
    overflow: hidden;
  }
  .sp-row {
    display: flex;
    gap: 4px;
    justify-content: center;
  }
  .sp-block {
    width: 28px;
    height: 18px;
    background: rgba(255, 255, 255, 0.15);
    border-radius: 2px;
  }
  .sp-block.sm {
    width: 16px;
  }
  .sp-bar {
    width: 90%;
    height: 10px;
    background: rgba(255, 255, 255, 0.2);
    border-radius: 2px;
    align-self: flex-end;
    margin-bottom: 4px;
  }
  .sp-big {
    font-size: 1.4em;
    font-weight: 900;
    opacity: 0.5;
    font-variant-numeric: tabular-nums;
  }
  .sp-lines {
    display: flex;
    flex-direction: column;
    gap: 2px;
    width: 80%;
  }
  .sp-lines span {
    height: 3px;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 1px;
  }
  .sp-min {
    font-size: 1em;
    font-weight: 700;
    opacity: 0.4;
    line-height: 1.1;
    text-align: center;
  }
  .skin-label {
    font-size: 0.85em;
    font-weight: 600;
  }
  .skin-desc {
    font-size: 0.65em;
    opacity: 0.4;
    line-height: 1.3;
  }

  /* Theme row */
  .theme-row {
    display: flex;
    gap: 0.5em;
    flex-wrap: wrap;
  }
  .theme-swatch {
    display: flex;
    align-items: center;
    gap: 0.4em;
    padding: 0.4em 0.7em;
    background: rgba(255, 255, 255, 0.04);
    border: 2px solid transparent;
    border-radius: 0.3em;
    cursor: pointer;
    color: inherit;
    font: inherit;
    font-size: 0.8em;
    transition: border-color 0.15s;
  }
  .theme-swatch:hover {
    background: rgba(255, 255, 255, 0.08);
  }
  .theme-swatch.selected {
    border-color: var(--swatch-color, #00e676);
  }
  .swatch-dot {
    width: 12px;
    height: 12px;
    border-radius: 50%;
    background: var(--swatch-color, #00e676);
    flex-shrink: 0;
  }
  .swatch-name {
    white-space: nowrap;
  }

  /* Color pickers */
  .color-row {
    display: flex;
    gap: 1em;
    flex-wrap: wrap;
  }
  .color-input {
    display: flex;
    align-items: center;
    gap: 0.5em;
    font-size: 0.8em;
    cursor: pointer;
  }
  .color-input input[type="color"] {
    width: 28px;
    height: 28px;
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 4px;
    background: none;
    cursor: pointer;
    padding: 0;
  }

  /* Per-skin options */
  .option-row {
    display: flex;
    align-items: center;
    gap: 0.75em;
    font-size: 0.85em;
  }
  .option-row select {
    background: rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 0.25em;
    color: inherit;
    font: inherit;
    font-size: 0.95em;
    padding: 0.25em 0.5em;
  }
  .option-row input[type="range"] {
    flex: 1;
    max-width: 200px;
  }
  .option-val {
    font-size: 0.85em;
    opacity: 0.5;
    min-width: 3em;
    font-variant-numeric: tabular-nums;
  }
  .option-check {
    display: flex;
    align-items: center;
    gap: 0.5em;
    font-size: 0.85em;
    cursor: pointer;
  }

  /* Match cards */
  .matches {
    display: flex;
    flex-direction: column;
    gap: 1em;
    width: 100%;
    max-width: 600px;
  }
  .match-card {
    display: flex;
    flex-direction: column;
    gap: 0.5em;
    padding: 1.2em 1.5em;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 0.5em;
    cursor: pointer;
    color: inherit;
    text-align: left;
    font: inherit;
    transition: background 0.15s, border-color 0.15s;
    position: relative;
  }
  .match-card:hover {
    background: rgba(255, 255, 255, 0.1);
    border-color: var(--arena-accent, #00e676);
  }
  .match-teams {
    display: flex;
    align-items: baseline;
    gap: 0.5em;
    font-size: 1.2em;
  }
  .team {
    font-weight: 600;
  }
  .vs {
    font-size: 0.7em;
    opacity: 0.4;
    text-transform: uppercase;
  }
  .match-top-row {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
  }
  .match-score {
    font-size: 1.3em;
    font-weight: 800;
    font-variant-numeric: tabular-nums;
    flex-shrink: 0;
  }
  .match-bottom-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  .match-category {
    font-size: 0.8em;
    opacity: 0.4;
    letter-spacing: 0.05em;
  }
  .match-badge {
    font-size: 0.65em;
    font-weight: 700;
    letter-spacing: 0.15em;
    padding: 0.2em 0.6em;
    border-radius: 0.25em;
    border: 1px solid rgba(255, 255, 255, 0.2);
    opacity: 0.5;
  }
  .match-badge--live {
    color: var(--arena-accent, #00e676);
    border-color: var(--arena-accent, #00e676);
    opacity: 1;
  }
</style>
