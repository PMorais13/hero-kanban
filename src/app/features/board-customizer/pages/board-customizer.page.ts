import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { BoardConfigState } from '@features/board/state/board-config.state';
import type { BoardStatusEditorOption } from '@features/board/state/board-config.state';

@Component({
  selector: 'hk-board-customizer-page',
  standalone: true,
  templateUrl: './board-customizer.page.html',
  styleUrls: ['./board-customizer.page.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgFor, NgIf],
})
export class BoardCustomizerPageComponent {
  private readonly boardConfig = inject(BoardConfigState);

  protected readonly statuses = this.boardConfig.statusOptions;
  protected readonly newStatusName = this.boardConfig.newStatusName;
  protected readonly canCreateStatus = this.boardConfig.canCreateStatus;
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

  protected onStatusFormSubmit(event: Event): void {
    event.preventDefault();
    this.boardConfig.addCustomStatus();
  }

  protected onStatusTitleChange(statusId: string, event: Event): void {
    const target = event.target;

    if (!(target instanceof HTMLInputElement)) {
      return;
    }

    this.boardConfig.updateStatusName(statusId, target.value);
  }

  protected onStatusSubtitleChange(statusId: string, event: Event): void {
    const target = event.target;

    if (!(target instanceof HTMLTextAreaElement || target instanceof HTMLInputElement)) {
      return;
    }

    this.boardConfig.updateStatusDescription(statusId, target.value);
  }

  protected onStatusIconChange(statusId: string, event: Event): void {
    const target = event.target;

    if (!(target instanceof HTMLSelectElement)) {
      return;
    }

    this.boardConfig.updateStatusIcon(statusId, target.value);
  }

  protected onMoveStatus(statusId: string, direction: 'up' | 'down'): void {
    this.boardConfig.moveStatus(statusId, direction);
  }

  protected hasIconOption(icon: string): boolean {
    return this.iconOptions.some((option) => option.value === icon);
  }
}

interface IconOption {
  readonly value: string;
  readonly label: string;
}
