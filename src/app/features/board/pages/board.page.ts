import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { DecimalPipe, NgFor, NgIf } from '@angular/common';
import type { BoardColumnViewModel } from '../state/board.models';
import { BoardState } from '../state/board-state.service';
import { BoardColumnComponent } from '../components/board-column/board-column.component';

@Component({
  selector: 'hk-board-page',
  standalone: true,
  templateUrl: './board.page.html',
  styleUrls: ['./board.page.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgFor, NgIf, DecimalPipe, BoardColumnComponent],
})
export class BoardPageComponent {
  private readonly boardState = inject(BoardState);

  protected readonly columns = this.boardState.columns;
  protected readonly summary = this.boardState.summary;

  protected trackColumn(_: number, column: BoardColumnViewModel): string {
    return column.status.id;
  }
}
