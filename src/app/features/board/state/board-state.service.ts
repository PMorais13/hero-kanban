import { computed, inject, Injectable, signal } from '@angular/core';
import type {
  BoardCardViewModel,
  BoardColumnViewModel,
  BoardStatus,
  Feature,
  Mission,
  Story,
  TeamProgressSummary,
} from './board.models';
import { BoardConfigState } from './board-config.state';

const PRIORITY_COLORS: Record<string, string> = {
  low: '#4ade80',
  medium: '#facc15',
  high: '#fb7185',
  critical: '#f97316',
} as const;

const XP_PER_LEVEL = 120;

@Injectable({ providedIn: 'root' })
export class BoardState {
  private readonly boardConfig = inject(BoardConfigState);

  private readonly _features = signal<Feature[]>([
    {
      id: 'feat-progress-graph',
      title: 'Mapa de Progressão do Time',
      theme: 'Transparência e feedback contínuo',
      xpReward: 250,
      progress: 0.6,
      mission: 'Transformar métricas em narrativa visual acessível.',
    },
    {
      id: 'feat-guild-rewards',
      title: 'Recompensas de Guilda',
      theme: 'Reforço positivo colaborativo',
      xpReward: 320,
      progress: 0.35,
      mission: 'Criar sistema de desbloqueio de cosméticos e efeitos.',
    },
  ]);

  private readonly _missions = signal<Mission[]>([
    {
      id: 'mission-daily-subtasks',
      title: 'Missão Relâmpago',
      cadence: 'daily',
      target: 'Concluir 3 subtarefas hoje',
      reward: '+30 XP para o time',
      progress: 0.66,
    },
    {
      id: 'mission-weekly-flow',
      title: 'Sprint Impecável',
      cadence: 'weekly',
      target: 'Fechar a sprint sem bloqueios por 48h',
      reward: 'Desbloqueio de tema Neon Drift',
      progress: 0.4,
    },
  ]);

  private readonly _stories = signal<Story[]>([
    {
      id: 'story-flow-analytics',
      featureId: 'feat-progress-graph',
      title: 'Painel de Lead e Cycle Time',
      statusId: 'in_dev',
      priority: 'critical',
      estimate: 5,
      assignee: 'Aline Santos',
      labels: ['Analytics', 'Observability'],
      xp: 85,
      completedChecklistItems: 3,
      totalChecklistItems: 5,
      dueDate: new Date().toISOString(),
    },
    {
      id: 'story-avatars',
      featureId: 'feat-guild-rewards',
      title: 'Editor de Avatares Cooperativo',
      statusId: 'ready',
      priority: 'high',
      estimate: 8,
      assignee: 'Diego Martins',
      labels: ['Gamificação', 'UI'],
      xp: 110,
      completedChecklistItems: 1,
      totalChecklistItems: 6,
      dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 3).toISOString(),
    },
    {
      id: 'story-mission-engine',
      featureId: 'feat-guild-rewards',
      title: 'Motor de Missões Semanais',
      statusId: 'code_review',
      priority: 'medium',
      estimate: 3,
      assignee: 'Helena Pires',
      labels: ['Backend', 'Gamificação'],
      xp: 60,
      completedChecklistItems: 4,
      totalChecklistItems: 4,
    },
    {
      id: 'story-cfd',
      featureId: 'feat-progress-graph',
      title: 'Cumulative Flow Diagram Interativo',
      statusId: 'release',
      priority: 'high',
      estimate: 5,
      assignee: 'Iuri Paiva',
      labels: ['Analytics', 'Data Viz'],
      xp: 95,
      completedChecklistItems: 5,
      totalChecklistItems: 6,
    },
    {
      id: 'story-team-buffs',
      featureId: 'feat-guild-rewards',
      title: 'Buffs de Produtividade Coletiva',
      statusId: 'backlog',
      priority: 'medium',
      estimate: 5,
      assignee: 'Clara Sato',
      labels: ['Pesquisa', 'UX'],
      xp: 70,
      completedChecklistItems: 0,
      totalChecklistItems: 5,
    },
    {
      id: 'story-onboarding',
      featureId: 'feat-progress-graph',
      title: 'Onboarding Gamificado',
      statusId: 'done',
      priority: 'low',
      estimate: 2,
      assignee: 'Rafael Lima',
      labels: ['Growth'],
      xp: 40,
      completedChecklistItems: 5,
      totalChecklistItems: 5,
    },
  ]);

  readonly columns = computed<readonly BoardColumnViewModel[]>(() => {
    const activeStatuses = [...this.boardConfig.statuses()].filter((status) => status.isActive);
    activeStatuses.sort((a, b) => a.order - b.order);
    return activeStatuses.map((status) => {
      const cards = this._stories()
        .filter((story) => story.statusId === status.id)
        .map((story) => this.toCardViewModel(story));
      const wipLimit = status.wipLimit;
      const wipCount = cards.length;
      return {
        status,
        cards,
        wipCount,
        wipLimit,
        isWipLimitBreached: wipLimit !== undefined && wipCount > wipLimit,
      } satisfies BoardColumnViewModel;
    });
  });

  readonly summary = computed<TeamProgressSummary>(() => {
    const statusesById = new Map(this.boardConfig.statuses().map((status) => [status.id, status] as const));
    const completedStories = this._stories().filter((story) => statusesById.get(story.statusId)?.category === 'done');
    const xpEarned = completedStories.reduce((total, story) => total + story.xp, 0);
    const level = Math.floor(xpEarned / XP_PER_LEVEL) + 1;
    const xpIntoLevel = xpEarned % XP_PER_LEVEL;
    const xpToNextLevel = XP_PER_LEVEL - xpIntoLevel;
    const xpProgressPercent = Math.round((xpIntoLevel / XP_PER_LEVEL) * 100);
    return {
      level,
      xpEarned,
      xpToNextLevel,
      xpProgressPercent,
      completedStories: completedStories.length,
      activeFeatures: this._features().filter((feature) => feature.progress > 0).length,
      weeklyThroughput: completedStories.length,
      missions: this._missions(),
    } satisfies TeamProgressSummary;
  });

  moveStory(storyId: string, nextStatusId: string): boolean {
    if (!this.isMoveAllowed(storyId, nextStatusId)) {
      return false;
    }

    this._stories.update((stories) =>
      stories.map((item) => (item.id === storyId ? { ...item, statusId: nextStatusId } : item)),
    );

    return true;
  }

  canMoveStory(storyId: string, nextStatusId: string): boolean {
    return this.isMoveAllowed(storyId, nextStatusId);
  }

  private isMoveAllowed(storyId: string, nextStatusId: string): boolean {
    const statusesById = this.getStatusesById();
    const story = this._stories().find((item) => item.id === storyId);
    const nextStatus = statusesById.get(nextStatusId);
    if (!story || !nextStatus || story.statusId === nextStatusId) {
      return false;
    }

    const currentStatus = statusesById.get(story.statusId);
    const canTransition = currentStatus?.allowedTransitions.includes(nextStatusId) ?? false;
    if (!canTransition) {
      return false;
    }

    const allowedCount = nextStatus.wipLimit ?? Number.POSITIVE_INFINITY;
    const nextCount = this._stories().filter((item) => item.statusId === nextStatusId).length;
    if (nextCount >= allowedCount) {
      return false;
    }

    return true;
  }

  private getStatusesById(): Map<string, BoardStatus> {
    return new Map(this.boardConfig.statuses().map((status) => [status.id, status] as const));
  }

  private toCardViewModel(story: Story): BoardCardViewModel {
    const feature = this._features().find((item) => item.id === story.featureId);
    return {
      id: story.id,
      statusId: story.statusId,
      title: story.title,
      featureName: feature?.title ?? 'Feature desconhecida',
      priorityLabel: this.mapPriorityLabel(story.priority),
      priorityColor: PRIORITY_COLORS[story.priority],
      assignee: story.assignee,
      avatarInitials: this.createInitials(story.assignee),
      labels: story.labels,
      estimateLabel: `${story.estimate} pts`,
      xp: story.xp,
      checklistProgressLabel: `${story.completedChecklistItems}/${story.totalChecklistItems} checklist`,
      completionPercent:
        story.totalChecklistItems === 0
          ? 0
          : Math.round((story.completedChecklistItems / story.totalChecklistItems) * 100),
      missionTagline: feature?.mission ?? 'Missão surpresa para a guilda.',
      dueLabel: story.dueDate ? this.formatDueDate(story.dueDate) : undefined,
    } satisfies BoardCardViewModel;
  }

  private mapPriorityLabel(priority: Story['priority']): string {
    switch (priority) {
      case 'critical':
        return 'Crítico';
      case 'high':
        return 'Alto';
      case 'medium':
        return 'Médio';
      case 'low':
      default:
        return 'Baixo';
    }
  }

  private createInitials(name: string): string {
    return name
      .split(' ')
      .filter(Boolean)
      .map((part) => part.at(0)?.toUpperCase() ?? '')
      .join('')
      .slice(0, 2);
  }

  private formatDueDate(dueIso: string): string {
    const dueDate = new Date(dueIso);
    const formatter = new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: 'short',
    });
    return formatter.format(dueDate);
  }
}
