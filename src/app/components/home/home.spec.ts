import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

import { Home } from './home';

describe('Home', () => {
  let component: Home;
  let fixture: ComponentFixture<Home>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Home],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    })
    .compileComponents();

    fixture = TestBed.createComponent(Home);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  afterEach(() => {
    component.ngOnDestroy();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should start on the first slide and first testimonio', () => {
    expect(component.currentIndex).toBe(0);
    expect(component.testimonioIndex).toBe(0);
  });

  it('nextSlide() should advance and wrap around to the first slide', () => {
    const total = component.slides.length;
    for (let i = 0; i < total; i++) {
      component.nextSlide();
    }
    expect(component.currentIndex).toBe(0);
  });

  it('prevSlide() should go back and wrap around to the last slide', () => {
    component.prevSlide();
    expect(component.currentIndex).toBe(component.slides.length - 1);
  });

  it('goToSlide() should jump to the given index', () => {
    component.goToSlide(2);
    expect(component.currentIndex).toBe(2);
  });

  it('nextTestimonio() / prevTestimonio() should cycle through testimonios', () => {
    const total = component.testimonios.length;
    component.nextTestimonio();
    expect(component.testimonioIndex).toBe(1);

    component.prevTestimonio();
    component.prevTestimonio();
    expect(component.testimonioIndex).toBe(total - 1);
  });

  it('goToLogin() should navigate to /login', () => {
    const router = TestBed.inject(Router);
    const navigateSpy = spyOn(router, 'navigate');

    component.goToLogin();

    expect(navigateSpy).toHaveBeenCalledWith(['/login']);
  });

  it('ngOnDestroy() should clear the slider intervals', () => {
    spyOn(window, 'clearInterval').and.callThrough();
    component.ngOnDestroy();
    expect(window.clearInterval).toHaveBeenCalled();
  });
});
