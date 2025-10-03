import { ChangeDetectionStrategy, Component, OnDestroy, input, signal, inject } from '@angular/core';
import { NgFor } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import type { BoardColumnViewModel } from '../../state/board.models';
import { BoardCardComponent } from '../board-card/board-card.component';
import { BoardState } from '../../state/board-state.service';
import { BoardDragState } from '../../state/board-drag-state.service';

@Component({
  selector: 'kanban-board-column',
  standalone: true,
  templateUrl: './board-column.component.html',
  styleUrls: ['./board-column.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgFor, BoardCardComponent, MatIconModule],
})
export class BoardColumnComponent implements OnDestroy {
  readonly column = input.required<BoardColumnViewModel>();
  protected readonly isDragOver = signal(false);
  protected readonly isDropRejected = signal(false);

  private readonly boardState = inject(BoardState);
  private readonly dragState = inject(BoardDragState);
  private dropFeedbackTimeoutId: number | undefined;

  protected wipDisplayLabel(): string {
    const column = this.column();
    if (column.wipLimit !== undefined) {
      return `${column.wipCount} / ${column.wipLimit}`;
    }

    return `${column.wipCount}`;
  }

  protected wipAriaLabel(): string {
    const column = this.column();
    if (column.wipLimit !== undefined) {
      const prefix = column.isWipLimitBreached ? 'Limite de WIP excedido' : 'Limite de WIP';
      const pluralized = column.wipCount === 1 ? 'história' : 'histórias';
      return `${prefix}: ${column.wipCount} de ${column.wipLimit} ${pluralized}`;
    }

    const pluralized = column.wipCount === 1 ? 'história' : 'histórias';
    return `${column.wipCount} ${pluralized} em andamento`;
  }

  protected trackCard(_: number, card: BoardColumnViewModel['cards'][number]): string {
    return card.id;
  }

  protected onDragEnter(event: DragEvent): void {
    if (!this.canAcceptDrop()) {
      this.isDragOver.set(false);
      return;
    }

    this.clearDropFeedbackTimer();
    this.isDropRejected.set(false);
    event.preventDefault();
    this.isDragOver.set(true);
  }

  protected onDragOver(event: DragEvent): void {
    if (!this.canAcceptDrop()) {
      this.isDragOver.set(false);
      if (event.dataTransfer) {
        event.dataTransfer.dropEffect = 'none';
      }
      return;
    }

    event.preventDefault();
    if (event.dataTransfer) {
      event.dataTransfer.dropEffect = 'move';
    }
    this.isDragOver.set(true);
  }

  protected onDragLeave(event: DragEvent): void {
    if (!(event.currentTarget instanceof HTMLElement)) {
      this.isDragOver.set(false);
      return;
    }

    const nextElement = event.relatedTarget as Node | null;
    if (nextElement && event.currentTarget.contains(nextElement)) {
      return;
    }

    this.isDragOver.set(false);
  }

  protected onDrop(event: DragEvent): void {
    event.preventDefault();
    const storyId = this.dragState.draggedStoryId();
    const targetStatusId = this.column().status.id;

    this.isDragOver.set(false);

    if (!storyId) {
      this.dragState.endDrag();
      return;
    }

    const moved = this.boardState.moveStory(storyId, targetStatusId);
    if (!moved) {
      this.triggerDropRejected();
      if (event.dataTransfer) {
        event.dataTransfer.dropEffect = 'none';
      }
    } else if (event.dataTransfer) {
      event.dataTransfer.dropEffect = 'move';
    }

    this.dragState.endDrag();
  }

  ngOnDestroy(): void {
    this.clearDropFeedbackTimer();
  }

  private canAcceptDrop(): boolean {
    const storyId = this.dragState.draggedStoryId();
    const sourceStatusId = this.dragState.sourceStatusId();
    if (!storyId || !sourceStatusId) {
      return false;
    }

    const targetStatusId = this.column().status.id;
    if (sourceStatusId === targetStatusId) {
      return false;
    }

    return this.boardState.canMoveStory(storyId, targetStatusId);
  }

  private triggerDropRejected(): void {
    this.isDropRejected.set(true);
    this.clearDropFeedbackTimer();

    this.dropFeedbackTimeoutId = window.setTimeout(() => {
      this.isDropRejected.set(false);
      this.dropFeedbackTimeoutId = undefined;
    }, 450);
  }

  private clearDropFeedbackTimer(): void {
    if (this.dropFeedbackTimeoutId !== undefined) {
      window.clearTimeout(this.dropFeedbackTimeoutId);
      this.dropFeedbackTimeoutId = undefined;
    }
  }
}
