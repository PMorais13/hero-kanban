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
  it('should calculate experience progress in percentage', () => {
    const progress = state.experienceProgress();

    expect(progress).toBeGreaterThanOrEqual(0);
    expect(progress).toBeLessThanOrEqual(100);
  });
});
