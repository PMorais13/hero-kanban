import { CdkDrag, CdkDragHandle, CdkDragDrop, CdkDropList } from '@angular/cdk/drag-drop';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { BoardConfigState } from '@features/board/state/board-config.state';
import type { BoardStatusEditorOption } from '@features/board/state/board-config.state';
import { StatusEditorModalComponent } from '../components/status-editor-modal/status-editor-modal.component';
import type { StatusEditorFormValue } from '../components/status-editor-modal/status-editor-modal.component';

@Component({
  selector: 'hk-board-customizer-page',
  standalone: true,
  templateUrl: './board-customizer.page.html',
  styleUrls: ['./board-customizer.page.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgFor, NgIf, StatusEditorModalComponent, CdkDropList, CdkDrag, CdkDragHandle],
})
export class BoardCustomizerPageComponent {
  private readonly boardConfig = inject(BoardConfigState);

  protected readonly statuses = this.boardConfig.statusOptions;
  protected readonly newStatusDraft = this.boardConfig.newStatusDraft;
  protected readonly canCreateStatus = this.boardConfig.canCreateStatus;
  protected readonly editingStatusId = signal<string | null>(null);
  protected readonly editingStatus = computed(() => {
    const targetId = this.editingStatusId();

    if (!targetId) {
      return null;
    }

    return this.statuses().find((status) => status.id === targetId) ?? null;
  });
  protected readonly iconOptions: readonly IconOption[] = [
    { value: 'lightbulb', label: 'Ideação' },
    { value: 'rocket_launch', label: 'Preparação' },
    { value: 'smart_toy', label: 'Construção' },
    { value: 'stadia_controller', label: 'Teste / Playtest' },
    { value: 'rocket', label: 'Deploy' },
    { value: 'emoji_events', label: 'Conquista' },
    { value: 'ac_unit', label: 'Icebox' },
    { value: 'report', label: 'Bloqueio' },
    { value: 'flag', label: 'Checkpoint' },
    { value: 'auto_awesome', label: 'Iteração' },
  ];

  protected trackStatus(_: number, status: BoardStatusEditorOption): string {
    return status.id;
  }

  protected onStatusToggle(statusId: string, event: Event): void {
    const target = event.target;

    if (!(target instanceof HTMLInputElement)) {
      return;
    }

    this.boardConfig.toggleStatus(statusId, target.checked);
  }

  protected onNewStatusNameInput(event: Event): void {
    const target = event.target;

    if (!(target instanceof HTMLInputElement)) {
      return;
    }

    this.boardConfig.updateNewStatusName(target.value);
  }

  protected onNewStatusDescriptionInput(event: Event): void {
    const target = event.target;

    if (!(target instanceof HTMLTextAreaElement)) {
      return;
    }

    this.boardConfig.updateNewStatusDescription(target.value);
  }

  protected onNewStatusIconChange(event: Event): void {
    const target = event.target;

    if (!(target instanceof HTMLSelectElement)) {
      return;
    }

    this.boardConfig.updateNewStatusIcon(target.value);
  }

  protected onStatusFormSubmit(event: Event): void {
    event.preventDefault();
    this.boardConfig.addCustomStatus();
  }

  protected onStatusDrop(event: CdkDragDrop<readonly BoardStatusEditorOption[]>): void {
    const { previousIndex, currentIndex } = event;

    if (previousIndex === currentIndex) {
      return;
    }

    const list = event.container.data ?? this.statuses();
    const target =
      (event.item.data as BoardStatusEditorOption | undefined) ??
      list[previousIndex] ??
      this.statuses()[previousIndex];

    if (!target) {
      return;
    }

    this.boardConfig.reorderStatus(target.id, currentIndex);
  }

  protected openStatusEditor(statusId: string): void {
    this.editingStatusId.set(statusId);
  }

  protected closeStatusEditor(): void {
    this.editingStatusId.set(null);
  }

  protected onStatusEditorSubmit(update: StatusEditorFormValue): void {
    const current = this.editingStatus();

    if (!current) {
      return;
    }

    const normalizedName = update.name.trim();
    if (normalizedName.length > 0 && normalizedName !== current.name) {
      this.boardConfig.updateStatusName(current.id, normalizedName);
    }

    const normalizedDescription = update.description.replace(/\s+/g, ' ').trim();
    if (normalizedDescription !== current.description) {
      this.boardConfig.updateStatusDescription(current.id, normalizedDescription);
    }

    const normalizedIcon = update.icon.trim();
    if (normalizedIcon !== current.icon) {
      this.boardConfig.updateStatusIcon(current.id, normalizedIcon);
    }

    const normalizedColor = update.color.trim().toLowerCase();
    if (normalizedColor !== current.color) {
      this.boardConfig.updateStatusColor(current.id, normalizedColor);
    }

    this.closeStatusEditor();
  }

  protected onDeleteStatus(status: BoardStatusEditorOption): void {
    const confirmation = confirm(
      `Tem certeza de que deseja remover a etapa "${status.name}"? Essa ação não pode ser desfeita.`,
    );

    if (!confirmation) {
      return;
    }

    this.boardConfig.removeStatus(status.id);

    if (this.editingStatusId() === status.id) {
      this.closeStatusEditor();
    }
  }
}

interface IconOption {
  readonly value: string;
  readonly label: string;
}
