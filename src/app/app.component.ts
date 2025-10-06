import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { NgFor } from '@angular/common';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { HeroControlState } from './core/state/hero-control.state';
import { ThemeState } from './core/state/theme.state';

interface ShellNavItem {
  readonly label: string;
  readonly description: string;
  readonly icon: string;
  readonly link: string;
  readonly exact?: boolean;
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    NgFor,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatSidenavModule,
    MatListModule,
    MatChipsModule,
    MatProgressBarModule,
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent {
  private readonly heroControl = inject(HeroControlState);
  private readonly themeState = inject(ThemeState);

  readonly isMenuOpen = signal(false);

  readonly experience = this.heroControl.experience;
  readonly experienceProgress = this.heroControl.experienceProgress;

  readonly exactMatchOptions = { exact: true } as const;
  readonly defaultMatchOptions = { exact: false } as const;

  readonly remainingExperience = computed(() => {
    const experience = this.experience();
    return Math.max(experience.nextLevel - experience.current, 0);
  });

  readonly navItems: readonly ShellNavItem[] = [
    {
      label: 'Central',
      description: 'Missões e discussões do time',
      icon: 'dashboard',
      link: '/',
      exact: true,
    },
    {
      label: 'Quadro',
      description: 'Tarefas e histórias em andamento',
      icon: 'view_kanban',
      link: '/quadro',
    },
    {
      label: 'Jornadas',
      description: 'Alinhamento por ciclo',
      icon: 'flag',
      link: '/journey',
    },
    {
      label: 'Marcos & histórias',
      description: 'Mapa estratégico da guilda',
      icon: 'auto_awesome_mosaic',
      link: '/features',
    },
    {
      label: 'Perfil',
      description: 'Progresso do herói',
      icon: 'shield_person',
      link: '/perfil',
    },
    {
      label: 'Editar quadro',
      description: 'Personalizar etapas e limites',
      icon: 'tune',
      link: '/quadro/personalizar',
    },
  ];

  constructor() {
    // Trigger inicialização do estado de tema ao carregar a shell.
    void this.themeState;
  }

  toggleMenu(): void {
    this.isMenuOpen.update((isOpen) => !isOpen);
  }

  closeMenu(): void {
    this.isMenuOpen.set(false);
  }

  handleMenuKeydown(event: KeyboardEvent): void {
    if (event.key === 'Escape') {
      this.closeMenu();
    }
  }

  handleSidenavStateChange(isOpened: boolean): void {
    this.isMenuOpen.set(isOpened);
  }
}
