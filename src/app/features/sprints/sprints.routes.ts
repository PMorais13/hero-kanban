import { Routes } from '@angular/router';
import { SprintsPageComponent } from './pages/sprints.page';

export const SPRINTS_ROUTES: Routes = [
  {
    path: '',
    component: SprintsPageComponent,
    title: 'Hero Kanban — Planejamento de Sprints',
  },
];
