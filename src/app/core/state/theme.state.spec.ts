import { DOCUMENT } from '@angular/common';
import { TestBed } from '@angular/core/testing';

import { OverlayContainer } from '@angular/cdk/overlay';

import { DEFAULT_THEME_ID, ThemeState } from './theme.state';

describe('ThemeState', () => {
  let state: ThemeState;
  let documentRef: Document;
  let overlayContainerElement: HTMLElement;

  beforeEach(() => {
    overlayContainerElement = document.createElement('div');

    TestBed.configureTestingModule({
      providers: [
        {
          provide: OverlayContainer,
          useValue: {
            getContainerElement: () => overlayContainerElement,
            ngOnDestroy: () => {},
          } as OverlayContainer,
        },
      ],
    });
    documentRef = TestBed.inject(DOCUMENT);
    documentRef.documentElement.dataset['theme'] = '';
    documentRef.body.dataset['theme'] = '';
    overlayContainerElement.dataset['theme'] = '';
    state = TestBed.inject(ThemeState);
  });

  afterEach(() => {
    documentRef.documentElement.dataset['theme'] = '';
    documentRef.body.dataset['theme'] = '';
    overlayContainerElement.dataset['theme'] = '';
  });

  it('should expose the default theme and apply it to the document', () => {
    expect(state.currentTheme()).toBe(DEFAULT_THEME_ID);
    expect(documentRef.documentElement.dataset['theme']).toBe(DEFAULT_THEME_ID);
    expect(documentRef.body.dataset['theme']).toBe(DEFAULT_THEME_ID);
    expect(overlayContainerElement.dataset['theme']).toBe(DEFAULT_THEME_ID);
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
    expect(documentRef.body.dataset['theme']).toBe('radiant-dawn');
    expect(overlayContainerElement.dataset['theme']).toBe('radiant-dawn');
  });

  it('should ignore unknown theme identifiers', () => {
    state.setTheme('aurora-crest');
    state.setTheme('unknown-theme' as never);

    expect(state.currentTheme()).toBe('aurora-crest');
  });
});
