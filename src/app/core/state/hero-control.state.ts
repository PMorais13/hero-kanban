import { computed, Injectable, signal } from '@angular/core';
import type {
  BoardStatusOption,
  ExperienceSummary,
  LootItem,
  ProfileAchievement,
} from './hero-control.models';

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

  private readonly _boardStatuses = signal<BoardStatusOption[]>([
    {
      id: 'backlog',
      label: 'Backlog',
      description: 'Ideias e missões futuras aguardando priorização.',
      isActive: true,
    },
    {
      id: 'in-progress',
      label: 'Em andamento',
      description: 'Missões que estão sendo executadas neste momento.',
      isActive: true,
    },
    {
      id: 'review',
      label: 'Em revisão',
      description: 'Missões aguardando validação pela guilda.',
      isActive: true,
    },
    {
      id: 'done',
      label: 'Concluído',
      description: 'Missões completadas e celebradas pela equipe.',
      isActive: true,
    },
  ]);

  private readonly _newStatusName = signal('');

  readonly experience = this._experience.asReadonly();
  readonly achievements = this._achievements.asReadonly();
  readonly loot = this._loot.asReadonly();
  readonly boardStatuses = this._boardStatuses.asReadonly();
  readonly newStatusName = this._newStatusName.asReadonly();

  readonly experienceProgress = computed(() => {
    const { current, nextLevel } = this._experience();

    if (nextLevel <= 0) {
      return 0;
    }

    return Math.min(Math.round((current / nextLevel) * 100), 100);
  });

  readonly canCreateStatus = computed(() => {
    const candidate = this._newStatusName().trim();

    if (candidate.length < 3) {
      return false;
    }

    const normalizedName = candidate.toLowerCase();
    const baseId = this.buildStatusId(candidate);

    return !this._boardStatuses().some(
      (status) =>
        status.id === baseId || status.label.toLowerCase() === normalizedName,
    );
  });

  updateNewStatusName(value: string): void {
    this._newStatusName.set(value);
  }

  addCustomStatus(): void {
    if (!this.canCreateStatus()) {
      return;
    }

    const name = this._newStatusName().trim();
    const baseId = this.buildStatusId(name);
    const uniqueId = this.resolveUniqueStatusId(baseId);
    const label = this.capitalize(name);

    this._boardStatuses.update((statuses) => [
      ...statuses,
      {
        id: uniqueId,
        label,
        description: `Missões na etapa ${name.toLowerCase()}.`,
        isActive: true,
      },
    ]);

    this._newStatusName.set('');
  }

  toggleStatus(statusId: string, isActive: boolean): void {
    this._boardStatuses.update((statuses) =>
      statuses.map((status) =>
        status.id === statusId ? { ...status, isActive } : status,
      ),
    );
  }

  trackAchievement(_: number, achievement: ProfileAchievement): string {
    return achievement.id;
  }

  trackLoot(_: number, lootItem: LootItem): string {
    return lootItem.id;
  }

  trackStatus(_: number, status: BoardStatusOption): string {
    return status.id;
  }

  private buildStatusId(rawName: string): string {
    const normalized = rawName
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

    return normalized || 'status';
  }

  private resolveUniqueStatusId(baseId: string): string {
    const statuses = this._boardStatuses();

    if (!statuses.some((status) => status.id === baseId)) {
      return baseId;
    }

    let suffix = 2;
    let candidate = `${baseId}-${suffix}`;

    while (statuses.some((status) => status.id === candidate)) {
      suffix += 1;
      candidate = `${baseId}-${suffix}`;
    }

    return candidate;
  }

  private capitalize(value: string): string {
    const trimmed = value.trim();

    if (trimmed.length === 0) {
      return '';
    }

    return trimmed[0].toUpperCase() + trimmed.slice(1);
  }
}
