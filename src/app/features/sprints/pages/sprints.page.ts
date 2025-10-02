import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { BoardState } from '../../board/state/board-state.service';

@Component({
  selector: 'hk-sprints-page',
  standalone: true,
  templateUrl: './sprints.page.html',
  styleUrls: ['./sprints.page.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgFor, NgIf],
})
export class SprintsPageComponent {
  private readonly boardState = inject(BoardState);

  protected readonly sprintOverviews = this.boardState.sprintOverviews;
  protected readonly trackSprint = this.boardState.trackSprintOverview;
  protected readonly trackStory = this.boardState.trackSprintStory;
  protected readonly trackTask = this.boardState.trackSprintTask;
  protected readonly hasSprints = computed(() => this.sprintOverviews().length > 0);
}
