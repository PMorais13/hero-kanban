export type ThemeTone = 'dark' | 'light';

export interface ThemeOption {
  readonly id: string;
  readonly label: string;
  readonly description: string;
  readonly accent: string;
  readonly softAccent: string;
  readonly previewGradient: string;
  readonly tone: ThemeTone;
  readonly previewFontFamily: string;
}

import stellarNightManifest from './themes/stellar-night.json';
import auroraCrestManifest from './themes/aurora-crest.json';
import radiantDawnManifest from './themes/radiant-dawn.json';
import emberForgeManifest from './themes/ember-forge.json';
import quantumMistManifest from './themes/quantum-mist.json';

type ThemeManifest = Omit<ThemeOption, 'tone'> & { readonly tone: string };

const isThemeTone = (value: string): value is ThemeTone => value === 'dark' || value === 'light';

const manifestToThemeOption = (manifest: ThemeManifest): ThemeOption => {
  if (!isThemeTone(manifest.tone)) {
    throw new Error(`Invalid tone "${manifest.tone}" provided by theme manifest "${manifest.id}".`);
  }

  return {
    ...manifest,
    tone: manifest.tone,
  } as ThemeOption;
};

const themeOptions = [
  manifestToThemeOption(stellarNightManifest as ThemeManifest),
  manifestToThemeOption(auroraCrestManifest as ThemeManifest),
  manifestToThemeOption(radiantDawnManifest as ThemeManifest),
  manifestToThemeOption(emberForgeManifest as ThemeManifest),
  manifestToThemeOption(quantumMistManifest as ThemeManifest),
] as const satisfies readonly ThemeOption[];

export type ThemeId = (typeof themeOptions)[number]['id'];

export interface ThemeConfiguration<TOptions extends readonly ThemeOption[] = readonly ThemeOption[]> {
  readonly defaultThemeId: TOptions[number]['id'];
  readonly options: TOptions;
}

const staticThemeConfiguration = {
  defaultThemeId: themeOptions[0].id,
  options: themeOptions,
} satisfies ThemeConfiguration<typeof themeOptions>;

export const STATIC_THEME_CONFIGURATION = staticThemeConfiguration;
export const DEFAULT_THEME_ID: ThemeId = staticThemeConfiguration.defaultThemeId;
export const STATIC_THEME_OPTIONS: readonly ThemeOption[] = staticThemeConfiguration.options;
