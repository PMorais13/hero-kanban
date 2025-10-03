import { DOCUMENT } from '@angular/common';
import { inject, Injectable, signal } from '@angular/core';

export type ThemeId = 'stellar-night' | 'aurora-crest';

export interface ThemeOption {
  readonly id: ThemeId;
  readonly label: string;
  readonly description: string;
  readonly accent: string;
  readonly softAccent: string;
  readonly previewGradient: string;
  readonly tone: 'dark' | 'light';
  readonly previewFontFamily: string;
}

@Injectable({ providedIn: 'root' })
export class ThemeState {
  private readonly documentRef = inject(DOCUMENT);

  private readonly _themes = signal<readonly ThemeOption[]>([
    {
      id: 'stellar-night',
      label: 'Noite Estelar',
      description: 'Tema original com tons profundos e acento violeta.',
      accent: '#7c5cff',
      softAccent: 'rgba(124, 92, 255, 0.28)',
      previewGradient: 'linear-gradient(135deg, #1b1933 0%, #433978 100%)',
      tone: 'dark',
      previewFontFamily: "'Chakra Petch', 'Inter', 'Segoe UI', sans-serif",
    },
    {
      id: 'aurora-crest',
      label: 'Aurora Boreal',
      description: 'Mistura esmeralda e azul para uma interface energizante.',
      accent: '#1dd3b0',
      softAccent: 'rgba(29, 211, 176, 0.25)',
      previewGradient: 'linear-gradient(135deg, #012a4a 0%, #036666 100%)',
      tone: 'dark',
      previewFontFamily: "'Space Grotesk', 'Rubik', 'Segoe UI', sans-serif",
    },
  ]);

  private readonly _currentTheme = signal<ThemeId>('stellar-night');

  readonly themes = this._themes.asReadonly();
  readonly currentTheme = this._currentTheme.asReadonly();

  constructor() {
    this.applyTheme(this._currentTheme());
  }

  setTheme(themeId: ThemeId): void {
    if (this._currentTheme() === themeId) {
      return;
    }

    const isKnownTheme = this._themes().some((theme) => theme.id === themeId);

    if (!isKnownTheme) {
      return;
    }

    this._currentTheme.set(themeId);
    this.applyTheme(themeId);
  }

  private applyTheme(themeId: ThemeId): void {
    const rootElement = this.documentRef?.documentElement;

    if (!rootElement) {
      return;
    }

    rootElement.dataset['theme'] = themeId;
  }
}
