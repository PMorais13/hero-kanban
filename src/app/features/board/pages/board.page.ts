import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { NgFor } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatOptionModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';

import type { BoardColumnViewModel, CreateStoryPayload } from '../state/board.models';
import { BoardState } from '../state/board-state.service';
import { BoardColumnComponent } from '../components/board-column/board-column.component';
import { CreateStoryModalComponent } from '../components/create-story-modal/create-story-modal.component';

@Component({
  selector: 'hk-board-page',
  standalone: true,
  templateUrl: './board.page.html',
  styleUrls: ['./board.page.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    NgFor,
    BoardColumnComponent,
    CreateStoryModalComponent,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatSelectModule,
    MatOptionModule,
  ],
})
export class BoardPageComponent {
  private readonly boardState = inject(BoardState);

  protected readonly columns = this.boardState.columns;
  protected readonly features = this.boardState.features;
  protected readonly sprints = this.boardState.sprints;
  protected readonly statusOptions = this.boardState.statusOptions;
  protected readonly sprintOptions = this.boardState.sprintFilterOptions;
  protected readonly selectedSprintId = this.boardState.selectedSprintId;
  protected readonly isCreatingStory = signal(false);

  protected trackColumn(_: number, column: BoardColumnViewModel): string {
    return column.status.id;
  }

  protected openCreateStory(): void {
    this.isCreatingStory.set(true);
  }

  protected closeCreateStory(): void {
    this.isCreatingStory.set(false);
  }

  protected onStorySubmitted(draft: CreateStoryPayload): void {
    const created = this.boardState.createStory(draft);
    if (created) {
      this.isCreatingStory.set(false);
    }
  }

  protected onSprintFilterSelected(sprintId: string): void {
    this.boardState.setSprintFilter(sprintId);
  }
}
