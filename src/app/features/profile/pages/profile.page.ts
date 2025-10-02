import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { DecimalPipe, NgFor } from '@angular/common';
import { HeroControlState } from '@app/core/state/hero-control.state';
import type { LootItem, ProfileAchievement } from '@app/core/state/hero-control.models';

@Component({
  selector: 'hk-profile-page',
  standalone: true,
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgFor, DecimalPipe],
})
export class ProfilePageComponent {
  private readonly heroControl = inject(HeroControlState);

  protected readonly experience = this.heroControl.experience;
  protected readonly experienceProgress = this.heroControl.experienceProgress;
  protected readonly achievements = this.heroControl.achievements;
  protected readonly loot = this.heroControl.loot;
  protected trackAchievement(_: number, achievement: ProfileAchievement): string {
    return achievement.id;
  }

  protected trackLoot(_: number, lootItem: LootItem): string {
    return lootItem.id;
  }
}
