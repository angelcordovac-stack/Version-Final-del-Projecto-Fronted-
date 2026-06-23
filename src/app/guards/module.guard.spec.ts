import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';

import { roleGuard } from './module.guard';
import { SessionService, UserSesion } from '../services/session.service';
import { ToastService } from '../services/toast.service';

describe('roleGuard', () => {
  let routerSpy: jasmine.SpyObj<Router>;

  function ejecutarGuard(allowedRoles: string[]): boolean {
    let resultado!: boolean;
    TestBed.runInInjectionContext(() => {
      resultado = roleGuard(allowedRoles)({} as any, {} as any) as boolean;
    });
    return resultado;
  }

  const usuarioJefe: UserSesion = {
    idUsuario: 1,
    nombreCompleto: 'Ana Jefa',
    correo: 'ana@test.com',
    idPerfil: 1,
    rol: { codigo: 'JEFE', descripcion: 'Jefe' },
  };

  beforeEach(() => {
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    TestBed.configureTestingModule({
      providers: [{ provide: Router, useValue: routerSpy }],
    });
  });

  it('should allow access when the user role is included in allowedRoles', () => {
    const sessionService = TestBed.inject(SessionService);
    spyOn(sessionService, 'getInfoSession').and.returnValue(usuarioJefe);

    const permitido = ejecutarGuard(['JEFE']);

    expect(permitido).toBeTrue();
    expect(routerSpy.navigate).not.toHaveBeenCalled();
  });

  it('should block access and redirect to /dashboard when the role is not allowed', () => {
    const sessionService = TestBed.inject(SessionService);
    const toastService = TestBed.inject(ToastService);
    spyOn(sessionService, 'getInfoSession').and.returnValue(usuarioJefe);
    const toastSpy = spyOn(toastService, 'show');

    const permitido = ejecutarGuard(['TECNICO']);

    expect(permitido).toBeFalse();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/dashboard']);
    expect(toastSpy).toHaveBeenCalledWith('Tu rol no permite acceder a esta sección.', 'warning');
  });

  it('should block access and redirect to /login when there is no valid session', () => {
    const sessionService = TestBed.inject(SessionService);
    const toastService = TestBed.inject(ToastService);
    spyOn(sessionService, 'getInfoSession').and.returnValue(null);
    const toastSpy = spyOn(toastService, 'show');

    const permitido = ejecutarGuard(['JEFE']);

    expect(permitido).toBeFalse();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/login']);
    expect(toastSpy).toHaveBeenCalledWith('Sesión inválida.', 'danger');
  });
});
