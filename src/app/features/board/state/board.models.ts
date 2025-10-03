export type StatusCategory = 'todo' | 'in_progress' | 'done';

export interface BoardStatus {
  readonly id: string;
  readonly name: string;
  readonly shortLabel: string;
  readonly description: string;
  readonly category: StatusCategory;
  readonly color: string;
  readonly icon: string;
  readonly order: number;
  readonly wipLimit?: number;
  readonly isActive: boolean;
  readonly allowedTransitions: readonly string[];
}

export type SubTaskKind = 'subtask' | 'subbug';

export interface Mission {
  readonly id: string;
  readonly title: string;
  readonly cadence: 'daily' | 'weekly';
  readonly target: string;
  readonly reward: string;
  readonly progress: number;
}

export interface Sprint {
  readonly id: string;
  readonly name: string;
  readonly goal: string;
  readonly focus: string;
  readonly startDateIso: string;
  readonly endDateIso: string;
}

export interface CreateSprintPayload {
  readonly name: string;
  readonly goal: string;
  readonly focus: string;
  readonly startDateIso: string;
  readonly endDateIso: string;
}

export interface SprintFilterOption {
  readonly id: string;
  readonly label: string;
}

export type Priority = 'low' | 'medium' | 'high' | 'critical';

export interface StoryTask {
  readonly id: string;
  readonly title: string;
  readonly isDone: boolean;
}

export interface StoryTaskDraft {
  readonly title: string;
  readonly isDone: boolean;
}

export interface CreateStoryPayload {
  readonly title: string;
  readonly featureId: string;
  readonly statusId: string;
  readonly priority: Priority;
  readonly estimate: number;
  readonly assignee: string;
  readonly labels: readonly string[];
  readonly xp: number;
  readonly dueDate?: string;
  readonly tasks: readonly StoryTaskDraft[];
  readonly sprintId?: string | null;
}

export interface Story {
  readonly id: string;
  readonly featureId: string;
  readonly title: string;
  readonly statusId: string;
  readonly priority: Priority;
  readonly estimate: number;
  readonly assignee: string;
  readonly labels: readonly string[];
  readonly xp: number;
  readonly tasks: readonly StoryTask[];
  readonly dueDate?: string;
  readonly sprintId?: string;
}

export interface Feature {
  readonly id: string;
  readonly title: string;
  readonly theme: string;
  readonly xpReward: number;
  readonly progress: number;
  readonly mission: string;
}

export interface CreateFeaturePayload {
  readonly title: string;
  readonly theme: string;
  readonly mission: string;
  readonly xpReward: number;
}

export interface BoardCardViewModel {
  readonly id: string;
  readonly title: string;
  readonly featureName: string;
  readonly priorityLabel: string;
  readonly priorityColor: string;
  readonly assignee: string;
  readonly avatarInitials: string;
  readonly labels: readonly string[];
  readonly estimateLabel: string;
  readonly xp: number;
  readonly checklistProgressLabel: string;
  readonly completionPercent: number;
  readonly missionTagline: string;
  readonly dueLabel?: string;
  readonly statusId: string;
}

export interface BoardColumnViewModel {
  readonly status: BoardStatus;
  readonly cards: readonly BoardCardViewModel[];
  readonly wipCount: number;
  readonly wipLimit?: number;
  readonly isWipLimitBreached: boolean;
}

export interface BoardStatusWithCapacity {
  readonly status: BoardStatus;
  readonly wipCount: number;
  readonly wipLimit?: number;
  readonly isAtLimit: boolean;
}

export interface TeamProgressSummary {
  readonly level: number;
  readonly xpEarned: number;
  readonly xpToNextLevel: number;
  readonly xpProgressPercent: number;
  readonly completedStories: number;
  readonly activeFeatures: number;
  readonly weeklyThroughput: number;
  readonly missions: readonly Mission[];
}

export interface SprintStoryTaskViewModel {
  readonly id: string;
  readonly title: string;
  readonly isDone: boolean;
}

export interface SprintStoryViewModel {
  readonly id: string;
  readonly title: string;
  readonly estimateLabel: string;
  readonly statusLabel: string;
  readonly statusColor: string;
  readonly tasks: readonly SprintStoryTaskViewModel[];
}

export interface SprintOverviewViewModel {
  readonly sprint: Sprint;
  readonly periodLabel: string;
  readonly totalPoints: number;
  readonly plannedStories: number;
  readonly completedStories: number;
  readonly focus: string;
  readonly stories: readonly SprintStoryViewModel[];
}

export interface StoryDetailsTaskViewModel {
  readonly id: string;
  readonly title: string;
  readonly isDone: boolean;
}

export interface StoryDetailsViewModel {
  readonly id: string;
  readonly title: string;
  readonly featureName: string;
  readonly featureTheme: string;
  readonly featureMission: string;
  readonly statusLabel: string;
  readonly statusDescription: string;
  readonly statusColor: string;
  readonly statusIcon: string;
  readonly priorityLabel: string;
  readonly priorityColor: string;
  readonly assignee: string;
  readonly avatarInitials: string;
  readonly estimateLabel: string;
  readonly xp: number;
  readonly labels: readonly string[];
  readonly dueLabel?: string;
  readonly sprintLabel?: string;
  readonly tasks: readonly StoryDetailsTaskViewModel[];
  readonly completedTasks: number;
  readonly totalTasks: number;
  readonly checklistProgressLabel: string;
  readonly completionPercent: number;
}
