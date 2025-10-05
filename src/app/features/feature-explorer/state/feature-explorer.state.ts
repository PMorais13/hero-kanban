import { computed, inject, Injectable } from '@angular/core';
import type { Feature, Priority, Story } from '@features/board/state/board.models';
import { BoardConfigState } from '@features/board/state/board-config.state';
import { BoardState } from '@features/board/state/board-state.service';
import type {
  FeatureDetailViewModel,
  FeatureOverviewCardViewModel,
  FeatureStoryCardViewModel,
} from './feature-explorer.models';
import type { CreateFeaturePayload } from '@features/board/state/board.models';

const PRIORITY_METADATA: Record<Priority, { readonly label: string; readonly color: string }> = {
  low: { label: 'Baixo', color: 'var(--hk-priority-low)' },
  medium: { label: 'Médio', color: 'var(--hk-priority-medium)' },
  high: { label: 'Alto', color: 'var(--hk-priority-high)' },
  critical: { label: 'Crítico', color: 'var(--hk-priority-critical)' },
} as const;

@Injectable({ providedIn: 'root' })
export class FeatureExplorerState {
  private readonly boardState = inject(BoardState);
  private readonly boardConfig = inject(BoardConfigState);

  readonly featureCards = computed<readonly FeatureOverviewCardViewModel[]>(() => {
    const features = this.boardState.features();
    const stories = this.boardState.stories();
    const storyCountByFeature = stories.reduce(
      (accumulator, story) => accumulator.set(story.featureId, (accumulator.get(story.featureId) ?? 0) + 1),
      new Map<string, number>(),
    );

    return features
      .map((feature) => this.toFeatureCard(feature, storyCountByFeature.get(feature.id) ?? 0))
      .sort((a, b) => a.title.localeCompare(b.title, 'pt-BR'));
  });

  private readonly featureDetailsMap = computed<ReadonlyMap<string, FeatureDetailViewModel>>(() => {
    const statuses = this.boardConfig.statuses();
    const statusById = new Map(statuses.map((status) => [status.id, status] as const));
    const features = this.boardState.features();
    const stories = this.boardState.stories();

    const storyCardsByFeature = new Map<string, FeatureStoryCardViewModel[]>();
    for (const story of stories) {
      const status = statusById.get(story.statusId);
      const statusLabel = status?.name ?? 'Status desconhecido';
      const statusColor = status?.color ?? '#94a3b8';
      const storyCard = this.toStoryCard(story, statusLabel, statusColor);
      const existing = storyCardsByFeature.get(story.featureId) ?? [];
      storyCardsByFeature.set(story.featureId, [...existing, storyCard]);
    }

    return new Map(
      features.map((feature) => {
        const storyCards = [...(storyCardsByFeature.get(feature.id) ?? [])];
        storyCards.sort((a, b) => a.title.localeCompare(b.title, 'pt-BR'));

        return [
          feature.id,
          {
            id: feature.id,
            title: feature.title,
            theme: feature.theme,
            mission: feature.mission,
            xpRewardLabel: `${feature.xpReward} XP`,
            progressPercent: Math.round(feature.progress * 100),
            storyCount: storyCards.length,
            stories: storyCards,
          } satisfies FeatureDetailViewModel,
        ] as const;
      }),
    );
  });

  getFeatureDetail(featureId: string): FeatureDetailViewModel | undefined {
    return this.featureDetailsMap().get(featureId);
  }

  createFeature(payload: CreateFeaturePayload): void {
    this.boardState.createFeature(payload);
  }

  private toFeatureCard(feature: Feature, storyCount: number): FeatureOverviewCardViewModel {
    return {
      id: feature.id,
      title: feature.title,
      theme: feature.theme,
      mission: feature.mission,
      progressPercent: Math.round(feature.progress * 100),
      storyCount,
      xpRewardLabel: `${feature.xpReward} XP`,
    } satisfies FeatureOverviewCardViewModel;
  }

  private toStoryCard(
    story: Story,
    statusLabel: string,
    statusColor: string,
  ): FeatureStoryCardViewModel {
    const priorityMetadata = PRIORITY_METADATA[story.priority];
    const totalChecklistItems = story.tasks.length;
    const completedChecklistItems = story.tasks.filter((task) => task.isDone).length;

    const checklistProgressLabel =
      totalChecklistItems === 0
        ? 'Sem checklist'
        : `${completedChecklistItems}/${totalChecklistItems} checklist`;

    return {
      id: story.id,
      title: story.title,
      statusLabel,
      statusColor,
      priorityLabel: priorityMetadata.label,
      priorityColor: priorityMetadata.color,
      assignee: story.assignee,
      xpLabel: `${story.xp} XP`,
      estimateLabel: `${story.estimate} pts`,
      checklistProgressLabel,
      dueLabel: story.dueDate ? this.formatDueDate(story.dueDate) : undefined,
    } satisfies FeatureStoryCardViewModel;
  }

  private formatDueDate(dueIso: string): string {
    const dueDate = new Date(dueIso);
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: 'short',
    }).format(dueDate);
  }
}
