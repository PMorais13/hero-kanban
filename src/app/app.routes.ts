import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadChildren: () =>
      import('./features/home/home.routes').then((m) => m.HOME_ROUTES),
  },
  {
    path: 'perfil',
    loadChildren: () =>
      import('./features/profile/profile.routes').then((m) => m.PROFILE_ROUTES),
  },
  {
    path: 'personalizar',
    loadChildren: () =>
      import('./features/board-customizer/board-customizer.routes').then(
        (m) => m.BOARD_CUSTOMIZER_ROUTES,
      ),
  },
  {
    path: 'quadro',
    loadChildren: () =>
      import('./features/board/board.routes').then((m) => m.BOARD_ROUTES),
  },
  {
    path: 'features',
    loadChildren: () =>
      import('./features/feature-explorer/feature-explorer.routes').then(
        (m) => m.FEATURE_EXPLORER_ROUTES,
      ),
  },
  {
    path: 'journey',
    loadChildren: () =>
      import('./features/sprints/sprints.routes').then((m) => m.SPRINTS_ROUTES),
  },
  {
    path: '**',
    redirectTo: '',
  },
];
