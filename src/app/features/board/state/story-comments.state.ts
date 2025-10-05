import { computed, inject, Injectable, Signal } from '@angular/core';
import type {
  CreateStoryCommentPayload,
  CreateStoryCommentReplyPayload,
  Story,
  StoryComment,
  StoryCommentReply,
  StoryHistoryEvent,
  UpdateStoryCommentPayload,
} from './board.models';
import { BoardState } from './board-state.service';

@Injectable({ providedIn: 'root' })
export class StoryCommentsState {
  private readonly boardState = inject(BoardState);
  private readonly commentSignals = new Map<string, Signal<readonly StoryComment[]>>();

  commentsForStory(storyId: string): Signal<readonly StoryComment[]> {
    const cached = this.commentSignals.get(storyId);
    if (cached) {
      return cached;
    }

    const storySignal = this.boardState.watchStory(storyId);
    const commentsSignal = computed(() => storySignal()?.comments ?? []);
    this.commentSignals.set(storyId, commentsSignal);
    return commentsSignal;
  }

  addComment(storyId: string, payload: CreateStoryCommentPayload): StoryComment | null {
    const author = payload.author.trim();
    const message = payload.message.trim();
    if (author.length < 3 || message.length < 3) {
      return null;
    }

    const mentions = this.extractMentions(message);
    const timestamp = new Date().toISOString();

    const comment: StoryComment = {
      id: this.createId('comment'),
      author,
      authorInitials: this.createInitials(author),
      message,
      createdAtIso: timestamp,
      mentions,
      isEdited: false,
      replies: [],
    };

    let created: StoryComment | null = null;

    this.boardState.updateStory(storyId, (story) => {
      const historyEvent = this.createHistoryEvent({
        kind: 'comment_added',
        actor: comment.author,
        summary: `${comment.author} comentou na missão`,
        description:
          mentions.length > 0
            ? `Mencionou ${this.formatMentions(mentions)} em um novo comentário.`
            : 'Abriu uma nova discussão na missão.',
        createdAtIso: timestamp,
      });

      created = comment;
      return {
        ...story,
        comments: [comment, ...story.comments],
        history: [historyEvent, ...story.history],
      } satisfies Story;
    });

    return created;
  }

  updateComment(
    storyId: string,
    commentId: string,
    payload: UpdateStoryCommentPayload,
  ): StoryComment | null {
    const message = payload.message.trim();
    if (message.length < 3) {
      return null;
    }

    const mentions = this.extractMentions(message);
    const timestamp = new Date().toISOString();

    let updated: StoryComment | null = null;

    this.boardState.updateStory(storyId, (story) => {
      let hasChanged = false;
      const nextComments = story.comments.map((comment) => {
        if (comment.id !== commentId) {
          return comment;
        }

        hasChanged = true;
        const nextComment: StoryComment = {
          ...comment,
          message,
          mentions,
          updatedAtIso: timestamp,
          isEdited: true,
        } satisfies StoryComment;
        updated = nextComment;
        return nextComment;
      });

      if (!hasChanged || updated === null) {
        return story;
      }

      const historyEvent = this.createHistoryEvent({
        kind: 'comment_updated',
        actor: updated.author,
        summary: `${updated.author} editou um comentário`,
        description:
          mentions.length > 0
            ? `Atualizou o comentário mencionando ${this.formatMentions(mentions)}.`
            : 'Ajustou o contexto do comentário existente.',
        createdAtIso: timestamp,
      });

      return {
        ...story,
        comments: nextComments,
        history: [historyEvent, ...story.history],
      } satisfies Story;
    });

    return updated;
  }

  replyToComment(
    storyId: string,
    commentId: string,
    payload: CreateStoryCommentReplyPayload,
  ): StoryCommentReply | null {
    const author = payload.author.trim();
    const message = payload.message.trim();
    if (author.length < 3 || message.length < 3) {
      return null;
    }

    const mentions = this.extractMentions(message);
    const timestamp = new Date().toISOString();

    const reply: StoryCommentReply = {
      id: this.createId('reply'),
      author,
      authorInitials: this.createInitials(author),
      message,
      createdAtIso: timestamp,
      mentions,
      isEdited: false,
    };

    let created: StoryCommentReply | null = null;

    this.boardState.updateStory(storyId, (story) => {
      let hasChanged = false;
      const nextComments = story.comments.map((comment) => {
        if (comment.id !== commentId) {
          return comment;
        }

        hasChanged = true;
        created = reply;
        return {
          ...comment,
          replies: [...comment.replies, reply],
        } satisfies StoryComment;
      });

      if (!hasChanged || created === null) {
        return story;
      }

      const historyEvent = this.createHistoryEvent({
        kind: 'reply_added',
        actor: reply.author,
        summary: `${reply.author} respondeu a um comentário`,
        description:
          mentions.length > 0
            ? `Incluiu ${this.formatMentions(mentions)} na resposta.`
            : 'Iniciou um encadeamento na discussão.',
        createdAtIso: timestamp,
      });

      return {
        ...story,
        comments: nextComments,
        history: [historyEvent, ...story.history],
      } satisfies Story;
    });

    return created;
  }

  private createHistoryEvent(event: Omit<StoryHistoryEvent, 'id'>): StoryHistoryEvent {
    return {
      ...event,
      id: this.createId('history'),
    } satisfies StoryHistoryEvent;
  }

  private formatMentions(mentions: readonly string[]): string {
    return mentions
      .map((mention) => `@${mention}`)
      .filter((mention, index, all) => all.indexOf(mention) === index)
      .join(', ');
  }

  private extractMentions(message: string): readonly string[] {
    const mentionPattern = /@([A-Za-zÀ-ÖØ-öø-ÿ][A-Za-zÀ-ÖØ-öø-ÿ\s'-]*)/g;
    const mentions = new Set<string>();
    let match: RegExpExecArray | null;

    while ((match = mentionPattern.exec(message)) !== null) {
      const mention = match[1]?.trim();
      if (mention && mention.length > 0) {
        mentions.add(mention);
      }
    }

    return [...mentions];
  }

  private createInitials(name: string): string {
    return name
      .split(' ')
      .filter(Boolean)
      .map((part) => part.at(0)?.toUpperCase() ?? '')
      .join('')
      .slice(0, 2);
  }

  private createId(prefix: string): string {
    if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
      return `${prefix}-${crypto.randomUUID()}`;
    }

    return `${prefix}-${Math.random().toString(36).slice(2, 10)}-${Date.now().toString(36)}`;
  }
}
