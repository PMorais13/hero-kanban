import { ChangeDetectionStrategy, Component, computed, effect, inject, signal } from '@angular/core';
import { DatePipe, NgFor, NgIf } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { BoardState } from '../../state/board-state.service';
import type {
  StoryAttachment,
  StoryComment,
  StoryDetailsTaskViewModel,
  StoryHistoryEvent,
} from '../../state/board.models';
import { StoryCommentsState } from '../../state/story-comments.state';
import { StoryAttachmentsState } from '../../state/story-attachments.state';

@Component({
  selector: 'hk-story-details-page',
  standalone: true,
  templateUrl: './story-details.page.html',
  styleUrls: ['./story-details.page.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    NgIf,
    NgFor,
    RouterLink,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatSnackBarModule,
    DatePipe,
  ],
})
export class StoryDetailsPageComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly boardState = inject(BoardState);
  private readonly commentsState = inject(StoryCommentsState);
  private readonly attachmentsState = inject(StoryAttachmentsState);
  private readonly snackBar = inject(MatSnackBar);
  private readonly formBuilder = inject(NonNullableFormBuilder);

  private readonly storyId = toSignal(
    this.route.paramMap.pipe(map((params) => params.get('storyId'))),
    { initialValue: null },
  );

  protected readonly story = computed(() => {
    const id = this.storyId();
    return id ? this.boardState.getStoryDetails(id) : null;
  });

  protected readonly comments = computed<readonly StoryComment[]>(() => {
    const id = this.storyId();
    if (!id) {
      return [];
    }

    return this.commentsState.commentsForStory(id)();
  });

  protected readonly attachments = computed<readonly StoryAttachment[]>(() => {
    const id = this.storyId();
    if (!id) {
      return [];
    }

    return this.attachmentsState.attachmentsForStory(id)();
  });

  protected readonly history = computed<readonly StoryHistoryEvent[]>(() => {
    const id = this.storyId();
    if (!id) {
      return [];
    }

    const storySignal = this.boardState.watchStory(id);
    return storySignal()?.history ?? [];
  });

  protected readonly commentForm = this.formBuilder.group({
    author: this.formBuilder.control('', [Validators.required, Validators.minLength(3)]),
    message: this.formBuilder.control('', [Validators.required, Validators.minLength(3)]),
  });

  protected readonly replyForm = this.formBuilder.group({
    author: this.formBuilder.control('', [Validators.required, Validators.minLength(3)]),
    message: this.formBuilder.control('', [Validators.required, Validators.minLength(3)]),
  });

  protected readonly editCommentForm = this.formBuilder.group({
    message: this.formBuilder.control('', [Validators.required, Validators.minLength(3)]),
  });

  protected readonly attachmentForm = this.formBuilder.group({
    fileName: this.formBuilder.control('', [Validators.required, Validators.minLength(3)]),
    fileSizeLabel: this.formBuilder.control('1,0 MB', Validators.required),
    uploadedBy: this.formBuilder.control('', [Validators.required, Validators.minLength(3)]),
    downloadUrl: this.formBuilder.control('#'),
  });

  protected readonly replyingToCommentId = signal<string | null>(null);
  protected readonly editingCommentId = signal<string | null>(null);

  private readonly hydrateDefaultAuthors = effect(
    () => {
      const details = this.story();
      if (!details) {
        return;
      }

      if (this.commentForm.controls.author.value.length === 0) {
        this.commentForm.controls.author.setValue(details.assignee);
      }

      if (this.replyForm.controls.author.value.length === 0) {
        this.replyForm.controls.author.setValue(details.assignee);
      }

      if (this.attachmentForm.controls.uploadedBy.value.length === 0) {
        this.attachmentForm.controls.uploadedBy.setValue(details.assignee);
      }
    },
    { allowSignalWrites: true },
  );

  protected trackTask(_: number, task: StoryDetailsTaskViewModel): string {
    return task.id;
  }

  protected trackComment(_: number, comment: StoryComment): string {
    return comment.id;
  }

  protected trackAttachment(_: number, attachment: StoryAttachment): string {
    return attachment.id;
  }

  protected trackHistory(_: number, event: StoryHistoryEvent): string {
    return event.id;
  }

  protected onSubmitComment(): void {
    if (this.commentForm.invalid) {
      this.commentForm.markAllAsTouched();
      return;
    }

    const id = this.storyId();
    if (!id) {
      return;
    }

    const value = this.commentForm.getRawValue();
    const created = this.commentsState.addComment(id, {
      author: value.author,
      message: value.message,
    });

    if (!created) {
      this.snackBar.open('Não foi possível registrar o comentário.', 'Fechar', { duration: 4000 });
      return;
    }

    this.commentForm.controls.message.setValue('');
    this.commentForm.controls.message.markAsPristine();
    this.commentForm.controls.message.markAsUntouched();

    if (created.mentions.length > 0) {
      this.snackBar.open(
        `Menção enviada para ${created.mentions.join(', ')}.`,
        'Ok',
        { duration: 5000 },
      );
    } else {
      this.snackBar.open('Comentário publicado.', 'Ok', { duration: 3500 });
    }
  }

  protected beginReply(comment: StoryComment): void {
    this.replyingToCommentId.set(comment.id);
    if (this.replyForm.controls.author.value.length === 0) {
      this.replyForm.controls.author.setValue(comment.author);
    }
    this.replyForm.controls.message.reset('');
  }

  protected cancelReply(): void {
    this.replyingToCommentId.set(null);
    this.replyForm.reset({
      author: this.replyForm.controls.author.value,
      message: '',
    });
  }

  protected onSubmitReply(commentId: string): void {
    if (this.replyForm.invalid) {
      this.replyForm.markAllAsTouched();
      return;
    }

    const id = this.storyId();
    if (!id) {
      return;
    }

    const value = this.replyForm.getRawValue();
    const created = this.commentsState.replyToComment(id, commentId, {
      author: value.author,
      message: value.message,
    });

    if (!created) {
      this.snackBar.open('Não foi possível publicar a resposta.', 'Fechar', { duration: 4000 });
      return;
    }

    this.snackBar.open('Resposta publicada.', 'Ok', { duration: 3500 });
    this.replyForm.reset({ author: value.author, message: '' });
    this.replyingToCommentId.set(null);
  }

  protected beginEdit(comment: StoryComment): void {
    this.editingCommentId.set(comment.id);
    this.editCommentForm.controls.message.setValue(comment.message);
  }

  protected cancelEdit(): void {
    this.editingCommentId.set(null);
    this.editCommentForm.reset({ message: '' });
  }

  protected onSubmitEdit(commentId: string): void {
    if (this.editCommentForm.invalid) {
      this.editCommentForm.markAllAsTouched();
      return;
    }

    const id = this.storyId();
    if (!id) {
      return;
    }

    const value = this.editCommentForm.getRawValue();
    const updated = this.commentsState.updateComment(id, commentId, {
      message: value.message,
    });

    if (!updated) {
      this.snackBar.open('Não foi possível editar o comentário.', 'Fechar', { duration: 4000 });
      return;
    }

    this.snackBar.open('Comentário atualizado.', 'Ok', { duration: 3500 });
    this.cancelEdit();
  }

  protected onSubmitAttachment(): void {
    if (this.attachmentForm.invalid) {
      this.attachmentForm.markAllAsTouched();
      return;
    }

    const id = this.storyId();
    if (!id) {
      return;
    }

    const value = this.attachmentForm.getRawValue();
    const created = this.attachmentsState.uploadAttachment(id, {
      fileName: value.fileName,
      fileSizeLabel: value.fileSizeLabel,
      uploadedBy: value.uploadedBy,
      downloadUrl: value.downloadUrl,
    });

    if (!created) {
      this.snackBar.open('Não foi possível anexar o arquivo.', 'Fechar', { duration: 4000 });
      return;
    }

    this.snackBar.open('Anexo adicionado à missão.', 'Ok', { duration: 3500 });
    this.attachmentForm.reset({
      fileName: '',
      fileSizeLabel: '1,0 MB',
      uploadedBy: value.uploadedBy,
      downloadUrl: '#',
    });
  }

  protected removeAttachment(attachmentId: string): void {
    const id = this.storyId();
    if (!id) {
      return;
    }

    const actor = this.commentForm.controls.author.value || this.story()?.assignee || 'Equipe';
    const removed = this.attachmentsState.removeAttachment(id, attachmentId, actor);
    if (!removed) {
      this.snackBar.open('Não foi possível remover o anexo.', 'Fechar', { duration: 4000 });
      return;
    }

    this.snackBar.open('Anexo removido.', 'Ok', { duration: 3500 });
  }

  protected historyIcon(kind: StoryHistoryEvent['kind']): string {
    switch (kind) {
      case 'comment_added':
        return 'forum';
      case 'comment_updated':
        return 'edit';
      case 'reply_added':
        return 'quickreply';
      case 'attachment_added':
        return 'attach_file_add';
      case 'attachment_removed':
        return 'attach_file_off';
      case 'status_change':
      default:
        return 'sync_alt';
    }
  }
}
