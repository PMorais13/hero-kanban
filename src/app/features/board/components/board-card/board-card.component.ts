import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import type { BoardCardViewModel } from '../../state/board.models';

@Component({
  selector: 'kanban-board-card',
  standalone: true,
  templateUrl: './board-card.component.html',
  styleUrls: ['./board-card.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgFor, NgIf],
})
export class BoardCardComponent {
  readonly card = input.required<BoardCardViewModel>();
}
