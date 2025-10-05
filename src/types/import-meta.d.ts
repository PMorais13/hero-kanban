/**
 * Minimal type augmentation for the Angular esbuild builder glob import helper.
 * Supports eager loading of JSON manifests via `import.meta.glob`.
 */
declare interface ImportMeta {
  glob<T = unknown>(
    pattern: string,
    options: {
      readonly eager: true;
      readonly import: 'default';
    },
  ): Record<string, T>;

  glob<T = unknown>(
    pattern: string,
    options: {
      readonly eager: true;
    },
  ): Record<string, { readonly default: T }>;
}
