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
      this.applyAccentTokens(rootElement, theme);
      this.applyProfileTokens(rootElement, profileTokens);
      this.applyFontFamily(rootElement, previewFontFamily);
    }

    if (bodyElement) {
      bodyElement.dataset['theme'] = themeId;
      this.applyAccentTokens(bodyElement, theme);
      this.applyFontFamily(bodyElement, previewFontFamily);
    }

    if (overlayElement) {
      overlayElement.dataset['theme'] = themeId;
      this.applyAccentTokens(overlayElement, theme);
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

  private applyAccentTokens(target: HTMLElement, theme: ThemeOption | undefined): void {
    if (!target) {
      return;
    }

    if (!theme) {
      this.clearAccentTokens(target);
      return;
    }

    const accent = theme.accent?.trim();
    const softAccent = theme.softAccent?.trim();
    const previewGradient = theme.previewGradient?.trim();

    this.setCssVariable(target, '--hk-accent', accent);
    this.setCssVariable(target, '--hk-accent-soft', softAccent);
    this.setCssVariable(target, '--hk-accent-gradient', previewGradient);
    this.setCssVariable(target, '--hk-accent-gradient-progress', previewGradient);

    if (accent) {
      const accentRgb = this.toRgbValue(accent);

      if (accentRgb) {
        target.style.setProperty('--hk-accent-rgb', accentRgb);
        target.style.setProperty('--hk-accent-strong', accent);
        target.style.setProperty('--hk-accent-strong-rgb', accentRgb);
      } else {
        target.style.removeProperty('--hk-accent-rgb');
        target.style.removeProperty('--hk-accent-strong');
        target.style.removeProperty('--hk-accent-strong-rgb');
      }
    } else {
      target.style.removeProperty('--hk-accent-rgb');
      target.style.removeProperty('--hk-accent-strong');
      target.style.removeProperty('--hk-accent-strong-rgb');
    }
  }

  private clearAccentTokens(target: HTMLElement): void {
    target.style.removeProperty('--hk-accent');
    target.style.removeProperty('--hk-accent-soft');
    target.style.removeProperty('--hk-accent-rgb');
    target.style.removeProperty('--hk-accent-strong');
    target.style.removeProperty('--hk-accent-strong-rgb');
    target.style.removeProperty('--hk-accent-gradient');
    target.style.removeProperty('--hk-accent-gradient-progress');
  }

  private setCssVariable(target: HTMLElement, variableName: string, value: string | undefined): void {
    if (!value) {
      target.style.removeProperty(variableName);
      return;
    }

    const normalizedValue = value.trim();

    if (normalizedValue.length === 0) {
      target.style.removeProperty(variableName);
      return;
    }

    target.style.setProperty(variableName, normalizedValue);
  }

  private toRgbValue(color: string): string | null {
    const hexMatch = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(color.trim());

    if (!hexMatch) {
      return null;
    }

    const hex = hexMatch[1];

    const normalizedHex = hex.length === 3 ? hex.split('').map((char) => char + char).join('') : hex;

    const red = parseInt(normalizedHex.substring(0, 2), 16);
    const green = parseInt(normalizedHex.substring(2, 4), 16);
    const blue = parseInt(normalizedHex.substring(4, 6), 16);

    if (Number.isNaN(red) || Number.isNaN(green) || Number.isNaN(blue)) {
      return null;
    }

    return `${red}, ${green}, ${blue}`;
  }
}

export { DEFAULT_THEME_ID } from './theme.config';
export type { ThemeId, ThemeOption, ThemeTone, ThemeProfileTokens } from './theme.config';
