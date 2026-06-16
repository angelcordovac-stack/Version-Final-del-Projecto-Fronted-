import { HttpInterceptorFn } from '@angular/common/http';

/**
 * Interceptor que agrega el token JWT a todas las peticiones HTTP
 * (excepto a /usuarios/login que no lo necesita).
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token = localStorage.getItem('user_token');

  // No agregar token a la peticion de login
  if (req.url.includes('/usuarios/login')) {
    return next(req);
  }

  if (token) {
    const authReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
      },
    });
    return next(authReq);
  }

  return next(req);
};
