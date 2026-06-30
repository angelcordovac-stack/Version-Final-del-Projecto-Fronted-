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

  it('debe crear el componente', () => {
    expect(component).toBeTruthy();
  });

  it('debe iniciar en el primer slide y el primer testimonio', () => {
    expect(component.currentIndex).toBe(0);
    expect(component.testimonioIndex).toBe(0);
  });

  it('nextSlide() debe avanzar y volver al primer slide al llegar al final', () => {
    const total = component.slides.length;
    for (let i = 0; i < total; i++) {
      component.nextSlide();
    }
    expect(component.currentIndex).toBe(0);
  });

  it('prevSlide() debe retroceder y volver al último slide al llegar al inicio', () => {
    component.prevSlide();
    expect(component.currentIndex).toBe(component.slides.length - 1);
  });

  it('goToSlide() debe saltar al índice indicado', () => {
    component.goToSlide(2);
    expect(component.currentIndex).toBe(2);
  });

  it('nextTestimonio() / prevTestimonio() deben recorrer los testimonios', () => {
    const total = component.testimonios.length;
    component.nextTestimonio();
    expect(component.testimonioIndex).toBe(1);

    component.prevTestimonio();
    component.prevTestimonio();
    expect(component.testimonioIndex).toBe(total - 1);
  });

  it('goToLogin() debe navegar a /login', () => {
    const router = TestBed.inject(Router);
    const navigateSpy = spyOn(router, 'navigate');

    component.goToLogin();

    expect(navigateSpy).toHaveBeenCalledWith(['/login']);
  });

  it('ngOnDestroy() debe limpiar los intervalos del slider', () => {
    spyOn(window, 'clearInterval').and.callThrough();
    component.ngOnDestroy();
    expect(window.clearInterval).toHaveBeenCalled();
  });
});
