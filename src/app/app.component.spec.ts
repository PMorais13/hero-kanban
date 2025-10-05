import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';

import { AppComponent } from './app.component';
import { ThemeService } from './core/services/theme.service';

class ThemeServiceStub {
  getThemes() {
    return of([]);
  }
}

describe('AppComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppComponent],
      providers: [{ provide: ThemeService, useClass: ThemeServiceStub }],
    }).compileComponents();
  });

  it('should create the app shell', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('should render the navigation brand', () => {
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.shell-header__titles a')?.textContent?.trim()).toBe('Hero Kanban');
  });

  it('should toggle the lateral menu visibility', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const component = fixture.componentInstance;

    expect(component.isMenuOpen()).toBeFalse();

    component.toggleMenu();
    expect(component.isMenuOpen()).toBeTrue();

    component.closeMenu();
    expect(component.isMenuOpen()).toBeFalse();
  });
});
