import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';

import { AuthService, LoginRequest, LoginResponse, RefreshResponse } from './auth.service';
import { environment } from '../environments/environment';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;

  const loginResponse: LoginResponse = {
    token: 'fake-token',
    refreshToken: 'fake-refresh-token',
    idUsuario: 1,
    nombreCompleto: 'Juan Perez',
    correo: 'juan@test.com',
    idPerfil: 1,
    perfil: 'Jefe',
  };

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  it('debe ser creado', () => {
    expect(service).toBeTruthy();
  });

  it('debe comenzar como desautenticado cuyo no hay sesión en localStorage', () => {
    expect(service.isLoggedIn()).toBeFalse();
  });

  describe('login()', () => {
    const payload: LoginRequest = { correo: 'juan@test.com', password: '123456' };

    it('debe hacer POST a /usuarios/login con las credenciales', () => {
      service.login(payload).subscribe();

      const req = httpMock.expectOne(`${environment.url}/usuarios/login`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({ correo: payload.correo, password: payload.password });
      req.flush(loginResponse);
    });

    it('debe almacenar la sesión, token de acceso y token de actualización al tener éxito', () => {
      service.login(payload).subscribe();

      const req = httpMock.expectOne(`${environment.url}/usuarios/login`);
      req.flush(loginResponse);

      expect(JSON.parse(localStorage.getItem('user_session') || '{}')).toEqual(loginResponse);
      expect(localStorage.getItem('user_token')).toBe('fake-token');
      expect(localStorage.getItem('refresh_token')).toBe('fake-refresh-token');
    });

    it('debe establecer isLoggedIn a verdadero en un login exitoso', () => {
      service.login(payload).subscribe();

      const req = httpMock.expectOne(`${environment.url}/usuarios/login`);
      req.flush(loginResponse);

      expect(service.isLoggedIn()).toBeTrue();
    });

    it('no debe almacenar tokens si el backend no los retorna', () => {
      const sinTokens: LoginResponse = { ...loginResponse, token: undefined, refreshToken: undefined };
      service.login(payload).subscribe();

      const req = httpMock.expectOne(`${environment.url}/usuarios/login`);
      req.flush(sinTokens);

      expect(localStorage.getItem('user_token')).toBeNull();
      expect(localStorage.getItem('refresh_token')).toBeNull();
      // pero la sesion y el flag de login si se actualizan
      expect(service.isLoggedIn()).toBeTrue();
    });

    it('no debe modificar localStorage cuyo la solicitud de login falla', () => {
      service.login(payload).subscribe({ error: () => {} });

      const req = httpMock.expectOne(`${environment.url}/usuarios/login`);
      req.flush({ error: 'Credenciales invalidas' }, { status: 401, statusText: 'Unauthorized' });

      expect(localStorage.getItem('user_session')).toBeNull();
      expect(service.isLoggedIn()).toBeFalse();
    });
  });

  describe('refreshAccessToken()', () => {
    it('debe hacer POST al token de actualización y retornar los nuevos tokens', () => {
      const refreshResponse: RefreshResponse = { token: 'new-token', refreshToken: 'new-refresh' };

      service.refreshAccessToken('old-refresh').subscribe((res) => {
        expect(res).toEqual(refreshResponse);
      });

      const req = httpMock.expectOne(`${environment.url}/usuarios/refresh`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({ refreshToken: 'old-refresh' });
      req.flush(refreshResponse);
    });
  });

  describe('logout()', () => {
    it('debe notificar al backend y limpiar localStorage cuyo hay un token de actualización', () => {
      localStorage.setItem('user_session', JSON.stringify(loginResponse));
      localStorage.setItem('user_token', 'fake-token');
      localStorage.setItem('refresh_token', 'fake-refresh-token');

      service.logout();

      const req = httpMock.expectOne(`${environment.url}/usuarios/logout`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({ refreshToken: 'fake-refresh-token' });
      req.flush({});

      expect(localStorage.getItem('user_session')).toBeNull();
      expect(localStorage.getItem('user_token')).toBeNull();
      expect(localStorage.getItem('refresh_token')).toBeNull();
      expect(service.isLoggedIn()).toBeFalse();
    });

    it('no debe llamar al backend cuyo no hay token de actualización, pero debe limpiar el estado local', () => {
      localStorage.setItem('user_session', JSON.stringify(loginResponse));

      service.logout();

      httpMock.expectNone(`${environment.url}/usuarios/logout`);
      expect(localStorage.getItem('user_session')).toBeNull();
      expect(service.isLoggedIn()).toBeFalse();
    });

    it('debe ignorar los errores del backend en logout (mejor esfuerzo)', () => {
      localStorage.setItem('refresh_token', 'fake-refresh-token');

      expect(() => service.logout()).not.toThrow();

      const req = httpMock.expectOne(`${environment.url}/usuarios/logout`);
      req.flush('error', { status: 500, statusText: 'Server Error' });

      expect(service.isLoggedIn()).toBeFalse();
    });
  });
});
