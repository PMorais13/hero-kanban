import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadChildren: () =>
      import('./features/board/board.routes').then((m) => m.BOARD_ROUTES),
  },
  {
    path: '**',
    redirectTo: '',
  },
];
