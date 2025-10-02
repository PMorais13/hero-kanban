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

  it('should change the theme when a valid option is selected', () => {
    state.setTheme('aurora-crest');

    expect(state.currentTheme()).toBe('aurora-crest');
    expect(documentRef.documentElement.dataset['theme']).toBe('aurora-crest');
  });

  it('should ignore unknown theme identifiers', () => {
    state.setTheme('aurora-crest');
    state.setTheme('unknown-theme' as never);

    expect(state.currentTheme()).toBe('aurora-crest');
  });
});
