import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { DecimalPipe, NgFor, NgIf } from '@angular/common';
import { HeroControlState } from '@app/core/state/hero-control.state';
import { ThemeState, type ThemeId, type ThemeOption } from '@app/core/state/theme.state';
import type { LootItem, ProfileAchievement } from '@app/core/state/hero-control.models';

@Component({
  selector: 'hk-profile-page',
  standalone: true,
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgFor, DecimalPipe, NgIf],
})
export class ProfilePageComponent {
  private readonly heroControl = inject(HeroControlState);
  private readonly themeState = inject(ThemeState);

  protected readonly experience = this.heroControl.experience;
  protected readonly experienceProgress = this.heroControl.experienceProgress;
  protected readonly achievements = this.heroControl.achievements;
  protected readonly loot = this.heroControl.loot;
  protected readonly themes = this.themeState.themes;
  protected readonly currentTheme = this.themeState.currentTheme;

  protected trackAchievement(_: number, achievement: ProfileAchievement): string {
    return achievement.id;
  }

  protected trackLoot(_: number, lootItem: LootItem): string {
    return lootItem.id;
  }

  protected trackTheme(_: number, theme: ThemeOption): ThemeId {
    return theme.id;
  }

  protected isThemeSelected(themeId: ThemeId): boolean {
    return this.currentTheme() === themeId;
  }

  protected onThemeSelect(themeId: ThemeId): void {
    this.themeState.setTheme(themeId);
  }
}
