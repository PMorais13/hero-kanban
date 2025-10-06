import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { NgFor, DecimalPipe } from '@angular/common';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { HeroControlState } from '@app/core/state/hero-control.state';
import type { ProfileAchievement } from '@app/core/state/hero-control.models';

@Component({
  selector: 'hk-profile-achievements-dialog',
  standalone: true,
  templateUrl: './profile-achievements-dialog.component.html',
  styleUrls: ['./profile-achievements-dialog.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatDialogModule, MatButtonModule, NgFor, DecimalPipe],
})
export class ProfileAchievementsDialogComponent {
  private readonly dialogRef = inject(MatDialogRef<ProfileAchievementsDialogComponent>);
  private readonly heroControl = inject(HeroControlState);

  protected readonly achievements = this.heroControl.achievements;
  protected readonly experience = this.heroControl.experience;
  protected readonly trackAchievement = this.heroControl.trackAchievement.bind(this.heroControl);

  protected close(): void {
    this.dialogRef.close();
  }

  protected experienceProgressLabel(achievement: ProfileAchievement): string {
    return `Progresso da conquista ${achievement.title} em ${achievement.progress}%`;
  }
}
