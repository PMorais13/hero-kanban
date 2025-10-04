import { DOCUMENT } from '@angular/common';
import { TestBed } from '@angular/core/testing';

import { ThemeState } from './theme.state';

describe('ThemeState', () => {
  let state: ThemeState;
  let documentRef: Document;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    documentRef = TestBed.inject(DOCUMENT);
    documentRef.documentElement.dataset['theme'] = '';
    state = TestBed.inject(ThemeState);
  });

  afterEach(() => {
    documentRef.documentElement.dataset['theme'] = '';
  });

  it('should expose the default theme and apply it to the document', () => {
    expect(state.currentTheme()).toBe('stellar-night');
    expect(documentRef.documentElement.dataset['theme']).toBe('stellar-night');
  });

  it('should expose the available themes with their tone metadata', () => {
    const themes = state.themes();

    expect(themes.length).toBeGreaterThanOrEqual(5);
    expect(themes.some((theme) => theme.id === 'radiant-dawn' && theme.tone === 'light')).toBeTrue();
  });

  it('should change the theme when a valid option is selected', () => {
    state.setTheme('radiant-dawn');

    expect(state.currentTheme()).toBe('radiant-dawn');
    expect(documentRef.documentElement.dataset['theme']).toBe('radiant-dawn');
  });

  it('should ignore unknown theme identifiers', () => {
    state.setTheme('aurora-crest');
    state.setTheme('unknown-theme' as never);

    expect(state.currentTheme()).toBe('aurora-crest');
  });
});
