import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs/operators';
import type { FeatureStoryCardViewModel } from '../state/feature-explorer.models';
import { FeatureExplorerState } from '../state/feature-explorer.state';

@Component({
  selector: 'hk-feature-detail-page',
  standalone: true,
  templateUrl: './feature-detail.page.html',
  styleUrls: ['./feature-detail.page.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgIf, NgFor, RouterLink],
})
export class FeatureDetailPage {
  private readonly featureExplorerState = inject(FeatureExplorerState);
  private readonly route = inject(ActivatedRoute);

  private readonly featureId = toSignal(
    this.route.paramMap.pipe(map((params) => params.get('featureId') ?? '')),
    { initialValue: this.route.snapshot.paramMap.get('featureId') ?? '' },
  );

  protected readonly feature = computed(() => {
    const id = this.featureId().trim();
    if (id.length === 0) {
      return undefined;
    }

    return this.featureExplorerState.getFeatureDetail(id);
  });

  protected trackStory(_: number, story: FeatureStoryCardViewModel): string {
    return story.id;
  }
}
