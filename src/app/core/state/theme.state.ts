import { DOCUMENT } from '@angular/common';
import { inject, Injectable, signal } from '@angular/core';
import { OverlayContainer } from '@angular/cdk/overlay';

import {
  DEFAULT_THEME_ID,
  STATIC_THEME_OPTIONS,
  type ThemeId,
  type ThemeOption,
} from './theme.config';

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

    if (rootElement) {
      rootElement.dataset['theme'] = themeId;
    }

    if (bodyElement) {
      bodyElement.dataset['theme'] = themeId;
    }

    if (overlayElement) {
      overlayElement.dataset['theme'] = themeId;
    }
  }
}

export { DEFAULT_THEME_ID } from './theme.config';
export type { ThemeId, ThemeOption, ThemeTone } from './theme.config';
