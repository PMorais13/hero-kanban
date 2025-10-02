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
    expect(options.every((option) => typeof option.name === 'string')).toBeTrue();
    expect(options.every((option) => typeof option.icon === 'string')).toBeTrue();
    const orders = options.map((option) => option.order);
    expect([...orders].sort((a, b) => a - b)).toEqual(orders);
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

  it('should update the title and short label of a status', () => {
    const target = state.statuses()[0];

    state.updateStatusName(target.id, 'Nova Etapa Lendária');

    const updated = state.statuses()[0];
    expect(updated.name).toBe('Nova Etapa Lendária');
    expect(updated.shortLabel).toBe('Nova Etapa…');
  });

  it('should update the description of a status', () => {
    const target = state.statuses()[1];

    state.updateStatusDescription(target.id, '  Ajuste fino com toda a guilda reunida   ');

    expect(state.statuses()[1].description).toBe('Ajuste fino com toda a guilda reunida');
  });

  it('should update the icon of a status and fallback when empty', () => {
    const target = state.statuses()[2];

    state.updateStatusIcon(target.id, 'auto_awesome');
    expect(state.statuses()[2].icon).toBe('auto_awesome');

    state.updateStatusIcon(target.id, '  ');
    expect(state.statuses()[2].icon).toBe('flag');
  });

  it('should move statuses up and down updating their order', () => {
    const before = state.statusOptions().map((option) => option.id);
    const targetId = before[1];

    state.moveStatus(targetId, 'up');
    const afterUp = state.statusOptions().map((option) => option.id);
    expect(afterUp[0]).toBe(targetId);

    state.moveStatus(targetId, 'down');
    const afterDown = state.statusOptions().map((option) => option.id);
    expect(afterDown[1]).toBe(targetId);
  });
});
