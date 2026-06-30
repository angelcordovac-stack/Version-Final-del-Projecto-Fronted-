import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

import { authGuard } from './auth.guard';
import { AuthService } from '../services/auth.service';
import { ToastService } from '../services/toast.service';

describe('authGuard', () => {
  let routerSpy: jasmine.SpyObj<Router>;

  function ejecutarGuard(): boolean {
    let resultado!: boolean;
    TestBed.runInInjectionContext(() => {
      resultado = authGuard({} as any, {} as any) as boolean;
    });
    return resultado;
  }

  beforeEach(() => {
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: Router, useValue: routerSpy },
      ],
    });
  });

  it('debe permitir acceso cuyo el usuario está autenticado', () => {
    const authService = TestBed.inject(AuthService);
    spyOn(authService, 'isLoggedIn').and.returnValue(true);

    const permitido = ejecutarGuard();

    expect(permitido).toBeTrue();
    expect(routerSpy.navigate).not.toHaveBeenCalled();
  });

  it('debe bloquear acceso y redirigir a /login cuando el usuario no está autenticado', () => {
    const authService = TestBed.inject(AuthService);
    const toastService = TestBed.inject(ToastService);
    spyOn(authService, 'isLoggedIn').and.returnValue(false);
    const toastSpy = spyOn(toastService, 'show');

    const permitido = ejecutarGuard();

    expect(permitido).toBeFalse();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/login']);
    expect(toastSpy).toHaveBeenCalledWith('Debes iniciar sesión para acceder.', 'warning');
  });
});
