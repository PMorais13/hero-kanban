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

  it('should reorder statuses when a new target index is provided', () => {
    const before = state.statusOptions().map((option) => option.id);
    const targetId = before[1];

    state.reorderStatus(targetId, 3);
    const after = state.statusOptions().map((option) => option.id);

    expect(after[3]).toBe(targetId);
  });

  it('should clamp invalid reorder indices to the available range', () => {
    const lastStatusId = state.statusOptions().at(-1)?.id;

    if (!lastStatusId) {
      fail('Expected at least one status option');
      return;
    }

    state.reorderStatus(lastStatusId, -10);
    expect(state.statusOptions()[0].id).toBe(lastStatusId);

    state.reorderStatus(lastStatusId, 999);
    const latest = state.statusOptions();
    expect(latest[latest.length - 1].id).toBe(lastStatusId);
  });
});
