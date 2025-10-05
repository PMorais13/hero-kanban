import { DOCUMENT } from '@angular/common';
import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

import { OverlayContainer } from '@angular/cdk/overlay';

import { DEFAULT_THEME_ID, ThemeState } from './theme.state';
import { THEME_MANIFEST_URLS, type ThemeManifest } from './theme.config';

describe('ThemeState', () => {
  let state: ThemeState;
  let documentRef: Document;
  let overlayContainerElement: HTMLElement;
  let httpMock: HttpTestingController;

  const manifestFixtures = new Map<string, ThemeManifest>(
    Object.entries(
      import.meta.glob<ThemeManifest>('./themes/*.json', { eager: true, import: 'default' }),
    ).map(([resourcePath, manifest]) => [
      `/themes/${resourcePath.replace('./themes/', '')}`,
      manifest,
    ]),
  );

  const flushThemeManifestRequests = () => {
    for (const url of THEME_MANIFEST_URLS) {
      const request = httpMock.expectOne(url);
      const manifest = manifestFixtures.get(url);

      if (!manifest) {
        throw new Error(`No manifest fixture registered for URL ${url}.`);
      }

      request.flush(manifest);
    }
  };

  beforeEach(() => {
    overlayContainerElement = document.createElement('div');

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
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
    httpMock = TestBed.inject(HttpTestingController);
    documentRef.documentElement.dataset['theme'] = '';
    documentRef.body.dataset['theme'] = '';
    overlayContainerElement.dataset['theme'] = '';
    state = TestBed.inject(ThemeState);
    flushThemeManifestRequests();
  });

  afterEach(() => {
    documentRef.documentElement.dataset['theme'] = '';
    documentRef.body.dataset['theme'] = '';
    overlayContainerElement.dataset['theme'] = '';
    httpMock.verify();
  });

  it('should expose the default theme and apply it to the document', () => {
    expect(state.currentTheme()).toBe(DEFAULT_THEME_ID);
    expect(documentRef.documentElement.dataset['theme']).toBe(DEFAULT_THEME_ID);
    expect(documentRef.body.dataset['theme']).toBe(DEFAULT_THEME_ID);
    expect(overlayContainerElement.dataset['theme']).toBe(DEFAULT_THEME_ID);
  });

  it('should expose the available themes with their tone metadata', () => {
    const themes = state.themes();

    expect(themes.length).toBeGreaterThanOrEqual(6);
    expect(themes.some((theme) => theme.id === 'radiant-dawn' && theme.tone === 'light')).toBeTrue();
    expect(themes.some((theme) => theme.id === 'celestial-tides' && theme.tone === 'light')).toBeTrue();
  });

  it('should change the theme when a valid option is selected', () => {
    state.setTheme('radiant-dawn');

    expect(state.currentTheme()).toBe('radiant-dawn');
    expect(documentRef.documentElement.dataset['theme']).toBe('radiant-dawn');
    expect(documentRef.body.dataset['theme']).toBe('radiant-dawn');
    expect(overlayContainerElement.dataset['theme']).toBe('radiant-dawn');
  });

  it('should apply the Celestial Tides theme tokens when selected', () => {
    state.setTheme('celestial-tides');

    expect(state.currentTheme()).toBe('celestial-tides');
    expect(documentRef.documentElement.dataset['theme']).toBe('celestial-tides');
    expect(documentRef.body.dataset['theme']).toBe('celestial-tides');
    expect(overlayContainerElement.dataset['theme']).toBe('celestial-tides');
  });

  it('should ignore unknown theme identifiers', () => {
    state.setTheme('aurora-crest');
    state.setTheme('unknown-theme' as never);

    expect(state.currentTheme()).toBe('aurora-crest');
  });
});
