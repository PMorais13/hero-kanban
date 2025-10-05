import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { AppComponent } from './app.component';

describe('AppComponent', () => {
  let httpTestingController: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppComponent],
      providers: [provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    httpTestingController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  it('should create the app shell', () => {
    const fixture = TestBed.createComponent(AppComponent);
    httpTestingController.expectOne('http://localhost:3000/themes').flush([]);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('should render the navigation brand', () => {
    const fixture = TestBed.createComponent(AppComponent);
    httpTestingController.expectOne('http://localhost:3000/themes').flush([]);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.shell-header__titles a')?.textContent?.trim()).toBe('Hero Kanban');
  });

  it('should toggle the lateral menu visibility', () => {
    const fixture = TestBed.createComponent(AppComponent);
    httpTestingController.expectOne('http://localhost:3000/themes').flush([]);
    const component = fixture.componentInstance;

    expect(component.isMenuOpen()).toBeFalse();

    component.toggleMenu();
    expect(component.isMenuOpen()).toBeTrue();

    component.closeMenu();
    expect(component.isMenuOpen()).toBeFalse();
  });
});
