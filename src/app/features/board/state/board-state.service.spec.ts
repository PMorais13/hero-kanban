import { TestBed } from '@angular/core/testing';
import { BoardState } from './board-state.service';

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
});
