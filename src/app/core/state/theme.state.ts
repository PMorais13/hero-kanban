import { DOCUMENT } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { OverlayContainer } from '@angular/cdk/overlay';
import { forkJoin } from 'rxjs';

import {
  DEFAULT_THEME_ID,
  THEME_MANIFEST_URLS,
  createThemeConfiguration,
  type ThemeId,
  type ThemeManifest,
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
  private readonly httpClient = inject(HttpClient);

  private readonly _themes = signal<readonly ThemeOption[]>([]);

  private readonly _currentTheme = signal<ThemeId>(DEFAULT_THEME_ID);

  readonly themes = this._themes.asReadonly();
  readonly currentTheme = this._currentTheme.asReadonly();

  constructor() {
    this.applyTheme(this._currentTheme());
    this.loadThemes();
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

  private loadThemes(): void {
    const manifestRequests = THEME_MANIFEST_URLS.map((url) =>
      this.httpClient.get<ThemeManifest>(url),
    );

    if (manifestRequests.length === 0) {
      throw new Error('No theme manifest URLs were found. Provide at least one theme manifest.');
    }

    forkJoin(manifestRequests).subscribe({
      next: (manifests) => {
        const configuration = createThemeConfiguration(manifests);
        this._themes.set(configuration.options);
        const defaultThemeId = configuration.defaultThemeId;
        this._currentTheme.set(defaultThemeId);
        this.applyTheme(defaultThemeId);
      },
      error: (error) => {
        throw error instanceof Error
          ? error
          : new Error('Failed to load theme manifests via HTTP.');
      },
    });
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

    if (rootElement) {
      rootElement.dataset['theme'] = themeId;
      this.applyProfileTokens(rootElement, profileTokens);
    }

    if (bodyElement) {
      bodyElement.dataset['theme'] = themeId;
    }

    if (overlayElement) {
      overlayElement.dataset['theme'] = themeId;
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
}

export { DEFAULT_THEME_ID } from './theme.config';
export type { ThemeId, ThemeOption, ThemeTone, ThemeProfileTokens } from './theme.config';
