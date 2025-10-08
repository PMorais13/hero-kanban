import { ChangeDetectionStrategy, Component, Input, inject } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'hk-profile-modal',
  standalone: true,
  templateUrl: './profile-modal.component.html',
  styleUrls: ['./profile-modal.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatButtonModule],
})
export class ProfileModalComponent {
  @Input() closeAriaLabel: string = 'Fechar modal';

  private readonly dialogRef = inject(MatDialogRef<unknown>, { optional: true });

  protected close(): void {
    this.dialogRef?.close();
  }
}
