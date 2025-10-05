import { ChangeDetectionStrategy, Component, computed, effect, inject, signal } from '@angular/core';
import { DatePipe, DecimalPipe, NgFor, NgIf } from '@angular/common';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatOptionModule } from '@angular/material/core';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

import type { BoardColumnViewModel, CreateStoryPayload, StoryComment } from '../state/board.models';
import { BoardState } from '../state/board-state.service';
import { BoardColumnComponent } from '../components/board-column/board-column.component';
import { CreateStoryModalComponent } from '../components/create-story-modal/create-story-modal.component';
import { StoryCommentsState } from '../state/story-comments.state';

interface RecentComment {
  readonly storyId: string;
  readonly storyTitle: string;
  readonly comment: StoryComment;
}

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
    DatePipe,
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
    MatInputModule,
    MatSnackBarModule,
    ReactiveFormsModule,
  ],
})
export class BoardPageComponent {
  private readonly boardState = inject(BoardState);
  private readonly commentsState = inject(StoryCommentsState);
  private readonly snackBar = inject(MatSnackBar);
  private readonly formBuilder = inject(NonNullableFormBuilder);

  protected readonly columns = this.boardState.columns;
  protected readonly summary = this.boardState.summary;
  protected readonly features = this.boardState.features;
  protected readonly sprints = this.boardState.sprints;
  protected readonly statusOptions = this.boardState.statusOptions;
  protected readonly sprintOptions = this.boardState.sprintFilterOptions;
  protected readonly selectedSprintId = this.boardState.selectedSprintId;
  protected readonly isCreatingStory = signal(false);
  protected readonly storyOptions = computed(() =>
    this.boardState
      .stories()
      .map((story) => ({ id: story.id, title: story.title, assignee: story.assignee })),
  );

  protected readonly recentComments = computed<readonly RecentComment[]>(() => {
    return this.boardState
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
      .slice(0, 4);
  });

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

  protected trackColumn(_: number, column: BoardColumnViewModel): string {
    return column.status.id;
  }

  protected trackRecentComment(_: number, entry: RecentComment): string {
    return entry.comment.id;
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
