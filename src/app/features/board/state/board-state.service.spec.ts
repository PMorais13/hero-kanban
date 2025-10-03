import { TestBed } from '@angular/core/testing';
import { BoardState } from './board-state.service';
import type { CreateSprintPayload, CreateStoryPayload } from './board.models';

describe('BoardState', () => {
  let service: BoardState;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(BoardState);
  });

  it('should expose columns sorted by workflow order', () => {
    const columns = service.columns();
    expect(columns.length).toBeGreaterThan(0);
    const orders = columns.map((column) => column.status.order);
    expect([...orders].sort((a, b) => a - b)).toEqual(orders);
  });

  it('should block transitions that are not part of the workflow', () => {
    const moved = service.moveStory('story-team-buffs', 'done');
    expect(moved).toBeFalse();
  });

  it('should respect WIP limits before moving stories', () => {
    const firstMove = service.moveStory('story-mission-engine', 'release');
    expect(firstMove).toBeTrue();

    const blockedMove = service.moveStory('story-onboarding', 'release');
    expect(blockedMove).toBeFalse();
  });

  it('should expose canMoveStory with the same rules applied on move', () => {
    expect(service.canMoveStory('story-team-buffs', 'ready')).toBeTrue();
    expect(service.canMoveStory('story-team-buffs', 'done')).toBeFalse();

    service.moveStory('story-mission-engine', 'release');
    expect(service.canMoveStory('story-onboarding', 'release')).toBeFalse();
  });

  it('should create stories with checklist progress derived from tasks', () => {
    const draft: CreateStoryPayload = {
      title: 'Central de alinhamento da guilda',
      featureId: 'feat-progress-graph',
      statusId: 'backlog',
      priority: 'high',
      estimate: 5,
      assignee: 'Bianca Torres',
      labels: ['Discovery', 'Facilitação'],
      xp: 55,
      tasks: [
        { title: 'Planejar workshop de ritos', isDone: true },
        { title: 'Consolidar insights da guilda', isDone: false },
      ],
    };

    const created = service.createStory(draft);
    expect(created).not.toBeNull();

    const backlogColumn = service.columns().find((column) => column.status.id === 'backlog');
    expect(backlogColumn).toBeDefined();

    const createdCard = backlogColumn?.cards.find((card) => card.id === created?.id);
    expect(createdCard).toBeDefined();
    expect(createdCard?.checklistProgressLabel).toBe('1/2 checklist');
  });

  it('should block story creation when WIP limit is reached', () => {
    const baseDraft: CreateStoryPayload = {
      title: 'Deploy sincronizado com comunidade',
      featureId: 'feat-guild-rewards',
      statusId: 'release',
      priority: 'medium',
      estimate: 3,
      assignee: 'Jonas Prado',
      labels: [],
      xp: 30,
      tasks: [],
    };

    const allowed = service.createStory(baseDraft);
    expect(allowed).not.toBeNull();

    const blocked = service.createStory({
      ...baseDraft,
      title: 'Overload de deploy cooperativo',
      assignee: 'Letícia Duarte',
    });
    expect(blocked).toBeNull();
  });

  it('should filter visible cards by selected sprint', () => {
    const allColumns = service.columns();
    const allVisibleIds = allColumns.flatMap((column) => column.cards.map((card) => card.id));
    expect(allVisibleIds).toContain('story-flow-analytics');
    expect(allVisibleIds).toContain('story-mission-engine');

    service.setSprintFilter('sprint-aether');
    const filteredIds = service
      .columns()
      .flatMap((column) => column.cards.map((card) => card.id));

    expect(filteredIds).toContain('story-mission-engine');
    expect(filteredIds).toContain('story-team-buffs');
    expect(filteredIds).not.toContain('story-flow-analytics');
  });

  it('should summarise sprints with their stories and totals', () => {
    const overviews = service.sprintOverviews();
    const nebula = overviews.find((item) => item.sprint.id === 'sprint-nebula');
    expect(nebula).toBeDefined();
    expect(nebula?.plannedStories).toBeGreaterThan(0);
    expect(nebula?.stories.some((story) => story.id === 'story-flow-analytics')).toBeTrue();
    expect(nebula?.totalPoints).toBeGreaterThan(0);
  });

  it('should reset sprint filter when an unknown sprint is provided', () => {
    service.setSprintFilter('sprint-aether');
    expect(service.selectedSprintId()).toBe('sprint-aether');

    service.setSprintFilter('unknown-sprint');
    expect(service.selectedSprintId()).toBe('all-sprints');
  });

  it('should create a new sprint when the payload is valid', () => {
    const payload: CreateSprintPayload = {
      name: 'Sprint Aurora',
      goal: 'Lançar o painel cooperativo de conquistas.',
      focus: 'Integrações e alinhamento com comunidades',
      startDateIso: '2024-07-01',
      endDateIso: '2024-07-12',
    };

    const created = service.createSprint(payload);
    expect(created).not.toBeNull();
    expect(service.sprints().some((sprint) => sprint.id === created?.id)).toBeTrue();
    expect(service.sprintOverviews().some((overview) => overview.sprint.id === created?.id)).toBeTrue();
  });

  it('should block sprint creation when the period is invalid', () => {
    const payload: CreateSprintPayload = {
      name: 'Sprint Eclipse',
      goal: 'Preparar o lançamento do hub de insights.',
      focus: 'Dados e confiabilidade',
      startDateIso: '2024-08-15',
      endDateIso: '2024-08-10',
    };

    const created = service.createSprint(payload);
    expect(created).toBeNull();
  });
});
