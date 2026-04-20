import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  getSkinConfig,
  setSkin,
  setTheme,
  setCustomColors,
  updateSkinOption,
  getResolvedTheme,
  applyUrlOverrides,
  resetSkinConfig,
  THEME_PRESETS,
  SKIN_META,
} from '../skinConfig.svelte';

// Mock localStorage
const storage = new Map<string, string>();
vi.stubGlobal('localStorage', {
  getItem: (key: string) => storage.get(key) ?? null,
  setItem: (key: string, value: string) => storage.set(key, value),
  removeItem: (key: string) => storage.delete(key),
  clear: () => storage.clear(),
});

beforeEach(() => {
  storage.clear();
  resetSkinConfig();
});

describe('THEME_PRESETS', () => {
  it('should have all required presets', () => {
    expect(Object.keys(THEME_PRESETS)).toEqual(expect.arrayContaining(['neon', 'gold', 'ice', 'fire', 'mono']));
  });

  it('each preset should have all required fields', () => {
    for (const [key, preset] of Object.entries(THEME_PRESETS)) {
      expect(preset.name, `${key}.name`).toBeTruthy();
      expect(preset.accent, `${key}.accent`).toMatch(/^#[0-9a-fA-F]{6}$/);
      expect(preset.side1, `${key}.side1`).toMatch(/^#[0-9a-fA-F]{6}$/);
      expect(preset.side2, `${key}.side2`).toMatch(/^#[0-9a-fA-F]{6}$/);
      expect(preset.bg, `${key}.bg`).toMatch(/^#[0-9a-fA-F]{6}$/);
      expect(preset.text, `${key}.text`).toMatch(/^#[0-9a-fA-F]{6}$/);
    }
  });
});

describe('SKIN_META', () => {
  it('should have metadata for all five skins', () => {
    const skins = Object.keys(SKIN_META);
    expect(skins).toEqual(expect.arrayContaining(['arena', 'broadcast', 'jumbotron', 'dashboard', 'minimal']));
    expect(skins).toHaveLength(5);
  });

  it('each skin should have label and description', () => {
    for (const [key, meta] of Object.entries(SKIN_META)) {
      expect(meta.label, `${key}.label`).toBeTruthy();
      expect(meta.description, `${key}.description`).toBeTruthy();
    }
  });
});

describe('getSkinConfig', () => {
  it('should return default config', () => {
    const config = getSkinConfig();
    expect(config.skin).toBe('arena');
    expect(config.theme).toBe('neon');
    expect(config.broadcastPosition).toBe('bottom');
    expect(config.broadcastOpacity).toBe(0.85);
    expect(config.jumbotronShowBolt).toBe(true);
    expect(config.jumbotronShowServeClock).toBe(true);
  });
});

describe('setSkin', () => {
  it('should update the skin', () => {
    setSkin('broadcast');
    expect(getSkinConfig().skin).toBe('broadcast');
  });

  it('should persist to localStorage', () => {
    setSkin('jumbotron');
    const stored = JSON.parse(storage.get('arena-skin-config') ?? '{}');
    expect(stored.skin).toBe('jumbotron');
  });
});

describe('setTheme', () => {
  it('should update the theme', () => {
    setTheme('gold');
    expect(getSkinConfig().theme).toBe('gold');
  });

  it('should persist to localStorage', () => {
    setTheme('ice');
    const stored = JSON.parse(storage.get('arena-skin-config') ?? '{}');
    expect(stored.theme).toBe('ice');
  });
});

describe('setCustomColors', () => {
  it('should merge custom colors', () => {
    setCustomColors({ accent: '#ff0000' });
    expect(getSkinConfig().customColors.accent).toBe('#ff0000');
  });

  it('should preserve existing custom colors when adding new ones', () => {
    setCustomColors({ accent: '#ff0000' });
    setCustomColors({ side1: '#00ff00' });
    const colors = getSkinConfig().customColors;
    expect(colors.accent).toBe('#ff0000');
    expect(colors.side1).toBe('#00ff00');
  });
});

describe('updateSkinOption', () => {
  it('should update broadcast position', () => {
    updateSkinOption('broadcastPosition', 'top');
    expect(getSkinConfig().broadcastPosition).toBe('top');
  });

  it('should update broadcast opacity', () => {
    updateSkinOption('broadcastOpacity', 0.5);
    expect(getSkinConfig().broadcastOpacity).toBe(0.5);
  });

  it('should update jumbotron options', () => {
    updateSkinOption('jumbotronShowBolt', false);
    expect(getSkinConfig().jumbotronShowBolt).toBe(false);
  });
});

describe('getResolvedTheme', () => {
  it('should return base theme when no custom colors', () => {
    setTheme('neon');
    const resolved = getResolvedTheme();
    expect(resolved.accent).toBe(THEME_PRESETS.neon.accent);
    expect(resolved.side1).toBe(THEME_PRESETS.neon.side1);
  });

  it('should override with custom colors', () => {
    setTheme('neon');
    setCustomColors({ accent: '#ff0000', side1: '#00ff00' });
    const resolved = getResolvedTheme();
    expect(resolved.accent).toBe('#ff0000');
    expect(resolved.side1).toBe('#00ff00');
    expect(resolved.side2).toBe(THEME_PRESETS.neon.side2);
  });

  it('should fall back to neon for unknown theme', () => {
    setTheme('nonexistent');
    const resolved = getResolvedTheme();
    expect(resolved.accent).toBe(THEME_PRESETS.neon.accent);
  });
});

describe('applyUrlOverrides', () => {
  it('should apply skin from URL params', () => {
    vi.stubGlobal('location', { search: '?skin=minimal&theme=gold' });
    applyUrlOverrides();
    const config = getSkinConfig();
    expect(config.skin).toBe('minimal');
    expect(config.theme).toBe('gold');
  });

  it('should ignore invalid skin names', () => {
    setSkin('arena');
    vi.stubGlobal('location', { search: '?skin=invalid' });
    applyUrlOverrides();
    expect(getSkinConfig().skin).toBe('arena');
  });

  it('should ignore invalid theme names', () => {
    setTheme('neon');
    vi.stubGlobal('location', { search: '?theme=invalid' });
    applyUrlOverrides();
    expect(getSkinConfig().theme).toBe('neon');
  });
});
