export type SkinName = 'arena' | 'broadcast' | 'jumbotron' | 'dashboard' | 'minimal';

export interface ThemePreset {
  name: string;
  accent: string;
  side1: string;
  side2: string;
  bg: string;
  text: string;
}

export interface SkinConfig {
  skin: SkinName;
  theme: string;
  customColors: Partial<ThemePreset>;
  // Broadcast options
  broadcastPosition: 'top' | 'bottom';
  broadcastOpacity: number;
  // Jumbotron options
  jumbotronShowBolt: boolean;
  jumbotronShowServeClock: boolean;
  // Dashboard options
  dashboardStatColumns: string[];
}

export const THEME_PRESETS: Record<string, ThemePreset> = {
  neon: {
    name: 'Neon Green',
    accent: '#00e676',
    side1: '#4fc3f7',
    side2: '#ff7043',
    bg: '#0a0a0a',
    text: '#ffffff',
  },
  gold: {
    name: 'Orreco Gold',
    accent: '#f5c518',
    side1: '#4fc3f7',
    side2: '#ff7043',
    bg: '#0a0a0a',
    text: '#ffffff',
  },
  ice: {
    name: 'Ice Blue',
    accent: '#40c4ff',
    side1: '#80deea',
    side2: '#ef9a9a',
    bg: '#0a0e14',
    text: '#e0e0e0',
  },
  fire: {
    name: 'Fire',
    accent: '#ff5722',
    side1: '#ffab40',
    side2: '#7c4dff',
    bg: '#120a0a',
    text: '#ffffff',
  },
  mono: {
    name: 'Monochrome',
    accent: '#ffffff',
    side1: '#b0bec5',
    side2: '#78909c',
    bg: '#000000',
    text: '#ffffff',
  },
};

export const SKIN_META: Record<SkinName, { label: string; description: string }> = {
  arena: { label: 'Arena', description: 'Full 3-column layout with player cards and clocks' },
  broadcast: { label: 'Broadcast', description: 'Compact scorebug bar for stream overlays' },
  jumbotron: { label: 'Jumbotron', description: 'Massive numbers for stadium screens' },
  dashboard: { label: 'Dashboard', description: 'Data-dense with live player stats' },
  minimal: { label: 'Minimal', description: 'Just score and clock' },
};

const STORAGE_KEY = 'arena-skin-config';

const DEFAULT_CONFIG: SkinConfig = {
  skin: 'arena',
  theme: 'neon',
  customColors: {},
  broadcastPosition: 'bottom',
  broadcastOpacity: 0.85,
  jumbotronShowBolt: true,
  jumbotronShowServeClock: true,
  dashboardStatColumns: ['pointsWon', 'winners', 'aces', 'unforcedErrors'],
};

function loadConfig(): SkinConfig {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return { ...DEFAULT_CONFIG, ...JSON.parse(raw) };
  } catch {
    /* ignore */
  }
  return { ...DEFAULT_CONFIG };
}

let config = $state<SkinConfig>(loadConfig());

function persist() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
}

export function getSkinConfig() {
  return config;
}

/** Reset to defaults — used by tests */
export function resetSkinConfig() {
  config = { ...DEFAULT_CONFIG, customColors: {} };
}

export function setSkin(skin: SkinName) {
  config.skin = skin;
  persist();
}

export function setTheme(theme: string) {
  config.theme = theme;
  persist();
}

export function setCustomColors(colors: Partial<ThemePreset>) {
  config.customColors = { ...config.customColors, ...colors };
  persist();
}

export function updateSkinOption<K extends keyof SkinConfig>(key: K, value: SkinConfig[K]) {
  config[key] = value;
  persist();
}

export function getResolvedTheme(): ThemePreset {
  const base = THEME_PRESETS[config.theme] ?? THEME_PRESETS.neon;
  return { ...base, ...config.customColors };
}

/** Apply theme CSS variables to :root */
export function applyTheme() {
  const theme = getResolvedTheme();
  const root = document.documentElement;
  root.style.setProperty('--arena-accent', theme.accent);
  root.style.setProperty('--arena-side1', theme.side1);
  root.style.setProperty('--arena-side2', theme.side2);
  root.style.setProperty('--arena-bg', theme.bg);
  root.style.setProperty('--arena-text', theme.text);
}

/** Parse skin/theme from URL params */
export function applyUrlOverrides() {
  const params = new URLSearchParams(globalThis.location.search);
  const skin = params.get('skin');
  const theme = params.get('theme');
  if (skin && skin in SKIN_META) config.skin = skin as SkinName;
  if (theme && theme in THEME_PRESETS) config.theme = theme;
}
