import { TestBed } from '@angular/core/testing';

import { SessionService } from './session.service';

describe('SessionService', () => {
  let service: SessionService;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({});
    service = TestBed.inject(SessionService);
  });

  afterEach(() => localStorage.clear());

  it('debe ser creado', () => {
    expect(service).toBeTruthy();
  });

  it('debe retornar null cuando no hay sesión almacenada', () => {
    expect(service.getInfoSession()).toBeNull();
  });

  it('debe retornar null cuando la sesión almacenada no es JSON válido', () => {
    localStorage.setItem('user_session', '{invalid-json');
    expect(service.getInfoSession()).toBeNull();
  });

  it('debe mapear idPerfil 1 a JEFE', () => {
    localStorage.setItem(
      'user_session',
      JSON.stringify({ idUsuario: 1, nombreCompleto: 'Ana Jefa', correo: 'ana@test.com', idPerfil: 1 })
    );

    const info = service.getInfoSession();

    expect(info?.rol).toEqual({ codigo: 'JEFE', descripcion: 'Jefe' });
    expect(info?.perfil).toBe('Jefe');
  });

  it('debe mapear idPerfil 2 a TECNICO', () => {
    localStorage.setItem(
      'user_session',
      JSON.stringify({ idUsuario: 2, nombreCompleto: 'Luis Tecnico', correo: 'luis@test.com', idPerfil: 2 })
    );

    const info = service.getInfoSession();

    expect(info?.rol).toEqual({ codigo: 'TECNICO', descripcion: 'Técnico' });
  });

  it('debe mapear idPerfil 3 a SISTEMAS', () => {
    localStorage.setItem(
      'user_session',
      JSON.stringify({ idUsuario: 3, nombreCompleto: 'Sara Sistemas', correo: 'sara@test.com', idPerfil: 3 })
    );

    const info = service.getInfoSession();

    expect(info?.rol).toEqual({ codigo: 'SISTEMAS', descripcion: 'Sistemas' });
  });

  it('debe retroceder a un rol UNKNOWN para un idPerfil no reconocido', () => {
    localStorage.setItem(
      'user_session',
      JSON.stringify({ idUsuario: 9, nombreCompleto: 'Sin Rol', correo: 'x@test.com', idPerfil: 99 })
    );

    const info = service.getInfoSession();

    expect(info?.rol).toEqual({ codigo: 'UNKNOWN', descripcion: 'Sin rol' });
    expect(info?.perfil).toBe('Perfil 99');
  });

  it('debe exponer campos compatibles hacia atrás (names / personaId)', () => {
    localStorage.setItem(
      'user_session',
      JSON.stringify({ idUsuario: 5, nombreCompleto: 'Carlos Mendez', correo: 'carlos@test.com', idPerfil: 1 })
    );

    const info = service.getInfoSession();

    expect(info?.names).toBe('Carlos Mendez');
    expect(info?.personaId).toBe('5');
  });
});
