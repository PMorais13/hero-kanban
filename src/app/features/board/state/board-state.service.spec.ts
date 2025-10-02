import { TestBed } from '@angular/core/testing';
import { BoardState } from './board-state.service';
import type { CreateStoryPayload } from './board.models';

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
});
