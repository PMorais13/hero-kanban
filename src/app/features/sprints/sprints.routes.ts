import { Routes } from '@angular/router';

export const SPRINTS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/sprints.page').then((m) => m.SprintsPageComponent),
    title: 'Hero Kanban — Planejamento das Jornadas',
  },
];
