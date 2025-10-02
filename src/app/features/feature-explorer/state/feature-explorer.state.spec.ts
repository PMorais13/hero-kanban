import { TestBed } from '@angular/core/testing';
import { FeatureExplorerState } from './feature-explorer.state';

describe('FeatureExplorerState', () => {
  let state: FeatureExplorerState;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    state = TestBed.inject(FeatureExplorerState);
  });

  it('should expose feature cards aggregated with story count', () => {
    const cards = state.featureCards();
    expect(cards.length).toBeGreaterThan(0);

    const progressGraph = cards.find((card) => card.id === 'feat-progress-graph');
    expect(progressGraph).toBeDefined();
    expect(progressGraph?.storyCount).toBeGreaterThan(0);
    expect(progressGraph?.xpRewardLabel).toBe('250 XP');
  });

  it('should resolve detail view models with story metadata', () => {
    const detail = state.getFeatureDetail('feat-progress-graph');
    expect(detail).toBeDefined();
    expect(detail?.stories.length).toBeGreaterThan(0);

    const story = detail?.stories.find((item) => item.id === 'story-flow-analytics');
    expect(story).toBeDefined();
    expect(story?.priorityLabel).toBe('Crítico');
    expect(story?.xpLabel).toBe('85 XP');
    expect(story?.checklistProgressLabel).toContain('/');
    expect(story?.statusLabel.length).toBeGreaterThan(0);
    expect(story?.dueLabel).toBeDefined();
  });

  it('should return undefined for unknown features', () => {
    expect(state.getFeatureDetail('unknown-feature')).toBeUndefined();
  });
});
