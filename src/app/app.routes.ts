import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadChildren: () =>
      import('./features/board/board.routes').then((m) => m.BOARD_ROUTES),
  },
  {
    path: 'perfil',
    loadChildren: () =>
      import('./features/profile/profile.routes').then((m) => m.PROFILE_ROUTES),
  },
  {
    path: 'quadro/personalizar',
    loadChildren: () =>
      import('./features/board-customizer/board-customizer.routes').then(
        (m) => m.BOARD_CUSTOMIZER_ROUTES,
      ),
  },
  {
    path: '**',
    redirectTo: '',
  },
];
