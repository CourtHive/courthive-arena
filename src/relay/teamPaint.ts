import { getResolvedTheme, getSkinConfig } from '../stores/skinConfig.svelte';
import { teamRoleStyles } from 'courthive-components/team-colors';

// constants and types
import type { MatchState } from '../stores/matchState.svelte';

export function teamPaint(match: MatchState, side: 1 | 2, region: 'team' | 'score' = 'team'): string {
  const theme = getResolvedTheme();
  const manual = getSkinConfig().customColors[`side${side}`];
  const colors = manual ? undefined : match.teamBranding?.teams[side]?.colors;
  return teamRoleStyles(colors, { background: theme.bg, text: theme.text }, region);
}
