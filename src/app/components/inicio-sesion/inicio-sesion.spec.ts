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

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should build the form as invalid by default', () => {
    expect(component.loginForm.invalid).toBeTrue();
    expect(component.correo?.hasError('required')).toBeTrue();
    expect(component.password?.hasError('required')).toBeTrue();
  });

  it('should mark correo as invalid when it is not a valid email', () => {
    component.correo?.setValue('no-es-un-correo');
    expect(component.correo?.hasError('email')).toBeTrue();
  });

  it('should be valid once correo and password are filled correctly', () => {
    component.loginForm.setValue({ correo: 'ana@test.com', password: '123456' });
    expect(component.loginForm.valid).toBeTrue();
  });

  it('onSubmit() should not call AuthService.login() when the form is invalid', () => {
    const authService = TestBed.inject(AuthService);
    const loginSpy = spyOn(authService, 'login');

    component.onSubmit();

    expect(loginSpy).not.toHaveBeenCalled();
  });

  it('onSubmit() should login, show a success toast and navigate to /dashboard', () => {
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

  it('onSubmit() should show a specific message when the server cannot be reached (status 0)', () => {
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

  it('onSubmit() should show an invalid credentials message on a 401', () => {
    const authService = TestBed.inject(AuthService);
    spyOn(authService, 'login').and.returnValue(
      throwError(() => new HttpErrorResponse({ status: 401 }))
    );

    component.loginForm.setValue({ correo: 'ana@test.com', password: 'incorrecta' });
    component.onSubmit();

    expect(component.errorMessage).toBe('Correo o contrasena incorrectos.');
  });

  it('onSubmit() should reset isLoading to false after a failed login', () => {
    const authService = TestBed.inject(AuthService);
    spyOn(authService, 'login').and.returnValue(
      throwError(() => new HttpErrorResponse({ status: 401 }))
    );

    component.loginForm.setValue({ correo: 'ana@test.com', password: 'incorrecta' });
    component.onSubmit();

    expect(component.isLoading).toBeFalse();
  });
});
