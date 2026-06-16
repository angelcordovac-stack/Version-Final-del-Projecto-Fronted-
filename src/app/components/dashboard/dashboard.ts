import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { SessionService, UserSesion } from '../../services/session.service';
import { AuthService } from '../../services/auth.service';
import { ToastService } from '../../services/toast.service';

interface MenuItem {
  label: string;
  icon: string;
  url: string;
  roles: string[];
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class Dashboard implements OnInit {
  private sessionService = inject(SessionService);
  private authService = inject(AuthService);
  private toast = inject(ToastService);
  private router = inject(Router);

  user: UserSesion | null = null;
  menuItems: MenuItem[] = [];

  private readonly STATIC_MENU: MenuItem[] = [
    { label: 'Inicio',          icon: '📊', url: '/dashboard',                       roles: ['JEFE', 'TECNICO', 'SISTEMAS'] },
    { label: 'Incidencias',     icon: '🛠️', url: '/dashboard/GestionIncidencias',    roles: ['JEFE', 'TECNICO', 'SISTEMAS'] },
    { label: 'Repuestos',       icon: '📦', url: '/dashboard/GestionRepuestos',      roles: ['TECNICO'] },
    { label: 'Diccionario',     icon: '📖', url: '/dashboard/DiccionarioFallas',     roles: ['JEFE', 'TECNICO', 'SISTEMAS'] },
    { label: 'Mantenimiento',   icon: '🔐', url: '/dashboard/MantenimientoUsuarios', roles: ['JEFE'] },
  ];

  ngOnInit(): void {
    this.user = this.sessionService.getInfoSession();
    this.construirMenu();
  }

  construirMenu(): void {
    const codigoRol = this.user?.rol?.codigo ?? '';
    this.menuItems = this.STATIC_MENU.filter(item => item.roles.includes(codigoRol));
  }

  get userName(): string {
    return this.user?.names ?? 'Usuario';
  }

  get perfilLabel(): string {
    return this.user?.rol?.descripcion ?? this.user?.rol?.codigo ?? '';
  }

  logout(): void {
    this.authService.logout();
    this.toast.show('Sesión cerrada.', 'info');
    this.router.navigate(['/login']);
  }
}