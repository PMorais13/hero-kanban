import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
import { BoardState } from '../../state/board-state.service';
import type { StoryDetailsTaskViewModel } from '../../state/board.models';

@Component({
  selector: 'hk-story-details-page',
  standalone: true,
  templateUrl: './story-details.page.html',
  styleUrls: ['./story-details.page.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgIf, NgFor, RouterLink],
})
export class StoryDetailsPageComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly boardState = inject(BoardState);

  private readonly storyId = toSignal(
    this.route.paramMap.pipe(map((params) => params.get('storyId'))),
    { initialValue: null },
  );

  protected readonly story = computed(() => {
    const id = this.storyId();
    return id ? this.boardState.getStoryDetails(id) : null;
  });

  protected trackTask(_: number, task: StoryDetailsTaskViewModel): string {
    return task.id;
  }
}
