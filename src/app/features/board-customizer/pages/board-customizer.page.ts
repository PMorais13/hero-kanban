import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { BoardConfigState } from '@features/board/state/board-config.state';
import type { BoardStatusToggleOption } from '@features/board/state/board-config.state';

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

  protected trackStatus(_: number, status: BoardStatusToggleOption): string {
    return status.id;
  }

  protected onStatusToggle(statusId: string, event: Event): void {
    const target = event.target;

    if (!(target instanceof HTMLInputElement)) {
      return;
    }

    this.boardConfig.toggleStatus(statusId, target.checked);
  }

  protected onStatusNameInput(event: Event): void {
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
}
