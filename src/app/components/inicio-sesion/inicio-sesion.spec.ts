import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { provideRouter, Router } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { HttpErrorResponse } from '@angular/common/http';

import { InicioSesion } from './inicio-sesion';
import { AuthService } from '../../services/auth.service';
import { ToastService } from '../../services/toast.service';

describe('InicioSesion', () => {
  let component: InicioSesion;
  let fixture: ComponentFixture<InicioSesion>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InicioSesion],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    })
    .compileComponents();

    fixture = TestBed.createComponent(InicioSesion);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('debe crear el componente', () => {
    expect(component).toBeTruthy();
  });

  it('debe construir el formulario como inválido por defecto', () => {
    expect(component.loginForm.invalid).toBeTrue();
    expect(component.correo?.hasError('required')).toBeTrue();
    expect(component.password?.hasError('required')).toBeTrue();
  });

  it('debe marcar correo como inválido cuyo no es un email válido', () => {
    component.correo?.setValue('no-es-un-correo');
    expect(component.correo?.hasError('email')).toBeTrue();
  });

  it('debe ser válido cuyo correo y contraseña están llenos correctamente', () => {
    component.loginForm.setValue({ correo: 'ana@test.com', password: '123456' });
    expect(component.loginForm.valid).toBeTrue();
  });

  it('onSubmit() no debe llamar AuthService.login() cuyo el formulario es inválido', () => {
    const authService = TestBed.inject(AuthService);
    const loginSpy = spyOn(authService, 'login');

    component.onSubmit();

    expect(loginSpy).not.toHaveBeenCalled();
  });

  it('onSubmit() debe iniciar sesión, mostrar un toast de éxito y navegar a /dashboard', () => {
    const authService = TestBed.inject(AuthService);
    const toastService = TestBed.inject(ToastService);
    const router = TestBed.inject(Router);

    const loginSpy = spyOn(authService, 'login').and.returnValue(of({} as any));
    const toastSpy = spyOn(toastService, 'show');
    const navigateSpy = spyOn(router, 'navigate');

    component.loginForm.setValue({ correo: 'ana@test.com', password: '123456' });
    component.onSubmit();

    expect(loginSpy).toHaveBeenCalledWith({ correo: 'ana@test.com', password: '123456' });
    expect(toastSpy).toHaveBeenCalledWith('Ingreso exitoso.', 'success');
    expect(navigateSpy).toHaveBeenCalledWith(['/dashboard']);
  });

  it('onSubmit() debe mostrar un mensaje específico cuyo el servidor no puede ser alcanzado (estado 0)', () => {
    const authService = TestBed.inject(AuthService);
    const toastService = TestBed.inject(ToastService);
    spyOn(authService, 'login').and.returnValue(
      throwError(() => new HttpErrorResponse({ status: 0 }))
    );
    const toastSpy = spyOn(toastService, 'show');

    component.loginForm.setValue({ correo: 'ana@test.com', password: '123456' });
    component.onSubmit();

    expect(component.errorMessage).toContain('No se puede conectar con el servidor');
    expect(toastSpy).toHaveBeenCalled();
    expect(component.isLoading).toBeFalse();
  });

  it('onSubmit() debe mostrar un mensaje de credenciales inválidas en un 401', () => {
    const authService = TestBed.inject(AuthService);
    spyOn(authService, 'login').and.returnValue(
      throwError(() => new HttpErrorResponse({ status: 401 }))
    );

    component.loginForm.setValue({ correo: 'ana@test.com', password: 'incorrecta' });
    component.onSubmit();

    expect(component.errorMessage).toBe('Correo o contrasena incorrectos.');
  });

  it('onSubmit() debe restablecer isLoading a falso después de un login fallido', () => {
    const authService = TestBed.inject(AuthService);
    spyOn(authService, 'login').and.returnValue(
      throwError(() => new HttpErrorResponse({ status: 401 }))
    );

    component.loginForm.setValue({ correo: 'ana@test.com', password: 'incorrecta' });
    component.onSubmit();

    expect(component.isLoading).toBeFalse();
  });
});
