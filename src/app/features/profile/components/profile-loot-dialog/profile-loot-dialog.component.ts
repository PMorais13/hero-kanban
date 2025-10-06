import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { NgFor } from '@angular/common';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { HeroControlState } from '@app/core/state/hero-control.state';
import type { LootItem } from '@app/core/state/hero-control.models';

@Component({
  selector: 'hk-profile-loot-dialog',
  standalone: true,
  templateUrl: './profile-loot-dialog.component.html',
  styleUrls: ['./profile-loot-dialog.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatDialogModule, MatButtonModule, NgFor],
})
export class ProfileLootDialogComponent {
  private readonly dialogRef = inject(MatDialogRef<ProfileLootDialogComponent>);
  private readonly heroControl = inject(HeroControlState);

  protected readonly loot = this.heroControl.loot;
  protected readonly trackLoot = this.heroControl.trackLoot.bind(this.heroControl);
  protected readonly totalQuantity = computed(() =>
    this.loot().reduce((total, item) => total + item.quantity, 0),
  );

  protected readonly rarityGroups = computed(() => {
    const groups = new Map<LootItem['rarity'], LootItem[]>();
    const rarityOrder: Record<LootItem['rarity'], number> = {
      lendário: 3,
      raro: 2,
      comum: 1,
    } as const;

    for (const item of this.loot()) {
      const items = groups.get(item.rarity) ?? [];
      items.push(item);
      groups.set(item.rarity, items);
    }

    return Array.from(groups.entries()).sort(
      ([rarityA], [rarityB]) => rarityOrder[rarityB] - rarityOrder[rarityA],
    );
  });

  protected close(): void {
    this.dialogRef.close();
  }
}
