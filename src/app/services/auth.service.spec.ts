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

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should start as logged out when there is no session in localStorage', () => {
    expect(service.isLoggedIn()).toBeFalse();
  });

  describe('login()', () => {
    const payload: LoginRequest = { correo: 'juan@test.com', password: '123456' };

    it('should POST to /usuarios/login with the credentials', () => {
      service.login(payload).subscribe();

      const req = httpMock.expectOne(`${environment.url}/usuarios/login`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({ correo: payload.correo, password: payload.password });
      req.flush(loginResponse);
    });

    it('should store the session, access token and refresh token on success', () => {
      service.login(payload).subscribe();

      const req = httpMock.expectOne(`${environment.url}/usuarios/login`);
      req.flush(loginResponse);

      expect(JSON.parse(localStorage.getItem('user_session') || '{}')).toEqual(loginResponse);
      expect(localStorage.getItem('user_token')).toBe('fake-token');
      expect(localStorage.getItem('refresh_token')).toBe('fake-refresh-token');
    });

    it('should set isLoggedIn to true on a successful login', () => {
      service.login(payload).subscribe();

      const req = httpMock.expectOne(`${environment.url}/usuarios/login`);
      req.flush(loginResponse);

      expect(service.isLoggedIn()).toBeTrue();
    });

    it('should not store tokens if the backend does not return them', () => {
      const sinTokens: LoginResponse = { ...loginResponse, token: undefined, refreshToken: undefined };
      service.login(payload).subscribe();

      const req = httpMock.expectOne(`${environment.url}/usuarios/login`);
      req.flush(sinTokens);

      expect(localStorage.getItem('user_token')).toBeNull();
      expect(localStorage.getItem('refresh_token')).toBeNull();
      // pero la sesion y el flag de login si se actualizan
      expect(service.isLoggedIn()).toBeTrue();
    });

    it('should not modify localStorage when the login request fails', () => {
      service.login(payload).subscribe({ error: () => {} });

      const req = httpMock.expectOne(`${environment.url}/usuarios/login`);
      req.flush({ error: 'Credenciales invalidas' }, { status: 401, statusText: 'Unauthorized' });

      expect(localStorage.getItem('user_session')).toBeNull();
      expect(service.isLoggedIn()).toBeFalse();
    });
  });

  describe('refreshAccessToken()', () => {
    it('should POST the refresh token and return the new tokens', () => {
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
    it('should notify the backend and clear localStorage when there is a refresh token', () => {
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

    it('should not call the backend when there is no refresh token, but should still clear local state', () => {
      localStorage.setItem('user_session', JSON.stringify(loginResponse));

      service.logout();

      httpMock.expectNone(`${environment.url}/usuarios/logout`);
      expect(localStorage.getItem('user_session')).toBeNull();
      expect(service.isLoggedIn()).toBeFalse();
    });

    it('should swallow backend errors on logout (best-effort)', () => {
      localStorage.setItem('refresh_token', 'fake-refresh-token');

      expect(() => service.logout()).not.toThrow();

      const req = httpMock.expectOne(`${environment.url}/usuarios/logout`);
      req.flush('error', { status: 500, statusText: 'Server Error' });

      expect(service.isLoggedIn()).toBeFalse();
    });
  });
});
