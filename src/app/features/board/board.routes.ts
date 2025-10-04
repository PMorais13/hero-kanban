import { Routes } from '@angular/router';

export const BOARD_ROUTES: Routes = [
  {
    path: 'historia/:storyId',
    loadComponent: () =>
      import('./pages/story-details/story-details.page').then(
        (m) => m.StoryDetailsPageComponent,
      ),
    title: 'Hero Kanban — Detalhes da história',
  },
  {
    path: '',
    loadComponent: () =>
      import('./pages/board.page').then((m) => m.BoardPageComponent),
    pathMatch: 'full',
    title: 'Hero Kanban — Missões do Time',
  },
];
