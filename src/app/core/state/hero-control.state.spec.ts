import { TestBed } from '@angular/core/testing';
import { HeroControlState } from './hero-control.state';

describe('HeroControlState', () => {
  let state: HeroControlState;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    state = TestBed.inject(HeroControlState);
  });

  it('should expose readonly slices of hero information', () => {
    expect(state.experience().level).toBeGreaterThan(0);
    expect(state.achievements().length).toBeGreaterThan(0);
    expect(state.loot().length).toBeGreaterThan(0);
  });

  it('should add a custom status when the name is unique', () => {
    state.updateNewStatusName('Exploração');
    const initialLength = state.boardStatuses().length;

    state.addCustomStatus();

    const statuses = state.boardStatuses();
    expect(statuses.length).toBe(initialLength + 1);
    expect(statuses.some((item) => item.label === 'Exploração')).toBeTrue();
  });

  it('should avoid duplicating a status with the same label', () => {
    const initialLength = state.boardStatuses().length;

    state.updateNewStatusName('Backlog');
    state.addCustomStatus();

    expect(state.boardStatuses().length).toBe(initialLength);
  });

  it('should toggle a status active flag', () => {
    const target = state.boardStatuses()[0];

    state.toggleStatus(target.id, !target.isActive);

    expect(state.boardStatuses()[0].isActive).toBe(!target.isActive);
  });
});
