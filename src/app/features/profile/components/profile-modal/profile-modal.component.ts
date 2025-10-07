import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'hk-profile-modal',
  standalone: true,
  templateUrl: './profile-modal.component.html',
  styleUrls: ['./profile-modal.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProfileModalComponent {}
