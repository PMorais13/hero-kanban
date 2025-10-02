import { computed, Injectable, signal } from '@angular/core';
import type { BoardStatus } from './board.models';

type BoardStatusEditorOption = Readonly<{
  id: string;
  name: string;
  description: string;
  icon: string;
  isActive: boolean;
  order: number;
}>;

@Injectable({ providedIn: 'root' })
export class BoardConfigState {
  private readonly _statuses = signal<BoardStatus[]>([
    {
      id: 'backlog',
      name: 'Backlog Estratégico',
      shortLabel: 'Backlog',
      description: 'Ideias priorizadas aguardando missão de kickoff.',
      category: 'todo',
      color: '#6366f1',
      icon: 'lightbulb',
      order: 1,
      wipLimit: 12,
      isActive: true,
      allowedTransitions: ['ready', 'icebox'],
    },
    {
      id: 'ready',
      name: 'Preparação',
      shortLabel: 'Ready',
      description: 'Briefing validado, squad alinhado e artefatos prontos.',
      category: 'todo',
      color: '#a855f7',
      icon: 'rocket_launch',
      order: 2,
      wipLimit: 6,
      isActive: true,
      allowedTransitions: ['in_dev', 'backlog'],
    },
    {
      id: 'in_dev',
      name: 'Em Desenvolvimento',
      shortLabel: 'Dev',
      description: 'Squad em missão ativa, acompanhando XP diário.',
      category: 'in_progress',
      color: '#f97316',
      icon: 'smart_toy',
      order: 3,
      wipLimit: 4,
      isActive: true,
      allowedTransitions: ['code_review', 'blocked', 'ready'],
    },
    {
      id: 'code_review',
      name: 'Revisão & Playtest',
      shortLabel: 'Review',
      description: 'QA funcional, feedback dos jogadores e ajuste fino.',
      category: 'in_progress',
      color: '#facc15',
      icon: 'stadia_controller',
      order: 4,
      wipLimit: 3,
      isActive: true,
      allowedTransitions: ['release', 'in_dev'],
    },
    {
      id: 'release',
      name: 'Implantação Épica',
      shortLabel: 'Deploy',
      description: 'Feature pronta para o lançamento global.',
      category: 'in_progress',
      color: '#38bdf8',
      icon: 'rocket',
      order: 5,
      wipLimit: 2,
      isActive: true,
      allowedTransitions: ['done', 'code_review'],
    },
    {
      id: 'done',
      name: 'Concluído',
      shortLabel: 'Done',
      description: 'Missões que renderam XP para a guilda.',
      category: 'done',
      color: '#34d399',
      icon: 'emoji_events',
      order: 6,
      isActive: true,
      allowedTransitions: ['release'],
    },
    {
      id: 'icebox',
      name: 'Icebox',
      shortLabel: 'Ice',
      description: 'Ideias estacionadas aguardando novo contexto.',
      category: 'todo',
      color: '#94a3b8',
      icon: 'ac_unit',
      order: 0,
      isActive: false,
      allowedTransitions: ['backlog'],
    },
    {
      id: 'blocked',
      name: 'Bloqueado',
      shortLabel: 'Block',
      description: 'Dependências ou riscos críticos identificados.',
      category: 'in_progress',
      color: '#ef4444',
      icon: 'report',
      order: 7,
      wipLimit: 2,
      isActive: true,
      allowedTransitions: ['in_dev', 'code_review'],
    },
  ]);

  private readonly _newStatusName = signal('');

  readonly statuses = this._statuses.asReadonly();
  readonly statusOptions = computed<readonly BoardStatusEditorOption[]>(() =>
    [...this._statuses()]
      .sort((a, b) => a.order - b.order)
      .map((status): BoardStatusEditorOption => ({
        id: status.id,
        name: status.name,
        description: status.description,
        icon: status.icon,
        isActive: status.isActive,
        order: status.order,
      })),
  );
  readonly newStatusName = this._newStatusName.asReadonly();

  readonly canCreateStatus = computed(() => {
    const candidate = this._newStatusName().trim();

    if (candidate.length < 3) {
      return false;
    }

    const normalizedName = candidate.toLowerCase();
    const baseId = this.buildStatusId(candidate);

    return !this._statuses().some(
      (status) =>
        status.id === baseId ||
        status.name.toLowerCase() === normalizedName ||
        status.shortLabel.toLowerCase() === normalizedName,
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
    const label = this.normalizeTitle(name);

    this._statuses.update((statuses) => {
      const nextOrder = statuses.reduce((highest, status) => Math.max(highest, status.order), 0) + 1;
      const nextStatuses = statuses.map((status) =>
        status.category === 'done'
          ? status
          : {
              ...status,
              allowedTransitions: this.appendTransition(status.allowedTransitions, uniqueId),
            },
      );

      return [
        ...nextStatuses,
        {
          id: uniqueId,
          name: label,
          shortLabel: this.buildShortLabel(label),
          description: `Missões na etapa ${name.toLowerCase()}.`,
          category: 'in_progress',
          color: '#0ea5e9',
          icon: 'flag',
          order: nextOrder,
          isActive: true,
          allowedTransitions: ['done'],
        },
      ];
    });

    this._newStatusName.set('');
  }

  toggleStatus(statusId: string, isActive: boolean): void {
    this._statuses.update((statuses) =>
      statuses.map((status) =>
        status.id === statusId
          ? {
              ...status,
              isActive,
            }
          : status,
      ),
    );
  }

  updateStatusName(statusId: string, name: string): void {
    const normalized = this.normalizeTitle(name);

    this._statuses.update((statuses) =>
      statuses.map((status) =>
        status.id === statusId
          ? {
              ...status,
              name: normalized,
              shortLabel: this.buildShortLabel(normalized),
            }
          : status,
      ),
    );
  }

  updateStatusDescription(statusId: string, description: string): void {
    const sanitized = description.replace(/\s+/g, ' ').trimStart();

    this._statuses.update((statuses) =>
      statuses.map((status) =>
        status.id === statusId
          ? {
              ...status,
              description: sanitized.trimEnd(),
            }
          : status,
      ),
    );
  }

  updateStatusIcon(statusId: string, icon: string): void {
    const sanitized = icon.trim();
    const nextIcon = sanitized.length > 0 ? sanitized : 'flag';

    this._statuses.update((statuses) =>
      statuses.map((status) =>
        status.id === statusId
          ? {
              ...status,
              icon: nextIcon,
            }
          : status,
      ),
    );
  }

  moveStatus(statusId: string, direction: 'up' | 'down'): void {
    this._statuses.update((statuses) => {
      const sorted = [...statuses].sort((a, b) => a.order - b.order);
      const currentIndex = sorted.findIndex((status) => status.id === statusId);

      if (currentIndex === -1) {
        return statuses;
      }

      const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;

      if (targetIndex < 0 || targetIndex >= sorted.length) {
        return statuses;
      }

      const [moved] = sorted.splice(currentIndex, 1);
      sorted.splice(targetIndex, 0, moved);

      return sorted.map((status, index) => ({
        ...status,
        order: index,
      }));
    });
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
    const statuses = this._statuses();

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

  private normalizeTitle(value: string): string {
    const trimmed = value.replace(/\s+/g, ' ').trim();

    if (trimmed.length === 0) {
      return '';
    }

    return trimmed[0].toUpperCase() + trimmed.slice(1);
  }

  private buildShortLabel(value: string): string {
    if (value.length <= 12) {
      return value;
    }

    return `${value.slice(0, 11)}…`;
  }

  private appendTransition(
    transitions: readonly string[],
    nextStatusId: string,
  ): readonly string[] {
    if (transitions.includes(nextStatusId)) {
      return transitions;
    }

    return [...transitions, nextStatusId];
  }
}

export type { BoardStatusEditorOption };
