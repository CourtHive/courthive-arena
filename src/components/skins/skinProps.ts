import type { MatchState } from '../../stores/matchState.svelte';
import type { PlayerInfo } from '../../relay/roster';
import type { SkinConfig } from '../../stores/skinConfig.svelte';

export interface SkinProps {
  match: MatchState;
  side1Player?: PlayerInfo;
  side2Player?: PlayerInfo;
  config: SkinConfig;
  formatMs: (ms: number) => string;
}
