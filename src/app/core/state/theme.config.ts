export type ThemeTone = 'dark' | 'light';

export interface ThemeProfileTokens {
  readonly textPrimary: string;
  readonly textSecondary: string;
  readonly textMuted: string;
  readonly border: string;
  readonly borderStrong: string;
  readonly surface: string;
  readonly surfaceSoft: string;
  readonly surfaceSubtle: string;
  readonly progressTrack: string;
  readonly shadow: string;
}

export interface ThemeOption {
  readonly id: string;
  readonly label: string;
  readonly description: string;
  readonly accent: string;
  readonly softAccent: string;
  readonly previewGradient: string;
  readonly tone: ThemeTone;
  readonly previewFontFamily: string;
  readonly profile?: ThemeProfileTokens;
  readonly stylesheet?: string;
  readonly isDefault?: boolean;
}

export type ThemeId = ThemeOption['id'];

export const DEFAULT_THEME_ID: ThemeId = 'stellar-night';
