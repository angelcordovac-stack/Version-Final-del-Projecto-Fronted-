import {
  HttpInterceptorFn,
  HttpRequest,
  HttpHandlerFn,
  HttpErrorResponse,
} from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, switchMap, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';

/** Endpoints que nunca necesitan token. */
const PUBLIC_URLS = ['/usuarios/login', '/usuarios/refresh'];

/**
 * Interceptor de Access Token + Refresh Token.
 *
 * 1. Agrega el Bearer token a todas las peticiones privadas.
 * 2. Si el backend devuelve 401 (token expirado), intenta renovar el
 *    access token usando el refresh token guardado en localStorage.
 * 3. Si el refresco también falla (refresh expirado o revocado),
 *    fuerza el logout y redirige al login.
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const esPublico = PUBLIC_URLS.some((url) => req.url.includes(url));

  if (esPublico) {
    return next(req);
  }

  const requestConToken = agregarToken(req);

  return next(requestConToken).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status !== 401) {
        return throwError(() => error);
      }

      // --- Access Token expirado: intentar refrescar ---
      const refreshToken = localStorage.getItem('refresh_token');

      if (!refreshToken) {
        // No hay refresh token: logout directo
        authService.logout();
        router.navigate(['/login']);
        return throwError(() => error);
      }

      return authService.refreshAccessToken(refreshToken).pipe(
        switchMap((nuevosTokens) => {
          // Guardar nuevos tokens
          localStorage.setItem('user_token', nuevosTokens.token);
          localStorage.setItem('refresh_token', nuevosTokens.refreshToken);

          // Reintentar la petición original con el nuevo access token
          const retryReq = req.clone({
            setHeaders: { Authorization: `Bearer ${nuevosTokens.token}` },
          });
          return next(retryReq);
        }),
        catchError((refreshError) => {
          // Refresh también falló: sesión expirada, forzar logout
          authService.logout();
          router.navigate(['/login']);
          return throwError(() => refreshError);
        })
      );
    })
  );
};

function agregarToken(req: HttpRequest<unknown>): HttpRequest<unknown> {
  const token = localStorage.getItem('user_token');
  if (!token) return req;
  return req.clone({
    setHeaders: { Authorization: `Bearer ${token}` },
  });
}
