import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { ThemeState, type ThemeId, type ThemeOption } from '@app/core/state/theme.state';

@Component({
  selector: 'hk-profile-themes-dialog',
  standalone: true,
  templateUrl: './profile-themes-dialog.component.html',
  styleUrls: ['./profile-themes-dialog.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatDialogModule, MatButtonModule, NgFor, NgIf],
})
export class ProfileThemesDialogComponent {
  private readonly dialogRef = inject(MatDialogRef<ProfileThemesDialogComponent>);
  private readonly themeState = inject(ThemeState);

  protected readonly themes = this.themeState.themes;
  protected readonly currentTheme = this.themeState.currentTheme;

  protected trackTheme(_: number, theme: ThemeOption): ThemeId {
    return theme.id;
  }

  protected isThemeSelected(themeId: ThemeId): boolean {
    return this.currentTheme() === themeId;
  }

  protected onThemeSelect(themeId: ThemeId): void {
    this.themeState.setTheme(themeId);
  }

  protected close(): void {
    this.dialogRef.close();
  }
}
