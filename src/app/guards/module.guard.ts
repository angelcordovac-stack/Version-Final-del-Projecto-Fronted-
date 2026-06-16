import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { SessionService } from '../services/session.service';
import { ToastService } from '../services/toast.service';

/**
 * Guard por rol.
 * Bloquea el acceso si el usuario no tiene un rol incluido en la lista.
 *
 * Uso:  canActivate: [roleGuard(['JEFE'])]
 */
export const roleGuard = (allowedRoles: string[]): CanActivateFn => {
  return () => {
    const session = inject(SessionService);
    const router = inject(Router);
    const toast = inject(ToastService);

    const user = session.getInfoSession();
    if (!user) {
      toast.show('Sesión inválida.', 'danger');
      router.navigate(['/login']);
      return false;
    }

    const codigoRol = user.rol?.codigo ?? '';
    if (allowedRoles.includes(codigoRol)) return true;

    toast.show('Tu rol no permite acceder a esta sección.', 'warning');
    router.navigate(['/dashboard']);
    return false;
  };
};

/**
 * Alias por compatibilidad (no se usa, pero queda por si quieres
 * verificacion por url de modulo en el futuro).
 */
export const moduleGuard = roleGuard;
