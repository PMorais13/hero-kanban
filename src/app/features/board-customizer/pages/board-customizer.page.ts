import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { HeroControlState } from '@app/core/state/hero-control.state';
import type { BoardStatusOption } from '@app/core/state/hero-control.models';

@Component({
  selector: 'hk-board-customizer-page',
  standalone: true,
  templateUrl: './board-customizer.page.html',
  styleUrls: ['./board-customizer.page.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgFor, NgIf],
})
export class BoardCustomizerPageComponent {
  private readonly heroControl = inject(HeroControlState);

  protected readonly statuses = this.heroControl.boardStatuses;
  protected readonly newStatusName = this.heroControl.newStatusName;
  protected readonly canCreateStatus = this.heroControl.canCreateStatus;

  protected trackStatus(_: number, status: BoardStatusOption): string {
    return status.id;
  }

  protected onStatusToggle(statusId: string, event: Event): void {
    const target = event.target;

    if (!(target instanceof HTMLInputElement)) {
      return;
    }

    this.heroControl.toggleStatus(statusId, target.checked);
  }

  protected onStatusNameInput(event: Event): void {
    const target = event.target;

    if (!(target instanceof HTMLInputElement)) {
      return;
    }

    this.heroControl.updateNewStatusName(target.value);
  }

  protected onStatusFormSubmit(event: Event): void {
    event.preventDefault();
    this.heroControl.addCustomStatus();
  }
}
