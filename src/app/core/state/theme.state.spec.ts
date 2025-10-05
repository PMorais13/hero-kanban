import { DOCUMENT } from '@angular/common';
import { TestBed } from '@angular/core/testing';

import { OverlayContainer } from '@angular/cdk/overlay';

import { of } from 'rxjs';

import { ThemeService } from '../services/theme.service';
import { DEFAULT_THEME_ID, ThemeState, type ThemeOption } from './theme.state';

class ThemeServiceStub {
  getThemes() {
    return of([]);
  }
}

const createThemeFixtures = (): ThemeOption[] => [
  {
    id: 'stellar-night',
    label: 'Noite Estelar',
    description: 'Tema padrão com acento violeta.',
    accent: '#7c5cff',
    softAccent: 'rgba(124, 92, 255, 0.28)',
    previewGradient: 'linear-gradient(135deg, #1b1933 0%, #433978 100%)',
    tone: 'dark',
    previewFontFamily: "'Chakra Petch', 'Inter', sans-serif",
    isDefault: true,
  },
  {
    id: 'radiant-dawn',
    label: 'Aurora Radiante',
    description: 'Tema claro com acentos solares.',
    accent: '#f97316',
    softAccent: 'rgba(249, 115, 22, 0.24)',
    previewGradient: 'linear-gradient(135deg, #fff7ed 0%, #fed7aa 100%)',
    tone: 'light',
    previewFontFamily: "'Inter', sans-serif",
  },
  {
    id: 'celestial-tides',
    label: 'Maré Celestial',
    description: 'Tema claro inspirado em tons aquáticos.',
    accent: '#14b8a6',
    softAccent: 'rgba(20, 184, 166, 0.18)',
    previewGradient: 'linear-gradient(135deg, #d1fae5 0%, #ecfeff 100%)',
    tone: 'light',
    previewFontFamily: "'Inter', 'Segoe UI', sans-serif",
  },
];

describe('ThemeState', () => {
  let state: ThemeState;
  let documentRef: Document;
  let overlayContainerElement: HTMLElement;

  beforeEach(() => {
    overlayContainerElement = document.createElement('div');

    TestBed.configureTestingModule({
      providers: [
        { provide: ThemeService, useClass: ThemeServiceStub },
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
    state.setAvailableThemes(createThemeFixtures());
    const themes = state.themes();

    expect(themes.length).toBe(3);
    expect(themes.some((theme) => theme.id === 'radiant-dawn' && theme.tone === 'light')).toBeTrue();
    expect(themes.some((theme) => theme.id === 'celestial-tides' && theme.tone === 'light')).toBeTrue();
  });

  it('should change the theme when a valid option is selected', () => {
    state.setAvailableThemes(createThemeFixtures());
    state.setTheme('radiant-dawn');

    expect(state.currentTheme()).toBe('radiant-dawn');
    expect(documentRef.documentElement.dataset['theme']).toBe('radiant-dawn');
    expect(documentRef.body.dataset['theme']).toBe('radiant-dawn');
    expect(overlayContainerElement.dataset['theme']).toBe('radiant-dawn');
  });

  it('should apply the Celestial Tides theme tokens when selected', () => {
    state.setAvailableThemes(createThemeFixtures());
    state.setTheme('celestial-tides');

    expect(state.currentTheme()).toBe('celestial-tides');
    expect(documentRef.documentElement.dataset['theme']).toBe('celestial-tides');
    expect(documentRef.body.dataset['theme']).toBe('celestial-tides');
    expect(overlayContainerElement.dataset['theme']).toBe('celestial-tides');
  });

  it('should ignore unknown theme identifiers', () => {
    state.setAvailableThemes(createThemeFixtures());
    state.setTheme('radiant-dawn');
    state.setTheme('unknown-theme' as never);

    expect(state.currentTheme()).toBe('radiant-dawn');
  });

  it('should adopt the backend default theme when the current selection is unavailable', () => {
    state.setAvailableThemes([
      {
        id: 'quantum-mist',
        label: 'Névoa Quântica',
        description: 'Tema experimental com tons ultravioleta.',
        accent: '#6366f1',
        softAccent: 'rgba(99, 102, 241, 0.25)',
        previewGradient: 'linear-gradient(135deg, #312e81 0%, #8b5cf6 100%)',
        tone: 'dark',
        previewFontFamily: "'Space Grotesk', 'Inter', sans-serif",
      },
    ]);
    state.setTheme('quantum-mist');

    state.setAvailableThemes([
      {
        id: 'ember-forge',
        label: 'Forja Incandescente',
        description: 'Tema quente com tons âmbar.',
        accent: '#f97316',
        softAccent: 'rgba(249, 115, 22, 0.24)',
        previewGradient: 'linear-gradient(135deg, #ffedd5 0%, #fb923c 100%)',
        tone: 'dark',
        previewFontFamily: "'Inter', sans-serif",
        isDefault: true,
      },
      ...createThemeFixtures(),
    ]);

    expect(state.currentTheme()).toBe('ember-forge');
  });
});
