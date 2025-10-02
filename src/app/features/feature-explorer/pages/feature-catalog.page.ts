import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog } from '@angular/material/dialog';
import { firstValueFrom } from 'rxjs';
import type { FeatureOverviewCardViewModel } from '../state/feature-explorer.models';
import { FeatureExplorerState } from '../state/feature-explorer.state';
import {
  CreateFeatureDialogComponent,
  type CreateFeatureDialogResult,
} from '../components/create-feature-dialog/create-feature-dialog.component';

@Component({
  selector: 'hk-feature-catalog-page',
  standalone: true,
  templateUrl: './feature-catalog.page.html',
  styleUrls: ['./feature-catalog.page.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgIf, NgFor, RouterLink, MatButtonModule, MatIconModule],
})
export class FeatureCatalogPage {
  private readonly featureExplorerState = inject(FeatureExplorerState);
  private readonly dialog = inject(MatDialog);

  protected readonly featureCards = this.featureExplorerState.featureCards;

  protected trackById(_: number, card: FeatureOverviewCardViewModel): string {
    return card.id;
  }

  protected async openCreateFeatureDialog(): Promise<void> {
    const dialogRef = this.dialog.open<CreateFeatureDialogComponent, void, CreateFeatureDialogResult>(
      CreateFeatureDialogComponent,
      {
        width: '480px',
      },
    );

    const result = await firstValueFrom(dialogRef.afterClosed());
    if (!result) {
      return;
    }

    this.featureExplorerState.createFeature({
      title: result.title,
      theme: result.theme,
      mission: result.mission,
      xpReward: result.xpReward,
    });
  }
}
