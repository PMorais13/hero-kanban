import { Routes } from '@angular/router';
import { BoardPageComponent } from './pages/board.page';

export const BOARD_ROUTES: Routes = [
  {
    path: '',
    component: BoardPageComponent,
    title: 'Hero Kanban — Missões do Time',
  },
];
