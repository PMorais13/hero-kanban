import { Routes } from '@angular/router';

export const BOARD_CUSTOMIZER_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/board-customizer.page').then(
        (m) => m.BoardCustomizerPageComponent,
      ),
  },
];
