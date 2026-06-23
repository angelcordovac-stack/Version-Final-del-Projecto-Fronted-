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

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should return null when there is no session stored', () => {
    expect(service.getInfoSession()).toBeNull();
  });

  it('should return null when the stored session is not valid JSON', () => {
    localStorage.setItem('user_session', '{invalid-json');
    expect(service.getInfoSession()).toBeNull();
  });

  it('should map idPerfil 1 to JEFE', () => {
    localStorage.setItem(
      'user_session',
      JSON.stringify({ idUsuario: 1, nombreCompleto: 'Ana Jefa', correo: 'ana@test.com', idPerfil: 1 })
    );

    const info = service.getInfoSession();

    expect(info?.rol).toEqual({ codigo: 'JEFE', descripcion: 'Jefe' });
    expect(info?.perfil).toBe('Jefe');
  });

  it('should map idPerfil 2 to TECNICO', () => {
    localStorage.setItem(
      'user_session',
      JSON.stringify({ idUsuario: 2, nombreCompleto: 'Luis Tecnico', correo: 'luis@test.com', idPerfil: 2 })
    );

    const info = service.getInfoSession();

    expect(info?.rol).toEqual({ codigo: 'TECNICO', descripcion: 'Técnico' });
  });

  it('should map idPerfil 3 to SISTEMAS', () => {
    localStorage.setItem(
      'user_session',
      JSON.stringify({ idUsuario: 3, nombreCompleto: 'Sara Sistemas', correo: 'sara@test.com', idPerfil: 3 })
    );

    const info = service.getInfoSession();

    expect(info?.rol).toEqual({ codigo: 'SISTEMAS', descripcion: 'Sistemas' });
  });

  it('should fall back to an UNKNOWN role for an unrecognized idPerfil', () => {
    localStorage.setItem(
      'user_session',
      JSON.stringify({ idUsuario: 9, nombreCompleto: 'Sin Rol', correo: 'x@test.com', idPerfil: 99 })
    );

    const info = service.getInfoSession();

    expect(info?.rol).toEqual({ codigo: 'UNKNOWN', descripcion: 'Sin rol' });
    expect(info?.perfil).toBe('Perfil 99');
  });

  it('should expose backwards-compatible fields (names / personaId)', () => {
    localStorage.setItem(
      'user_session',
      JSON.stringify({ idUsuario: 5, nombreCompleto: 'Carlos Mendez', correo: 'carlos@test.com', idPerfil: 1 })
    );

    const info = service.getInfoSession();

    expect(info?.names).toBe('Carlos Mendez');
    expect(info?.personaId).toBe('5');
  });
});
