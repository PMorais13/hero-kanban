import { computed, inject, Injectable, Signal } from '@angular/core';
import type {
  CreateStoryAttachmentPayload,
  Story,
  StoryAttachment,
  StoryHistoryEvent,
} from './board.models';
import { BoardState } from './board-state.service';

@Injectable({ providedIn: 'root' })
export class StoryAttachmentsState {
  private readonly boardState = inject(BoardState);
  private readonly attachmentSignals = new Map<string, Signal<readonly StoryAttachment[]>>();

  attachmentsForStory(storyId: string): Signal<readonly StoryAttachment[]> {
    const cached = this.attachmentSignals.get(storyId);
    if (cached) {
      return cached;
    }

    const storySignal = this.boardState.watchStory(storyId);
    const attachmentsSignal = computed(() => storySignal()?.attachments ?? []);
    this.attachmentSignals.set(storyId, attachmentsSignal);
    return attachmentsSignal;
  }

  uploadAttachment(
    storyId: string,
    payload: CreateStoryAttachmentPayload,
  ): StoryAttachment | null {
    const fileName = payload.fileName.trim();
    const fileSizeLabel = payload.fileSizeLabel.trim();
    const uploadedBy = payload.uploadedBy.trim();
    const downloadUrl = (payload.downloadUrl ?? '#').trim();

    if (fileName.length < 3 || uploadedBy.length < 3 || fileSizeLabel.length === 0) {
      return null;
    }

    const timestamp = new Date().toISOString();

    const attachment: StoryAttachment = {
      id: this.createId('attachment'),
      fileName,
      fileSizeLabel,
      uploadedBy,
      uploadedAtIso: timestamp,
      downloadUrl: downloadUrl.length > 0 ? downloadUrl : '#',
    };

    let created: StoryAttachment | null = null;

    this.boardState.updateStory(storyId, (story) => {
      created = attachment;
      const historyEvent = this.createHistoryEvent({
        kind: 'attachment_added',
        actor: uploadedBy,
        summary: `${fileName} anexado`,
        description: `${uploadedBy} compartilhou um novo recurso com o squad.`,
        createdAtIso: timestamp,
      });

      return {
        ...story,
        attachments: [attachment, ...story.attachments],
        history: [historyEvent, ...story.history],
      } satisfies Story;
    });

    return created;
  }

  removeAttachment(storyId: string, attachmentId: string, actor: string): boolean {
    const normalizedActor = actor.trim();
    if (normalizedActor.length < 3) {
      return false;
    }

    const timestamp = new Date().toISOString();
    let removedAttachment: StoryAttachment | null = null;

    this.boardState.updateStory(storyId, (story) => {
      const nextAttachments = story.attachments.filter((attachment) => {
        if (attachment.id !== attachmentId) {
          return true;
        }

        removedAttachment = attachment;
        return false;
      });

      if (removedAttachment === null) {
        return story;
      }

      const historyEvent = this.createHistoryEvent({
        kind: 'attachment_removed',
        actor: normalizedActor,
        summary: `${removedAttachment.fileName} removido`,
        description: `${normalizedActor} removeu o anexo da missão.`,
        createdAtIso: timestamp,
      });

      return {
        ...story,
        attachments: nextAttachments,
        history: [historyEvent, ...story.history],
      } satisfies Story;
    });

    return removedAttachment !== null;
  }

  private createHistoryEvent(event: Omit<StoryHistoryEvent, 'id'>): StoryHistoryEvent {
    return {
      ...event,
      id: this.createId('history'),
    } satisfies StoryHistoryEvent;
  }

  private createId(prefix: string): string {
    if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
      return `${prefix}-${crypto.randomUUID()}`;
    }

    return `${prefix}-${Math.random().toString(36).slice(2, 10)}-${Date.now().toString(36)}`;
  }
}
