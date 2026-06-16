import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { ToastService } from '../services/toast.service';

/**
 * Bloquea rutas si el usuario no tiene sesión iniciada.
 * Si no hay token válido, redirige a /login.
 */
export const authGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const toast = inject(ToastService);

  if (auth.isLoggedIn()) return true;

  toast.show('Debes iniciar sesión para acceder.', 'warning');
  router.navigate(['/login']);
  return false;
};
