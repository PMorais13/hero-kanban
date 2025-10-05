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
}

export interface ThemeManifest extends Omit<ThemeOption, 'tone' | 'profile'> {
  readonly tone: string;
  readonly isDefault?: boolean;
  readonly profile?: ThemeProfileTokens;
}

const manifestResourcePaths = Object.freeze(Object.keys(import.meta.glob('./themes/*.json')));

const themeManifestUrls = Object.freeze(
  manifestResourcePaths.map((resourcePath) => `/themes/${resourcePath.replace('./themes/', '')}`),
);

if (themeManifestUrls.length === 0) {
  throw new Error('No theme manifests were found. Provide at least one theme manifest.');
}

const isThemeTone = (value: string): value is ThemeTone => value === 'dark' || value === 'light';

const manifestToThemeOption = (manifest: ThemeManifest): ThemeOption => {
  const { tone, isDefault: _isDefault, profile, ...optionFields } = manifest;

  if (!isThemeTone(tone)) {
    throw new Error(`Invalid tone "${tone}" provided by theme manifest "${manifest.id}".`);
  }

  return {
    ...optionFields,
    tone,
    profile: profile ? Object.freeze({ ...profile }) : undefined,
  } satisfies ThemeOption;
};

const sortThemeManifests = (
  manifests: readonly ThemeManifest[],
  defaultManifest: ThemeManifest,
): readonly ThemeManifest[] =>
  manifests
    .slice()
    .sort((first, second) => {
      if (first.id === defaultManifest.id) {
        return -1;
      }

      if (second.id === defaultManifest.id) {
        return 1;
      }

      return first.label.localeCompare(second.label, 'pt-BR', { sensitivity: 'base' });
    });

export const THEME_MANIFEST_URLS = themeManifestUrls;

export type ThemeId = ThemeOption['id'];

export interface ThemeConfiguration<TOptions extends readonly ThemeOption[] = readonly ThemeOption[]> {
  readonly defaultThemeId: TOptions[number]['id'];
  readonly options: TOptions;
}

export const DEFAULT_THEME_ID: ThemeId = 'stellar-night';

export const createThemeConfiguration = (
  manifests: readonly ThemeManifest[],
): ThemeConfiguration => {
  if (manifests.length === 0) {
    throw new Error('No theme manifests were found. Provide at least one theme manifest.');
  }

  const defaultThemeManifest =
    manifests.find((manifest) => manifest.isDefault === true) ??
    manifests.find((manifest) => manifest.id === DEFAULT_THEME_ID) ??
    manifests[0];

  const sortedThemeManifests = sortThemeManifests(manifests, defaultThemeManifest);

  const themeOptions = Object.freeze(sortedThemeManifests.map(manifestToThemeOption)) as readonly ThemeOption[];

  return Object.freeze({
    defaultThemeId: defaultThemeManifest.id as ThemeId,
    options: themeOptions,
  }) satisfies ThemeConfiguration<typeof themeOptions>;
};
