import { computed, Injectable, signal } from '@angular/core';
import type { ExperienceSummary, LootItem, ProfileAchievement } from './hero-control.models';

@Injectable({ providedIn: 'root' })
export class HeroControlState {
  private readonly _experience = signal<ExperienceSummary>({
    level: 5,
    current: 2480,
    nextLevel: 3000,
  });

  private readonly _achievements = signal<ProfileAchievement[]>([
    {
      id: 'team-strategist',
      title: 'Estrategista da Guilda',
      description: 'Entregue 10 missões em sequência sem atrasos.',
      progress: 72,
    },
    {
      id: 'combo-master',
      title: 'Combo Master',
      description: 'Conclua 3 épicos no mesmo sprint.',
      progress: 46,
    },
    {
      id: 'guardian',
      title: 'Guardião da Qualidade',
      description: 'Zere o número de bugs críticos por duas semanas.',
      progress: 88,
    },
  ]);

  private readonly _loot = signal<LootItem[]>([
    { id: 'phoenix-feather', name: 'Pena de Fênix', quantity: 2, rarity: 'raro' },
    { id: 'ancient-coin', name: 'Moeda Arcana', quantity: 47, rarity: 'comum' },
    { id: 'starlight-seal', name: 'Selo Luz das Estrelas', quantity: 1, rarity: 'lendário' },
  ]);

  readonly experience = this._experience.asReadonly();
  readonly achievements = this._achievements.asReadonly();
  readonly loot = this._loot.asReadonly();

  readonly experienceProgress = computed(() => {
    const { current, nextLevel } = this._experience();

    if (nextLevel <= 0) {
      return 0;
    }

    return Math.min(Math.round((current / nextLevel) * 100), 100);
  });

  trackAchievement(_: number, achievement: ProfileAchievement): string {
    return achievement.id;
  }

  trackLoot(_: number, lootItem: LootItem): string {
    return lootItem.id;
  }
}
