import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';

import { authInterceptor } from './auth.interceptor';
import { AuthService } from '../services/auth.service';
import { environment } from '../environments/environment';

describe('authInterceptor', () => {
  let http: HttpClient;
  let httpMock: HttpTestingController;
  let routerSpy: jasmine.SpyObj<Router>;

  beforeEach(() => {
    localStorage.clear();
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([authInterceptor])),
        provideHttpClientTesting(),
        { provide: Router, useValue: routerSpy },
      ],
    });

    http = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  it('debe adjuntar el encabezado Authorization cuyo hay un token', () => {
    localStorage.setItem('user_token', 'mi-token');

    http.get(`${environment.url}/api/incidencias`).subscribe();

    const req = httpMock.expectOne(`${environment.url}/api/incidencias`);
    expect(req.request.headers.get('Authorization')).toBe('Bearer mi-token');
    req.flush([]);
  });

  it('no debe adjuntar un encabezado Authorization cuyo no hay token', () => {
    http.get(`${environment.url}/api/incidencias`).subscribe();

    const req = httpMock.expectOne(`${environment.url}/api/incidencias`);
    expect(req.request.headers.has('Authorization')).toBeFalse();
    req.flush([]);
  });

  it('no debe adjuntar un token en puntos finales públicos (login)', () => {
    localStorage.setItem('user_token', 'mi-token');

    http.post(`${environment.url}/usuarios/login`, {}).subscribe();

    const req = httpMock.expectOne(`${environment.url}/usuarios/login`);
    expect(req.request.headers.has('Authorization')).toBeFalse();
    req.flush({});
  });

  it('debe actualizar el token e intentar nuevamente la solicitud después de un 401', () => {
    localStorage.setItem('user_token', 'token-vencido');
    localStorage.setItem('refresh_token', 'mi-refresh');

    http.get(`${environment.url}/api/incidencias`).subscribe();

    const primeraReq = httpMock.expectOne(`${environment.url}/api/incidencias`);
    primeraReq.flush('Unauthorized', { status: 401, statusText: 'Unauthorized' });

    const refreshReq = httpMock.expectOne(`${environment.url}/usuarios/refresh`);
    expect(refreshReq.request.body).toEqual({ refreshToken: 'mi-refresh' });
    refreshReq.flush({ token: 'token-nuevo', refreshToken: 'refresh-nuevo' });

    const reintento = httpMock.expectOne(`${environment.url}/api/incidencias`);
    expect(reintento.request.headers.get('Authorization')).toBe('Bearer token-nuevo');
    reintento.flush([]);

    expect(localStorage.getItem('user_token')).toBe('token-nuevo');
    expect(localStorage.getItem('refresh_token')).toBe('refresh-nuevo');
    expect(routerSpy.navigate).not.toHaveBeenCalled();
  });

  it('debe cerrar sesión y redirigir a /login cuando no hay token de actualización y ocurre un 401', () => {
    localStorage.setItem('user_token', 'token-vencido');

    http.get(`${environment.url}/api/incidencias`).subscribe({ error: () => {} });

    const req = httpMock.expectOne(`${environment.url}/api/incidencias`);
    req.flush('Unauthorized', { status: 401, statusText: 'Unauthorized' });

    expect(localStorage.getItem('user_token')).toBeNull();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/login']);
  });

  it('debe cerrar sesión y redirigir a /login cuando la solicitud de actualización falla', () => {
    localStorage.setItem('user_token', 'token-vencido');
    localStorage.setItem('refresh_token', 'refresh-vencido');

    http.get(`${environment.url}/api/incidencias`).subscribe({ error: () => {} });

    const primeraReq = httpMock.expectOne(`${environment.url}/api/incidencias`);
    primeraReq.flush('Unauthorized', { status: 401, statusText: 'Unauthorized' });

    const refreshReq = httpMock.expectOne(`${environment.url}/usuarios/refresh`);
    refreshReq.flush('Unauthorized', { status: 401, statusText: 'Unauthorized' });

    // logout() hace un best-effort POST al backend para revocar el refresh token.
    const logoutReq = httpMock.expectOne(`${environment.url}/usuarios/logout`);
    logoutReq.flush({});

    expect(localStorage.getItem('refresh_token')).toBeNull();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/login']);
  });

  it('debe propagar errores no-401 sin intentar actualizar el token', () => {
    let errorRecibido: any = null;

    http.get(`${environment.url}/api/incidencias`).subscribe({
      error: (err) => (errorRecibido = err),
    });

    const req = httpMock.expectOne(`${environment.url}/api/incidencias`);
    req.flush('Server error', { status: 500, statusText: 'Internal Server Error' });

    httpMock.expectNone(`${environment.url}/usuarios/refresh`);
    expect(errorRecibido?.status).toBe(500);
  });
});
