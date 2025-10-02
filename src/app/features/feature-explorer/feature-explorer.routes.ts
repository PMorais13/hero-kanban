import { Routes } from '@angular/router';
import { FeatureCatalogPage } from './pages/feature-catalog.page';
import { FeatureDetailPage } from './pages/feature-detail.page';

export const FEATURE_EXPLORER_ROUTES: Routes = [
  {
    path: '',
    component: FeatureCatalogPage,
  },
  {
    path: ':featureId',
    component: FeatureDetailPage,
  },
];
