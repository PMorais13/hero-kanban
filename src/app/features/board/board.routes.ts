import { Routes } from '@angular/router';
import { BoardPageComponent } from './pages/board.page';
import { StoryDetailsPageComponent } from './pages/story-details/story-details.page';

export const BOARD_ROUTES: Routes = [
  {
    path: 'historia/:storyId',
    component: StoryDetailsPageComponent,
    title: 'Hero Kanban — Detalhes da história',
  },
  {
    path: '',
    component: BoardPageComponent,
    pathMatch: 'full',
    title: 'Hero Kanban — Missões do Time',
  },
];
