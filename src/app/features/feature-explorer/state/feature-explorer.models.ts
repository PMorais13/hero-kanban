import type { Feature } from '@features/board/state/board.models';

export interface FeatureOverviewCardViewModel {
  readonly id: Feature['id'];
  readonly title: string;
  readonly theme: string;
  readonly mission: string;
  readonly progressPercent: number;
  readonly storyCount: number;
  readonly xpRewardLabel: string;
}

export interface FeatureStoryCardViewModel {
  readonly id: string;
  readonly title: string;
  readonly statusLabel: string;
  readonly statusColor: string;
  readonly priorityLabel: string;
  readonly priorityColor: string;
  readonly assignee: string;
  readonly xpLabel: string;
  readonly estimateLabel: string;
  readonly checklistProgressLabel: string;
  readonly dueLabel?: string;
}

export interface FeatureDetailViewModel {
  readonly id: Feature['id'];
  readonly title: string;
  readonly theme: string;
  readonly mission: string;
  readonly xpRewardLabel: string;
  readonly progressPercent: number;
  readonly storyCount: number;
  readonly stories: readonly FeatureStoryCardViewModel[];
}
