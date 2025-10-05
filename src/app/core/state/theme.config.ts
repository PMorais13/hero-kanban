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

type ThemeManifest = Omit<ThemeOption, 'tone' | 'profile'> & {
  readonly tone: string;
  readonly isDefault?: boolean;
  readonly profile?: ThemeProfileTokens;
};

const manifestModules = import.meta.glob<ThemeManifest>('./themes/*.json', {
  eager: true,
  import: 'default',
});

const themeManifests = Object.freeze(Object.values(manifestModules)) as readonly ThemeManifest[];

if (themeManifests.length === 0) {
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

const defaultThemeManifest =
  themeManifests.find((manifest) => manifest.isDefault === true) ??
  themeManifests.find((manifest) => manifest.id === 'stellar-night') ??
  themeManifests[0];

const sortedThemeManifests = themeManifests
  .slice()
  .sort((first, second) => {
    if (first.id === defaultThemeManifest.id) {
      return -1;
    }

    if (second.id === defaultThemeManifest.id) {
      return 1;
    }

    return first.label.localeCompare(second.label, 'pt-BR', { sensitivity: 'base' });
  });

const themeOptions = Object.freeze(sortedThemeManifests.map(manifestToThemeOption)) as readonly ThemeOption[];

export type ThemeId = ThemeOption['id'];

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
