import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

import { Header } from './header';
import { AuthService } from '../../services/auth.service';
import { SessionService } from '../../services/session.service';
import { ToastService } from '../../services/toast.service';

describe('Header', () => {
  let component: Header;
  let fixture: ComponentFixture<Header>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Header],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    fixture = TestBed.createComponent(Header);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('debe crear el componente', () => {
    expect(component).toBeTruthy();
  });

  it('debe reportar que no está autenticado y no tener nombre de usuario cuyo no hay sesión', () => {
    expect(component.isLoggedIn()).toBeFalse();
    expect(component.userName()).toBeNull();
  });

  it('debe reportar el nombre de usuario de la sesión cuyo está autenticado', () => {
    const authService = TestBed.inject(AuthService);
    const sessionService = TestBed.inject(SessionService);
    // Header captura `this.authService.isLoggedIn` (la señal) en el momento de su
    // construcción. Para simular un login real hay que actualizar el estado de esa
    // misma señal en vez de espiar la propiedad después de que ya fue capturada.
    (authService as any)._isLoggedIn.set(true);
    spyOn(sessionService, 'getInfoSession').and.returnValue({
      idUsuario: 1,
      nombreCompleto: 'Carlos Mendez',
      correo: 'carlos@test.com',
      idPerfil: 1,
    });

    expect(component.isLoggedIn()).toBeTrue();
    expect(component.userName()).toBe('Carlos Mendez');
  });

  it('logout() debe llamar AuthService.logout(), mostrar un toast y navegar al inicio', () => {
    const authService = TestBed.inject(AuthService);
    const toastService = TestBed.inject(ToastService);
    const router = TestBed.inject(Router);

    const logoutSpy = spyOn(authService, 'logout');
    const toastSpy = spyOn(toastService, 'show');
    const navigateSpy = spyOn(router, 'navigate');

    component.logout();

    expect(logoutSpy).toHaveBeenCalled();
    expect(toastSpy).toHaveBeenCalledWith('Sesion cerrada.', 'info');
    expect(navigateSpy).toHaveBeenCalledWith(['/']);
  });

  it('debe comenzar con el menú móvil cerrado', () => {
    expect(component.menuOpen).toBeFalse();
  });
});
