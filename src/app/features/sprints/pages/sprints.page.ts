import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { BoardState } from '../../board/state/board-state.service';
import type { CreateSprintPayload } from '../../board/state/board.models';
import { CreateSprintModalComponent } from '../components/create-sprint-modal/create-sprint-modal.component';

@Component({
  selector: 'hk-sprints-page',
  standalone: true,
  templateUrl: './sprints.page.html',
  styleUrls: ['./sprints.page.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgFor, NgIf, CreateSprintModalComponent],
})
export class SprintsPageComponent {
  private readonly boardState = inject(BoardState);

  protected readonly sprintOverviews = this.boardState.sprintOverviews;
  protected readonly trackSprint = this.boardState.trackSprintOverview;
  protected readonly trackStory = this.boardState.trackSprintStory;
  protected readonly trackTask = this.boardState.trackSprintTask;
  protected readonly hasSprints = computed(() => this.sprintOverviews().length > 0);
  protected readonly isCreatingSprint = signal(false);

  protected openCreateSprint(): void {
    this.isCreatingSprint.set(true);
  }

  protected closeCreateSprint(): void {
    this.isCreatingSprint.set(false);
  }

  protected onSprintSubmitted(payload: CreateSprintPayload): void {
    const created = this.boardState.createSprint(payload);
    if (created) {
      this.isCreatingSprint.set(false);
    }
  }
}
