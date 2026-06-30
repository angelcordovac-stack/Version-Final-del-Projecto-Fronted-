import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';

import { UsuarioService, Usuario, UsuarioRequest } from './usuario.service';
import { environment } from '../environments/environment';

describe('UsuarioService', () => {
  let service: UsuarioService;
  let httpMock: HttpTestingController;
  const baseUrl = `${environment.url}/mantenimiento/usuarios`;

  const usuario: Usuario = {
    idUsuario: 1,
    nombreCompleto: 'Ana Lopez',
    correo: 'ana@test.com',
    idPerfil: 2,
    activo: true,
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(UsuarioService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('debe ser creado', () => {
    expect(service).toBeTruthy();
  });

  it('getUsuarios() debe obtener todos los usuarios', () => {
    service.getUsuarios().subscribe((res) => expect(res).toEqual([usuario]));

    const req = httpMock.expectOne(baseUrl);
    expect(req.request.method).toBe('GET');
    req.flush([usuario]);
  });

  it('getUsuario() debe obtener un usuario por id', () => {
    service.getUsuario(1).subscribe((res) => expect(res).toEqual(usuario));

    const req = httpMock.expectOne(`${baseUrl}/1`);
    expect(req.request.method).toBe('GET');
    req.flush(usuario);
  });

  it('registrarUsuario() debe hacer POST con la carga traduciendo password -> passwordHash', () => {
    const nuevo: UsuarioRequest = {
      nombreCompleto: 'Ana Lopez',
      correo: 'ana@test.com',
      password: 'secreta123',
      idPerfil: 2,
      activo: true,
    };

    service.registrarUsuario(nuevo).subscribe((res) => expect(res).toEqual(usuario));

    const req = httpMock.expectOne(baseUrl);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({
      nombreCompleto: 'Ana Lopez',
      correo: 'ana@test.com',
      idPerfil: 2,
      activo: true,
      passwordHash: 'secreta123',
    });
    expect(req.request.body.password).toBeUndefined();
    req.flush(usuario);
  });

  it('actualizarUsuario() debe hacer PUT con la carga traduciendo password -> passwordHash', () => {
    const editado: UsuarioRequest = {
      idUsuario: 1,
      nombreCompleto: 'Ana Lopez',
      correo: 'ana@test.com',
      password: '',
      idPerfil: 2,
      activo: false,
    };

    service.actualizarUsuario(1, editado).subscribe((res) => expect(res).toEqual(usuario));

    const req = httpMock.expectOne(`${baseUrl}/1`);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body.passwordHash).toBe('');
    expect(req.request.body.password).toBeUndefined();
    req.flush(usuario);
  });

  it('eliminarUsuario() debe eliminar el usuario por id', () => {
    service.eliminarUsuario(1).subscribe();

    const req = httpMock.expectOne(`${baseUrl}/1`);
    expect(req.request.method).toBe('DELETE');
    req.flush(null);
  });
});
