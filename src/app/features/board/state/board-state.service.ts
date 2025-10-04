import { computed, inject, Injectable, signal } from '@angular/core';
import type {
  BoardCardViewModel,
  BoardColumnViewModel,
  BoardStatus,
  BoardStatusWithCapacity,
  CreateFeaturePayload,
  CreateSprintPayload,
  CreateStoryPayload,
  Feature,
  Mission,
  Priority,
  Sprint,
  SprintFilterOption,
  SprintOverviewViewModel,
  SprintStoryTaskViewModel,
  SprintStoryViewModel,
  Story,
  StoryTask,
  StoryDetailsTaskViewModel,
  StoryDetailsViewModel,
  TeamProgressSummary,
} from './board.models';
import { BoardConfigState } from './board-config.state';

const PRIORITY_COLORS = {
  low: 'var(--hk-priority-low)',
  medium: 'var(--hk-priority-medium)',
  high: 'var(--hk-priority-high)',
  critical: 'var(--hk-priority-critical)',
} as const satisfies Record<Priority, string>;

const XP_PER_LEVEL = 120;
const ALL_SPRINTS_FILTER = 'all-sprints';

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

  createFeature(payload: CreateFeaturePayload): void {
    const featureId = `feat-${crypto.randomUUID?.() ?? Math.random().toString(36).slice(2)}`;

    const newFeature: Feature = {
      id: featureId,
      title: payload.title.trim(),
      theme: payload.theme.trim(),
      mission: payload.mission.trim(),
      xpReward: Math.max(0, Math.round(payload.xpReward)),
      progress: 0,
    };

    this._features.update((current) => [...current, newFeature]);
  }

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

  private readonly _sprints = signal<Sprint[]>([
    {
      id: 'sprint-nebula',
      name: 'Sprint Nebulosa',
      goal: 'Dar visibilidade previsível ao fluxo de valor.',
      focus: 'Analytics e narrativa do fluxo',
      startDateIso: '2024-06-03',
      endDateIso: '2024-06-14',
    },
    {
      id: 'sprint-aether',
      name: 'Sprint Aether',
      goal: 'Habilitar recompensas colaborativas com segurança.',
      focus: 'Gamificação e economia cooperativa',
      startDateIso: '2024-06-17',
      endDateIso: '2024-06-28',
    },
  ]);

  createSprint(payload: CreateSprintPayload): Sprint | null {
    const name = payload.name.trim();
    const goal = payload.goal.trim();
    const focus = payload.focus.trim();
    const startDateIso = payload.startDateIso.trim();
    const endDateIso = payload.endDateIso.trim();

    if (name.length < 3 || goal.length < 5 || focus.length < 3) {
      return null;
    }

    const startTimestamp = Date.parse(startDateIso);
    const endTimestamp = Date.parse(endDateIso);

    if (Number.isNaN(startTimestamp) || Number.isNaN(endTimestamp) || startTimestamp > endTimestamp) {
      return null;
    }

    const sprint: Sprint = {
      id: this.createId('sprint'),
      name,
      goal,
      focus,
      startDateIso,
      endDateIso,
    };

    this._sprints.update((current) => {
      const next = [...current, sprint];
      next.sort((a, b) => Date.parse(a.startDateIso) - Date.parse(b.startDateIso));
      return next;
    });

    return sprint;
  }

  private readonly _selectedSprintId = signal<string>(ALL_SPRINTS_FILTER);

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
      sprintId: 'sprint-nebula',
      xp: 85,
      tasks: [
        {
          id: 'task-flow-analytics-research',
          title: 'Mapear eventos de ciclo com o time de dados',
          isDone: true,
        },
        {
          id: 'task-flow-analytics-dashboard',
          title: 'Prototipar painéis de lead e cycle time',
          isDone: true,
        },
        {
          id: 'task-flow-analytics-api',
          title: 'Instrumentar coleta de métricas no backend',
          isDone: true,
        },
        {
          id: 'task-flow-analytics-narrative',
          title: 'Criar narrativa visual para squads acompanharem progresso',
          isDone: false,
        },
        {
          id: 'task-flow-analytics-review',
          title: 'Validar indicadores com chapter de produto',
          isDone: false,
        },
      ],
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
      sprintId: 'sprint-nebula',
      xp: 110,
      tasks: [
        {
          id: 'task-avatars-style',
          title: 'Definir estilo base dos avatares cooperativos',
          isDone: true,
        },
        {
          id: 'task-avatars-sync',
          title: 'Arquitetar sincronização em tempo real',
          isDone: false,
        },
        {
          id: 'task-avatars-store',
          title: 'Persistir acessórios desbloqueados da guilda',
          isDone: false,
        },
        {
          id: 'task-avatars-accessibility',
          title: 'Garantir contraste e acessibilidade nos temas',
          isDone: false,
        },
        {
          id: 'task-avatars-feedback',
          title: 'Prototipar animações de reação do squad',
          isDone: false,
        },
        {
          id: 'task-avatars-tests',
          title: 'Planejar testes multijogador no playtest interno',
          isDone: false,
        },
      ],
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
      sprintId: 'sprint-aether',
      xp: 60,
      tasks: [
        {
          id: 'task-mission-engine-schema',
          title: 'Modelar esquema de missões semanais',
          isDone: true,
        },
        {
          id: 'task-mission-engine-cron',
          title: 'Implementar rotinas de agendamento de missões',
          isDone: true,
        },
        {
          id: 'task-mission-engine-rules',
          title: 'Configurar regras de recompensa colaborativa',
          isDone: true,
        },
        {
          id: 'task-mission-engine-tests',
          title: 'Cobrir fluxo com testes automatizados',
          isDone: true,
        },
      ],
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
      sprintId: 'sprint-nebula',
      xp: 95,
      tasks: [
        {
          id: 'task-cfd-data',
          title: 'Consolidar dados históricos de fluxo',
          isDone: true,
        },
        {
          id: 'task-cfd-ux',
          title: 'Prototipar interações do gráfico cumulativo',
          isDone: true,
        },
        {
          id: 'task-cfd-performance',
          title: 'Otimizar consultas para carregamento dinâmico',
          isDone: true,
        },
        {
          id: 'task-cfd-tooltips',
          title: 'Implementar tooltips narrativos por etapa',
          isDone: true,
        },
        {
          id: 'task-cfd-story',
          title: 'Conectar progresso com storytelling de guilda',
          isDone: true,
        },
        {
          id: 'task-cfd-review',
          title: 'Validar insights com PM e analytics',
          isDone: false,
        },
      ],
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
      sprintId: 'sprint-aether',
      xp: 70,
      tasks: [
        {
          id: 'task-team-buffs-interviews',
          title: 'Entrevistar squads sobre rituais energizantes',
          isDone: false,
        },
        {
          id: 'task-team-buffs-catalog',
          title: 'Catalogar buffs colaborativos possíveis',
          isDone: false,
        },
        {
          id: 'task-team-buffs-scoring',
          title: 'Definir critérios de pontuação por buff',
          isDone: false,
        },
        {
          id: 'task-team-buffs-prototype',
          title: 'Prototipar painel de buffs para squads',
          isDone: false,
        },
        {
          id: 'task-team-buffs-validation',
          title: 'Rodar sessão de validação com chapter agile',
          isDone: false,
        },
      ],
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
      sprintId: 'sprint-nebula',
      xp: 40,
      tasks: [
        {
          id: 'task-onboarding-journey',
          title: 'Mapear jornada de onboarding gamificada',
          isDone: true,
        },
        {
          id: 'task-onboarding-copy',
          title: 'Redigir narrativa de boas-vindas',
          isDone: true,
        },
        {
          id: 'task-onboarding-assets',
          title: 'Criar assets visuais para recompensas iniciais',
          isDone: true,
        },
        {
          id: 'task-onboarding-instrumentation',
          title: 'Instrumentar métricas de adesão',
          isDone: true,
        },
        {
          id: 'task-onboarding-playtest',
          title: 'Executar playtest com novos membros da guilda',
          isDone: true,
        },
      ],
    },
  ]);

  readonly features = this._features.asReadonly();
  readonly sprints = this._sprints.asReadonly();
  readonly stories = this._stories.asReadonly();
  readonly selectedSprintId = this._selectedSprintId.asReadonly();

  readonly sprintFilterOptions = computed<readonly SprintFilterOption[]>(() => {
    return [
      { id: ALL_SPRINTS_FILTER, label: 'Todas as sprints' },
      ...this._sprints().map((sprint) => ({
        id: sprint.id,
        label: `${sprint.name} · ${this.formatSprintPeriod(sprint)}`,
      } satisfies SprintFilterOption)),
    ];
  });

  readonly sprintOverviews = computed<readonly SprintOverviewViewModel[]>(() => {
    const statusesById = this.getStatusesById();
    return this._sprints().map((sprint) => {
      const sprintStories = this._stories().filter((story) => story.sprintId === sprint.id);
      const stories = sprintStories.map((story) => {
        const status = statusesById.get(story.statusId);
        return {
          id: story.id,
          title: story.title,
          estimateLabel: `${story.estimate} pts`,
          statusLabel: status?.name ?? 'Etapa desconhecida',
          statusColor: status?.color ?? 'var(--hk-status-icebox)',
          tasks: story.tasks.map((task) => ({
            id: task.id,
            title: task.title,
            isDone: task.isDone,
          }) satisfies SprintStoryTaskViewModel),
        } satisfies SprintStoryViewModel;
      });
      const totalPoints = sprintStories.reduce((total, story) => total + story.estimate, 0);
      const completedStories = sprintStories.filter((story) =>
        (statusesById.get(story.statusId)?.category ?? 'todo') === 'done',
      ).length;
      return {
        sprint,
        periodLabel: this.formatSprintPeriod(sprint),
        totalPoints,
        plannedStories: sprintStories.length,
        completedStories,
        focus: sprint.focus,
        stories,
      } satisfies SprintOverviewViewModel;
    });
  });

  readonly columns = computed<readonly BoardColumnViewModel[]>(() => {
    const activeStatuses = [...this.boardConfig.statuses()].filter((status) => status.isActive);
    activeStatuses.sort((a, b) => a.order - b.order);
    const selectedSprintId = this._selectedSprintId();
    return activeStatuses.map((status) => {
      const cards = this._stories()
        .filter((story) => story.statusId === status.id && this.shouldIncludeStoryInSprint(story, selectedSprintId))
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

  readonly statusOptions = computed<readonly BoardStatusWithCapacity[]>(() => {
    const activeStatuses = [...this.boardConfig.statuses()].filter((status) => status.isActive);
    activeStatuses.sort((a, b) => a.order - b.order);
    const selectedSprintId = this._selectedSprintId();

    return activeStatuses.map((status) => {
      const wipCount = this._stories().filter(
        (story) => story.statusId === status.id && this.shouldIncludeStoryInSprint(story, selectedSprintId),
      ).length;
      const wipLimit = status.wipLimit;
      const isAtLimit = wipLimit !== undefined && wipCount >= wipLimit;
      return { status, wipCount, wipLimit, isAtLimit } satisfies BoardStatusWithCapacity;
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

  setSprintFilter(sprintId: string): void {
    if (sprintId === this._selectedSprintId()) {
      return;
    }

    const isValid = sprintId === ALL_SPRINTS_FILTER || this._sprints().some((sprint) => sprint.id === sprintId);
    this._selectedSprintId.set(isValid ? sprintId : ALL_SPRINTS_FILTER);
  }

  trackSprintOverview(_: number, overview: SprintOverviewViewModel): string {
    return overview.sprint.id;
  }

  trackSprintStory(_: number, story: SprintStoryViewModel): string {
    return story.id;
  }

  trackSprintTask(_: number, task: SprintStoryTaskViewModel): string {
    return task.id;
  }

  getStoryDetails(storyId: string): StoryDetailsViewModel | null {
    const story = this._stories().find((item) => item.id === storyId);
    if (!story) {
      return null;
    }

    return this.toStoryDetailsViewModel(story);
  }

  createStory(draft: CreateStoryPayload): Story | null {
    const statusesById = this.getStatusesById();
    const nextStatus = statusesById.get(draft.statusId);
    const title = draft.title.trim();
    const assignee = draft.assignee.trim();

    if (!nextStatus || !nextStatus.isActive || title.length === 0 || assignee.length === 0) {
      return null;
    }

    if (!this.hasCapacityForStatus(nextStatus)) {
      return null;
    }

    const featureExists = this._features().some((feature) => feature.id === draft.featureId);
    if (!featureExists) {
      return null;
    }

    const labels = draft.labels.map((label) => label.trim()).filter((label) => label.length > 0);
    const tasks = draft.tasks
      .map((task) => ({
        title: task.title.trim(),
        isDone: task.isDone,
      }))
      .filter((task) => task.title.length > 0)
      .map((task) => ({
        id: this.createId('task'),
        title: task.title,
        isDone: task.isDone,
      }) satisfies StoryTask);

    const sprintId =
      draft.sprintId && this._sprints().some((sprint) => sprint.id === draft.sprintId) ? draft.sprintId : undefined;

    const newStory: Story = {
      id: this.createId('story'),
      featureId: draft.featureId,
      title,
      statusId: nextStatus.id,
      priority: draft.priority,
      estimate: draft.estimate,
      assignee,
      labels,
      xp: draft.xp,
      tasks,
      dueDate: draft.dueDate && draft.dueDate.length > 0 ? draft.dueDate : undefined,
      sprintId,
    } satisfies Story;

    this._stories.update((stories) => [newStory, ...stories]);

    return newStory;
  }

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

    if (!this.hasCapacityForStatus(nextStatus)) {
      return false;
    }

    return true;
  }

  private getStatusesById(): Map<string, BoardStatus> {
    return new Map(this.boardConfig.statuses().map((status) => [status.id, status] as const));
  }

  private shouldIncludeStoryInSprint(story: Story, selectedSprintId: string): boolean {
    if (selectedSprintId === ALL_SPRINTS_FILTER) {
      return true;
    }

    return story.sprintId === selectedSprintId;
  }

  private formatSprintPeriod(sprint: Sprint): string {
    const formatter = new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: 'short',
    });
    const start = formatter.format(new Date(sprint.startDateIso));
    const end = formatter.format(new Date(sprint.endDateIso));
    return `${start} – ${end}`;
  }

  private hasCapacityForStatus(status: BoardStatus): boolean {
    const allowedCount = status.wipLimit ?? Number.POSITIVE_INFINITY;
    const nextCount = this._stories().filter((item) => item.statusId === status.id).length;
    return nextCount < allowedCount;
  }

  private createId(prefix: string): string {
    if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
      return `${prefix}-${crypto.randomUUID()}`;
    }

    return `${prefix}-${Math.random().toString(36).slice(2, 10)}-${Date.now().toString(36)}`;
  }

  private toCardViewModel(story: Story): BoardCardViewModel {
    const feature = this._features().find((item) => item.id === story.featureId);
    const totalChecklistItems = story.tasks.length;
    const completedChecklistItems = story.tasks.filter((task) => task.isDone).length;
    const checklistProgressLabel =
      totalChecklistItems === 0
        ? 'Sem checklist'
        : `${completedChecklistItems}/${totalChecklistItems} checklist`;
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
      checklistProgressLabel,
      completionPercent:
        totalChecklistItems === 0 ? 0 : Math.round((completedChecklistItems / totalChecklistItems) * 100),
      missionTagline: feature?.mission ?? 'Missão surpresa para a guilda.',
      dueLabel: story.dueDate ? this.formatDueDate(story.dueDate) : undefined,
    } satisfies BoardCardViewModel;
  }

  private toStoryDetailsViewModel(story: Story): StoryDetailsViewModel {
    const feature = this._features().find((item) => item.id === story.featureId);
    const status = this.getStatusesById().get(story.statusId);
    const sprint = story.sprintId
      ? this._sprints().find((item) => item.id === story.sprintId)
      : undefined;
    const tasks = story.tasks.map(
      (task) =>
        ({
          id: task.id,
          title: task.title,
          isDone: task.isDone,
        }) satisfies StoryDetailsTaskViewModel,
    );
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter((task) => task.isDone).length;
    const checklistProgressLabel =
      totalTasks === 0 ? 'Sem tarefas' : `${completedTasks}/${totalTasks} tarefas`;
    const completionPercent =
      totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);

    return {
      id: story.id,
      title: story.title,
      featureName: feature?.title ?? 'Feature desconhecida',
      featureTheme: feature?.theme ?? 'Tema desconhecido',
      featureMission: feature?.mission ?? 'Missão a ser definida com o squad.',
      statusLabel: status?.name ?? 'Etapa desconhecida',
      statusDescription: status?.description ?? 'Etapa não mapeada no fluxo do quadro.',
      statusColor: status?.color ?? 'var(--hk-status-icebox)',
      statusIcon: status?.icon ?? 'help',
      priorityLabel: this.mapPriorityLabel(story.priority),
      priorityColor: PRIORITY_COLORS[story.priority],
      assignee: story.assignee,
      avatarInitials: this.createInitials(story.assignee),
      estimateLabel: `${story.estimate} pts`,
      xp: story.xp,
      labels: story.labels,
      dueLabel: story.dueDate ? this.formatDueDate(story.dueDate) : undefined,
      sprintLabel: sprint ? `${sprint.name} · ${this.formatSprintPeriod(sprint)}` : undefined,
      tasks,
      completedTasks,
      totalTasks,
      checklistProgressLabel,
      completionPercent,
    } satisfies StoryDetailsViewModel;
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
