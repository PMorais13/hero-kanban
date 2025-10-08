import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { DecimalPipe, NgIf } from '@angular/common';
import { HeroControlState } from '@app/core/state/hero-control.state';
import { ThemeState } from '@app/core/state/theme.state';
import type { LootItem, ProfileAchievement } from '@app/core/state/hero-control.models';
import { MatDialog, MatDialogModule, type MatDialogConfig } from '@angular/material/dialog';
import { ProfileThemesDialogComponent } from '../components/profile-themes-dialog/profile-themes-dialog.component';
import { ProfileAchievementsDialogComponent } from '../components/profile-achievements-dialog/profile-achievements-dialog.component';
import { ProfileLootDialogComponent } from '../components/profile-loot-dialog/profile-loot-dialog.component';
import { ProfileHeroSheetDialogComponent } from '../components/profile-hero-sheet-dialog/profile-hero-sheet-dialog.component';
import type { HeroSheet } from '../models/hero-sheet.model';

const LOOT_RARITY_WEIGHT: Record<LootItem['rarity'], number> = {
  comum: 1,
  raro: 2,
  lendário: 3,
};

@Component({
  selector: 'hk-profile-page',
  standalone: true,
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DecimalPipe, NgIf, MatDialogModule],
})
export class ProfilePageComponent {
  private readonly heroControl = inject(HeroControlState);
  private readonly themeState = inject(ThemeState);
  private readonly dialog = inject(MatDialog);
  private readonly profileDialogConfig: MatDialogConfig = {
    panelClass: 'profile-dialog-panel',
    autoFocus: false,
    width: '80vw',
    maxWidth: '1180px',
    minWidth: 'min(80vw, 320px)',
  };

  protected readonly experience = this.heroControl.experience;
  protected readonly experienceProgress = this.heroControl.experienceProgress;
  protected readonly achievements = this.heroControl.achievements;
  protected readonly loot = this.heroControl.loot;
  protected readonly themes = this.themeState.themes;
  protected readonly currentTheme = this.themeState.currentTheme;

  protected readonly heroSheet: HeroSheet = {
    name: 'Lia Stormforge',
    title: 'Guardião do Fluxo Épico',
    lineage: 'Humana da Cidade-porto de Valora',
    heroClass: 'Estrategista Arcana (Suporte Tático)',
    guild: 'Convergência Hero Kanban',
    alignment: 'Ordem Inovadora (Leal & Criativo)',
    banner: 'Estandarte Prisma da Iteração',
    signature: 'Orbe da Daily Eterna',
    attributes: [
      { label: 'Estratégia', value: 18 },
      { label: 'Colaboração', value: 17 },
      { label: 'Resiliência', value: 16 },
      { label: 'Execução', value: 15 },
      { label: 'Criatividade', value: 15 },
      { label: 'Carisma', value: 14 },
    ],
    traits: [
      {
        title: 'Aura Motivadora',
        description: 'Concede +2 de moral a toda a party sempre que uma daily inicia no horário.',
      },
      {
        title: 'Visão de Produto',
        description: 'Permite revelar bloqueios ocultos um sprint antes de impactarem o roadmap.',
      },
      {
        title: 'Runa de Refatoração',
        description: 'Uma vez por ciclo, remove um bug crítico instantaneamente sem custo de mana.',
      },
    ],
  };

  private readonly heroSheetMainAttribute = this.heroSheet.attributes.reduce(
    (best, attribute) => {
      if (attribute.value > best.value) {
        return attribute;
      }

      return best;
    },
    this.heroSheet.attributes[0],
  );

  protected readonly themesCount = computed(() => this.themes().length);

  protected readonly currentThemeOption = computed(() =>
    this.themes().find((theme) => theme.id === this.currentTheme()) ?? null,
  );

  protected readonly achievementsAverage = computed(() => {
    const list = this.achievements();

    if (!list.length) {
      return 0;
    }

    const totalProgress = list.reduce((total, item) => total + item.progress, 0);
    return Math.round(totalProgress / list.length);
  });

  protected readonly highlightedAchievement = computed(() => {
    const list = this.achievements();

    if (!list.length) {
      return null;
    }

    return list.reduce<ProfileAchievement | null>((best, current) => {
      if (best === null || current.progress > best.progress) {
        return current;
      }

      return best;
    }, null);
  });

  protected readonly completedAchievements = computed(() =>
    this.achievements().filter((achievement) => achievement.progress >= 100).length,
  );

  protected readonly lootUniqueCount = computed(() => this.loot().length);

  protected readonly lootTotalQuantity = computed(() =>
    this.loot().reduce((total, item) => total + item.quantity, 0),
  );

  protected readonly featuredLoot = computed(() => {
    const items = this.loot();

    if (!items.length) {
      return null;
    }

    return items.reduce<LootItem | null>((best, item) => {
      if (best === null) {
        return item;
      }

      const currentWeight = LOOT_RARITY_WEIGHT[item.rarity];
      const bestWeight = LOOT_RARITY_WEIGHT[best.rarity];

      if (currentWeight > bestWeight) {
        return item;
      }

      if (currentWeight === bestWeight && item.quantity > best.quantity) {
        return item;
      }

      return best;
    }, null);
  });

  protected readonly heroMainAttributeLabel = this.heroSheetMainAttribute.label;

  protected openThemesDialog(): void {
    this.dialog.open(ProfileThemesDialogComponent, this.profileDialogConfig);
  }

  protected openAchievementsDialog(): void {
    this.dialog.open(ProfileAchievementsDialogComponent, this.profileDialogConfig);
  }

  protected openLootDialog(): void {
    this.dialog.open(ProfileLootDialogComponent, this.profileDialogConfig);
  }

  protected openHeroSheetDialog(): void {
    this.dialog.open(ProfileHeroSheetDialogComponent, {
      ...this.profileDialogConfig,
      data: this.heroSheet,
    });
  }
}
