import { Routes } from '@angular/router';

export const HOME_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/home.page').then((m) => m.HomePageComponent),
    pathMatch: 'full',
    title: 'Hero Kanban — Missões do Time',
  },
];
