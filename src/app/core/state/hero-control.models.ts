export interface ProfileAchievement {
  readonly id: string;
  readonly title: string;
  readonly description: string;
  readonly progress: number;
}

export interface LootItem {
  readonly id: string;
  readonly name: string;
  readonly quantity: number;
  readonly rarity: 'comum' | 'raro' | 'lendário';
}

export interface ExperienceSummary {
  readonly level: number;
  readonly current: number;
  readonly nextLevel: number;
}
