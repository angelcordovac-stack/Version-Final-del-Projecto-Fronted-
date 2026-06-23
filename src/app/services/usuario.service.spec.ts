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

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('getUsuarios() should GET all usuarios', () => {
    service.getUsuarios().subscribe((res) => expect(res).toEqual([usuario]));

    const req = httpMock.expectOne(baseUrl);
    expect(req.request.method).toBe('GET');
    req.flush([usuario]);
  });

  it('getUsuario() should GET a single usuario by id', () => {
    service.getUsuario(1).subscribe((res) => expect(res).toEqual(usuario));

    const req = httpMock.expectOne(`${baseUrl}/1`);
    expect(req.request.method).toBe('GET');
    req.flush(usuario);
  });

  it('registrarUsuario() should POST the payload translating password -> passwordHash', () => {
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

  it('actualizarUsuario() should PUT the payload translating password -> passwordHash', () => {
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

  it('eliminarUsuario() should DELETE the usuario by id', () => {
    service.eliminarUsuario(1).subscribe();

    const req = httpMock.expectOne(`${baseUrl}/1`);
    expect(req.request.method).toBe('DELETE');
    req.flush(null);
  });
});
