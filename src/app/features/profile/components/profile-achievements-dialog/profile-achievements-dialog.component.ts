import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { NgFor, DecimalPipe } from '@angular/common';
import { MatDialogModule } from '@angular/material/dialog';
import { HeroControlState } from '@app/core/state/hero-control.state';
import type { ProfileAchievement } from '@app/core/state/hero-control.models';
import { ProfileModalComponent } from '../profile-modal/profile-modal.component';

@Component({
  selector: 'hk-profile-achievements-dialog',
  standalone: true,
  templateUrl: './profile-achievements-dialog.component.html',
  styleUrls: ['./profile-achievements-dialog.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatDialogModule, NgFor, DecimalPipe, ProfileModalComponent],
})
export class ProfileAchievementsDialogComponent {
  private readonly heroControl = inject(HeroControlState);

  protected readonly achievements = this.heroControl.achievements;
  protected readonly experience = this.heroControl.experience;
  protected readonly trackAchievement = this.heroControl.trackAchievement.bind(this.heroControl);

  protected experienceProgressLabel(achievement: ProfileAchievement): string {
    return `Progresso da conquista ${achievement.title} em ${achievement.progress}%`;
  }
}
