import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { RouterLink } from '@angular/router';
import type { FeatureOverviewCardViewModel } from '../state/feature-explorer.models';
import { FeatureExplorerState } from '../state/feature-explorer.state';

@Component({
  selector: 'hk-feature-catalog-page',
  standalone: true,
  templateUrl: './feature-catalog.page.html',
  styleUrls: ['./feature-catalog.page.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgIf, NgFor, RouterLink],
})
export class FeatureCatalogPage {
  private readonly featureExplorerState = inject(FeatureExplorerState);

  protected readonly featureCards = this.featureExplorerState.featureCards;

  protected trackById(_: number, card: FeatureOverviewCardViewModel): string {
    return card.id;
  }
}
