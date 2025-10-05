import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';
import type { Observable } from 'rxjs';

import type { ThemeOption, ThemeProfileTokens, ThemeTone } from '../state/theme.config';

type ThemeDto = {
  readonly id: string;
  readonly label: string;
  readonly description: string;
  readonly accent: string;
  readonly softAccent: string;
  readonly previewGradient: string;
  readonly tone: string;
  readonly previewFontFamily: string;
  readonly profile?: ThemeProfileTokens;
  readonly stylesheet?: string | readonly string[];
  readonly isDefault?: boolean;
};

const isThemeTone = (value: string): value is ThemeTone => value === 'dark' || value === 'light';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly httpClient = inject(HttpClient);

  private readonly resourceUrl = 'http://localhost:3000/themes';

  getThemes(): Observable<readonly ThemeOption[]> {
    return this.httpClient.get<readonly ThemeDto[]>(this.resourceUrl).pipe(
      map((themes) => themes.map((theme) => this.mapDtoToThemeOption(theme))),
    );
  }

  private mapDtoToThemeOption(dto: ThemeDto): ThemeOption {
    const { profile, stylesheet, tone, ...optionFields } = dto;
    const normalizedStylesheet = Array.isArray(stylesheet) ? stylesheet.join('\n') : stylesheet;

    if (!isThemeTone(tone)) {
      throw new Error(`Invalid tone "${tone}" provided by theme manifest "${dto.id}".`);
    }

    return Object.freeze({
      ...optionFields,
      tone,
      profile: profile ? Object.freeze({ ...profile }) : undefined,
      stylesheet: normalizedStylesheet,
    }) as ThemeOption;
  }
}
