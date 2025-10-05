import { DOCUMENT } from '@angular/common';
import { inject, Injectable, signal, effect } from '@angular/core';
import { OverlayContainer } from '@angular/cdk/overlay';

import {
  DEFAULT_THEME_ID,
  type ThemeId,
  type ThemeOption,
  type ThemeProfileTokens,
} from './theme.config';
import { ThemeService } from '../services/theme.service';
import { take } from 'rxjs/operators';

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
  private readonly themeService = inject(ThemeService);

  private readonly _themes = signal<readonly ThemeOption[]>([]);

  private readonly _currentTheme = signal<ThemeId>(DEFAULT_THEME_ID);

  private themeStylesheetElement: HTMLStyleElement | null = null;

  readonly themes = this._themes.asReadonly();
  readonly currentTheme = this._currentTheme.asReadonly();

  private readonly hydrateThemesEffect = effect(
    () => {
      const subscription = this.themeService
        .getThemes()
        .pipe(take(1))
        .subscribe({
          next: (themes) => {
            if (themes.length > 0) {
              this.setAvailableThemes(themes);
            }
          },
          error: () => {
            // Keep the current theme when the backend is unavailable.
          },
        });

      return () => subscription.unsubscribe();
    },
    { allowSignalWrites: true },
  );

  constructor() {
    this.applyTheme(this._currentTheme());
  }

  setAvailableThemes(themes: readonly ThemeOption[]): void {
    if (themes.length === 0) {
      return;
    }

    const sortedThemes = [...themes].sort((first, second) => {
      const firstIsDefault = first.isDefault === true || first.id === DEFAULT_THEME_ID;
      const secondIsDefault = second.isDefault === true || second.id === DEFAULT_THEME_ID;

      if (firstIsDefault && !secondIsDefault) {
        return -1;
      }

      if (secondIsDefault && !firstIsDefault) {
        return 1;
      }

      return first.label.localeCompare(second.label, 'pt-BR', { sensitivity: 'base' });
    });

    const normalizedThemes = Object.freeze(
      sortedThemes.map((theme) => Object.freeze({ ...theme })),
    ) as readonly ThemeOption[];

    this._themes.set(normalizedThemes);

    const currentThemeId = this._currentTheme();
    const hasCurrentTheme = normalizedThemes.some((theme) => theme.id === currentThemeId);

    if (hasCurrentTheme) {
      this.applyTheme(currentThemeId);
      return;
    }

    const fallbackTheme =
      normalizedThemes.find((theme) => theme.isDefault === true) ??
      normalizedThemes.find((theme) => theme.id === DEFAULT_THEME_ID) ??
      normalizedThemes[0];

    if (fallbackTheme) {
      const fallbackThemeId = fallbackTheme.id as ThemeId;
      this._currentTheme.set(fallbackThemeId);
      this.applyTheme(fallbackThemeId);
    }
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
    const stylesheet = theme?.stylesheet;

    this.applyStylesheet(stylesheet);

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

  private applyStylesheet(stylesheet: string | undefined): void {
    const documentRef = this.documentRef;

    if (!documentRef) {
      return;
    }

    if (!stylesheet) {
      if (this.themeStylesheetElement) {
        this.themeStylesheetElement.remove();
        this.themeStylesheetElement = null;
      }

      return;
    }

    let styleElement = this.themeStylesheetElement;

    if (!styleElement || !documentRef.head.contains(styleElement)) {
      styleElement = documentRef.createElement('style');
      styleElement.setAttribute('data-theme-stylesheet', 'dynamic');
      documentRef.head.appendChild(styleElement);
      this.themeStylesheetElement = styleElement;
    }

    styleElement.textContent = stylesheet;
  }
}

export { DEFAULT_THEME_ID } from './theme.config';
export type { ThemeId, ThemeOption, ThemeTone, ThemeProfileTokens } from './theme.config';
