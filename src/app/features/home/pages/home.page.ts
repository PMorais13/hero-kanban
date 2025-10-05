import { ChangeDetectionStrategy, Component, computed, effect, inject } from '@angular/core';
import { DatePipe, DecimalPipe, NgFor, NgIf } from '@angular/common';
import { RouterLink } from '@angular/router';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatOptionModule } from '@angular/material/core';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

import type { StoryComment } from '../../board/state/board.models';
import { BoardState } from '../../board/state/board-state.service';
import { StoryCommentsState } from '../../board/state/story-comments.state';

interface RecentComment {
  readonly storyId: string;
  readonly storyTitle: string;
  readonly comment: StoryComment;
}

@Component({
  selector: 'hk-home-page',
  standalone: true,
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    NgFor,
    NgIf,
    DecimalPipe,
    DatePipe,
    ReactiveFormsModule,
    RouterLink,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatProgressBarModule,
    MatChipsModule,
    MatFormFieldModule,
    MatSelectModule,
    MatOptionModule,
    MatDividerModule,
    MatInputModule,
    MatSnackBarModule,
  ],
})
export class HomePageComponent {
  private readonly boardState = inject(BoardState);
  private readonly commentsState = inject(StoryCommentsState);
  private readonly snackBar = inject(MatSnackBar);
  private readonly formBuilder = inject(NonNullableFormBuilder);

  protected readonly summary = this.boardState.summary;
  protected readonly storyOptions = computed(() =>
    this.boardState
      .stories()
      .map((story) => ({ id: story.id, title: story.title, assignee: story.assignee })),
  );

  protected readonly recentComments = computed<readonly RecentComment[]>(() =>
    this.boardState
      .stories()
      .flatMap((story) =>
        story.comments.map(
          (comment) =>
            ({
              storyId: story.id,
              storyTitle: story.title,
              comment,
            }) satisfies RecentComment,
        ),
      )
      .sort((a, b) => Date.parse(b.comment.createdAtIso) - Date.parse(a.comment.createdAtIso))
      .slice(0, 4),
  );

  protected readonly quickCommentForm = this.formBuilder.group({
    storyId: this.formBuilder.control('', Validators.required),
    author: this.formBuilder.control('', [Validators.required, Validators.minLength(3)]),
    message: this.formBuilder.control('', [Validators.required, Validators.minLength(3)]),
  });

  private readonly hydrateFormDefaults = effect(
    () => {
      const stories = this.boardState.stories();
      if (stories.length === 0) {
        return;
      }

      const currentStoryId = this.quickCommentForm.controls.storyId.value;
      if (!currentStoryId || !stories.some((story) => story.id === currentStoryId)) {
        this.quickCommentForm.controls.storyId.setValue(stories[0]?.id ?? '');
      }

      const currentAuthor = this.quickCommentForm.controls.author.value;
      if (currentAuthor.length === 0) {
        const defaultAssignee = stories.find((story) => story.id === this.quickCommentForm.controls.storyId.value)?.assignee;
        if (defaultAssignee) {
          this.quickCommentForm.controls.author.setValue(defaultAssignee);
        }
      }
    },
    { allowSignalWrites: true },
  );

  protected trackRecentComment(_: number, entry: RecentComment): string {
    return entry.comment.id;
  }

  protected onSubmitQuickComment(): void {
    if (this.quickCommentForm.invalid) {
      this.quickCommentForm.markAllAsTouched();
      return;
    }

    const value = this.quickCommentForm.getRawValue();
    const created = this.commentsState.addComment(value.storyId, {
      author: value.author,
      message: value.message,
    });

    if (!created) {
      this.snackBar.open('Não foi possível registrar o comentário. Confira os campos e tente novamente.', 'Fechar', {
        duration: 4000,
      });
      return;
    }

    this.quickCommentForm.controls.message.setValue('');
    this.quickCommentForm.controls.message.markAsPristine();
    this.quickCommentForm.controls.message.markAsUntouched();

    const storyTitle = this.storyOptions().find((option) => option.id === value.storyId)?.title ?? 'história selecionada';
    if (created.mentions.length > 0) {
      this.snackBar.open(
        `Menção enviada para ${created.mentions.join(', ')} em ${storyTitle}.`,
        'Ok',
        { duration: 5000 },
      );
    } else {
      this.snackBar.open(`Comentário publicado em ${storyTitle}.`, 'Ok', {
        duration: 3500,
      });
    }
  }
}
