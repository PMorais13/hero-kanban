import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class BoardDragState {
  private readonly _draggedStoryId = signal<string | null>(null);
  private readonly _sourceStatusId = signal<string | null>(null);

  readonly draggedStoryId = this._draggedStoryId.asReadonly();
  readonly sourceStatusId = this._sourceStatusId.asReadonly();

  startDrag(storyId: string, statusId: string): void {
    this._draggedStoryId.set(storyId);
    this._sourceStatusId.set(statusId);
  }

  endDrag(): void {
    this._draggedStoryId.set(null);
    this._sourceStatusId.set(null);
  }
}
