import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import type { BoardColumnViewModel } from '../../state/board.models';
import { BoardCardComponent } from '../board-card/board-card.component';

@Component({
  selector: 'kanban-board-column',
  standalone: true,
  templateUrl: './board-column.component.html',
  styleUrls: ['./board-column.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgFor, NgIf, BoardCardComponent],
})
export class BoardColumnComponent {
  readonly column = input.required<BoardColumnViewModel>();

  protected trackCard(_: number, card: BoardColumnViewModel['cards'][number]): string {
    return card.id;
  }
}
