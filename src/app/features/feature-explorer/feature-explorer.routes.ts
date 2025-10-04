import { Routes } from '@angular/router';

export const FEATURE_EXPLORER_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/feature-catalog.page').then((m) => m.FeatureCatalogPage),
  },
  {
    path: ':featureId',
    loadComponent: () =>
      import('./pages/feature-detail.page').then((m) => m.FeatureDetailPage),
  },
];
