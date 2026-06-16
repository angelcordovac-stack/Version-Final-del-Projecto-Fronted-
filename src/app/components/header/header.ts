import { Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { SessionService } from '../../services/session.service';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './header.html',
  styleUrl: './header.scss',
})
export class Header {
  private authService = inject(AuthService);
  private sessionService = inject(SessionService);
  private toast = inject(ToastService);
  private router = inject(Router);

  // Estado del menu mobile
  menuOpen = false;

  // Estado reactivo de login (cambia automaticamente al iniciar/cerrar sesion)
  isLoggedIn = this.authService.isLoggedIn;

  // Nombre del usuario actual (puede ser null si no hay sesion)
  userName = computed(() => {
    if (!this.isLoggedIn()) return null;
    return this.sessionService.getInfoSession()?.nombreCompleto ?? 'Usuario';
  });

  logout(): void {
    this.authService.logout();
    this.toast.show('Sesion cerrada.', 'info');
    this.router.navigate(['/']);
  }
}
