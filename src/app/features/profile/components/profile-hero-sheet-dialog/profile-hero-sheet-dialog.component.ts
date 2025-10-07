import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { NgFor } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { HeroSheet } from '../../models/hero-sheet.model';
import { ProfileModalComponent } from '../profile-modal/profile-modal.component';

@Component({
  selector: 'hk-profile-hero-sheet-dialog',
  standalone: true,
  templateUrl: './profile-hero-sheet-dialog.component.html',
  styleUrls: ['./profile-hero-sheet-dialog.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatDialogModule, MatButtonModule, NgFor, ProfileModalComponent],
})
export class ProfileHeroSheetDialogComponent {
  private readonly dialogRef = inject(MatDialogRef<ProfileHeroSheetDialogComponent>);
  protected readonly sheet = inject<HeroSheet>(MAT_DIALOG_DATA);

  protected close(): void {
    this.dialogRef.close();
  }
}
