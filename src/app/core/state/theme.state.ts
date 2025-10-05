import { DOCUMENT } from '@angular/common';
import { inject, Injectable, signal } from '@angular/core';
import { OverlayContainer } from '@angular/cdk/overlay';

import {
  DEFAULT_THEME_ID,
  STATIC_THEME_OPTIONS,
  type ThemeId,
  type ThemeOption,
  type ThemeProfileTokens,
} from './theme.config';

const PROFILE_TOKEN_TO_CSS_VARIABLE: ReadonlyArray<readonly [keyof ThemeProfileTokens, string]> = [
  ['textPrimary', '--hk-profile-text-primary'],
  ['textSecondary', '--hk-profile-text-secondary'],
  ['textMuted', '--hk-profile-text-muted'],
  ['border', '--hk-profile-border'],
  ['borderStrong', '--hk-profile-border-strong'],
  ['surface', '--hk-profile-surface'],
  ['surfaceSoft', '--hk-profile-surface-soft'],
  ['surfaceSubtle', '--hk-profile-surface-subtle'],
  ['progressTrack', '--hk-profile-progress-track'],
  ['shadow', '--hk-profile-shadow'],
];

@Injectable({ providedIn: 'root' })
export class ThemeState {
  private readonly documentRef = inject(DOCUMENT);
  private readonly overlayContainer = inject(OverlayContainer, { optional: true });

  private readonly _themes = signal<readonly ThemeOption[]>(STATIC_THEME_OPTIONS);

  private readonly _currentTheme = signal<ThemeId>(DEFAULT_THEME_ID);

  readonly themes = this._themes.asReadonly();
  readonly currentTheme = this._currentTheme.asReadonly();

  constructor() {
    this.applyTheme(this._currentTheme());
  }

  setAvailableThemes(themes: readonly ThemeOption[]): void {
    if (themes.length === 0) {
      return;
    }

    const normalizedThemes = Object.freeze(
      themes.map((theme) => Object.freeze({ ...theme })),
    ) as readonly ThemeOption[];

    this._themes.set(normalizedThemes);

    const currentThemeId = this._currentTheme();
    const hasCurrentTheme = normalizedThemes.some((theme) => theme.id === currentThemeId);

    if (!hasCurrentTheme) {
      const [firstTheme] = normalizedThemes;

      if (firstTheme) {
        this._currentTheme.set(firstTheme.id as ThemeId);
        this.applyTheme(firstTheme.id as ThemeId);
      }

      return;
    }

    this.applyTheme(currentThemeId);
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
    const documentRef = this.documentRef;

    if (!documentRef) {
      return;
    }

    const rootElement = documentRef.documentElement;
    const bodyElement = documentRef.body;
    const overlayElement = this.overlayContainer?.getContainerElement();
    const theme = this._themes().find((option) => option.id === themeId);
    const profileTokens = theme?.profile;
    const previewFontFamily = theme?.previewFontFamily;

    if (rootElement) {
      rootElement.dataset['theme'] = themeId;
      this.applyProfileTokens(rootElement, profileTokens);
      this.applyFontFamily(rootElement, previewFontFamily);
    }

    if (bodyElement) {
      bodyElement.dataset['theme'] = themeId;
      this.applyFontFamily(bodyElement, previewFontFamily);
    }

    if (overlayElement) {
      overlayElement.dataset['theme'] = themeId;
      this.applyFontFamily(overlayElement, previewFontFamily);
    }
  }

  private applyProfileTokens(
    target: HTMLElement,
    profileTokens: ThemeProfileTokens | undefined,
  ): void {
    for (const [tokenKey, cssVariable] of PROFILE_TOKEN_TO_CSS_VARIABLE) {
      const value = profileTokens?.[tokenKey];

      if (value) {
        target.style.setProperty(cssVariable, value);
      } else {
        target.style.removeProperty(cssVariable);
      }
    }
  }

  private applyFontFamily(
    target: HTMLElement,
    fontFamily: string | undefined,
  ): void {
    if (!fontFamily) {
      target.style.removeProperty('--hk-font-family');
      target.style.removeProperty('--hk-heading-font-family');
      return;
    }

    target.style.setProperty('--hk-font-family', fontFamily);
    target.style.setProperty('--hk-heading-font-family', fontFamily);
  }
}

export { DEFAULT_THEME_ID } from './theme.config';
export type { ThemeId, ThemeOption, ThemeTone, ThemeProfileTokens } from './theme.config';
