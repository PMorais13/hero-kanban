import { TestBed } from '@angular/core/testing';
import { BoardConfigState } from './board-config.state';

describe('BoardConfigState', () => {
  let state: BoardConfigState;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    state = TestBed.inject(BoardConfigState);
  });

  it('should expose status options derived from board statuses', () => {
    const options = state.statusOptions();

    expect(options.length).toBe(state.statuses().length);
    expect(options.every((option) => typeof option.label === 'string')).toBeTrue();
  });

  it('should add a custom status and propagate transitions', () => {
    state.updateNewStatusName('Validação final');
    const initialLength = state.statuses().length;

    state.addCustomStatus();

    const statuses = state.statuses();
    const newlyCreated = statuses.at(-1);
    expect(statuses.length).toBe(initialLength + 1);
    expect(newlyCreated?.name).toBe('Validação final');
    expect(newlyCreated?.isActive).toBeTrue();

    const newId = newlyCreated?.id;
    const backlog = statuses.find((item) => item.id === 'backlog');
    if (newId) {
      expect(backlog?.allowedTransitions).toContain(newId);
    }
  });

  it('should avoid duplicating an existing status name', () => {
    const initialLength = state.statuses().length;

    state.updateNewStatusName('Backlog Estratégico');
    state.addCustomStatus();

    expect(state.statuses().length).toBe(initialLength);
  });

  it('should toggle a status active flag', () => {
    const target = state.statuses()[0];

    state.toggleStatus(target.id, !target.isActive);

    expect(state.statuses()[0].isActive).toBe(!target.isActive);
  });
});
