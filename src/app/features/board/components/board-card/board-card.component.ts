import { ChangeDetectionStrategy, Component, input, signal, inject } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import type { BoardCardViewModel } from '../../state/board.models';
import { BoardDragState } from '../../state/board-drag-state.service';
import { STORY_ID_MIME_TYPE, STORY_STATUS_MIME_TYPE } from '../board-dnd.constants';

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
  protected readonly isDragging = signal(false);

  private readonly dragState = inject(BoardDragState);

  protected onDragStart(event: DragEvent): void {
    const card = this.card();
    event.dataTransfer?.setData('text/plain', card.title);
    event.dataTransfer?.setData(STORY_ID_MIME_TYPE, card.id);
    event.dataTransfer?.setData(STORY_STATUS_MIME_TYPE, card.statusId);
    event.dataTransfer?.setData('application/json', JSON.stringify({ id: card.id, status: card.statusId }));
    if (event.dataTransfer) {
      event.dataTransfer.effectAllowed = 'move';
    }

    this.dragState.startDrag(card.id, card.statusId);
    this.isDragging.set(true);
  }

  protected onDragEnd(): void {
    this.dragState.endDrag();
    this.isDragging.set(false);
  }
}
