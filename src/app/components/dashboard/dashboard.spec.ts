import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

import { Dashboard } from './dashboard';
import { SessionService, UserSesion } from '../../services/session.service';
import { AuthService } from '../../services/auth.service';
import { ToastService } from '../../services/toast.service';

describe('Dashboard', () => {
  let component: Dashboard;
  let fixture: ComponentFixture<Dashboard>;

  const usuarioJefe: UserSesion = {
    idUsuario: 1,
    nombreCompleto: 'Ana Jefa',
    correo: 'ana@test.com',
    idPerfil: 1,
    names: 'Ana Jefa',
    rol: { codigo: 'JEFE', descripcion: 'Jefe' },
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Dashboard],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    fixture = TestBed.createComponent(Dashboard);
    component = fixture.componentInstance;
  });

  it('debe crear el componente', () => {
    expect(component).toBeTruthy();
  });

  it('ngOnInit() debe cargar el usuario y construir el menú para un JEFE', () => {
    const sessionService = TestBed.inject(SessionService);
    spyOn(sessionService, 'getInfoSession').and.returnValue(usuarioJefe);

    component.ngOnInit();

    expect(component.user).toEqual(usuarioJefe);
    expect(component.menuItems.length).toBe(5);
    expect(component.menuItems.some((m) => m.label === 'Mantenimiento')).toBeTrue();
  });

  it('ngOnInit() debe ocultar el ítem de menú Mantenimiento para un TECNICO', () => {
    const sessionService = TestBed.inject(SessionService);
    spyOn(sessionService, 'getInfoSession').and.returnValue({
      ...usuarioJefe,
      rol: { codigo: 'TECNICO', descripcion: 'Técnico' },
    });

    component.ngOnInit();

    expect(component.menuItems.some((m) => m.label === 'Mantenimiento')).toBeFalse();
    expect(component.menuItems.length).toBe(4);
  });

  it('ngOnInit() debe construir un menú vacío cuando no hay sesión', () => {
    const sessionService = TestBed.inject(SessionService);
    spyOn(sessionService, 'getInfoSession').and.returnValue(null);

    component.ngOnInit();

    expect(component.user).toBeNull();
    expect(component.menuItems).toEqual([]);
  });

  it('el getter userName debe usar "Usuario" como valor por defecto cuando no hay usuario', () => {
    expect(component.userName).toBe('Usuario');
  });

  it('el getter userName debe retornar el nombre del usuario cuando está disponible', () => {
    const sessionService = TestBed.inject(SessionService);
    spyOn(sessionService, 'getInfoSession').and.returnValue(usuarioJefe);
    component.ngOnInit();

    expect(component.userName).toBe('Ana Jefa');
  });

  it('el getter perfilLabel debe retornar la descripción del rol', () => {
    const sessionService = TestBed.inject(SessionService);
    spyOn(sessionService, 'getInfoSession').and.returnValue(usuarioJefe);
    component.ngOnInit();

    expect(component.perfilLabel).toBe('Jefe');
  });

  it('logout() debe llamar AuthService.logout(), mostrar un toast y navegar a /login', () => {
    const authService = TestBed.inject(AuthService);
    const toastService = TestBed.inject(ToastService);
    const router = TestBed.inject(Router);

    const logoutSpy = spyOn(authService, 'logout');
    const toastSpy = spyOn(toastService, 'show');
    const navigateSpy = spyOn(router, 'navigate');

    component.logout();

    expect(logoutSpy).toHaveBeenCalled();
    expect(toastSpy).toHaveBeenCalledWith('Sesión cerrada.', 'info');
    expect(navigateSpy).toHaveBeenCalledWith(['/login']);
  });
});
