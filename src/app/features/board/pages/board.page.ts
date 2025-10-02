import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { DecimalPipe, NgFor, NgIf } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatOptionModule } from '@angular/material/core';
import { MatProgressBarModule } from '@angular/material/progress-bar';
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
    NgIf,
    DecimalPipe,
    BoardColumnComponent,
    CreateStoryModalComponent,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatProgressBarModule,
    MatChipsModule,
    MatFormFieldModule,
    MatSelectModule,
    MatOptionModule,
    MatDividerModule,
  ],
})
export class BoardPageComponent {
  private readonly boardState = inject(BoardState);

  protected readonly columns = this.boardState.columns;
  protected readonly summary = this.boardState.summary;
  protected readonly features = this.boardState.features;
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
