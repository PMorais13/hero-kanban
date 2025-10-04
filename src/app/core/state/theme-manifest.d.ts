interface ThemeManifest {
  readonly id: string;
  readonly label: string;
  readonly description: string;
  readonly accent: string;
  readonly softAccent: string;
  readonly previewGradient: string;
  readonly tone: 'dark' | 'light';
  readonly previewFontFamily: string;
}

declare module '*.json' {
  const value: ThemeManifest;
  export default value;
}
