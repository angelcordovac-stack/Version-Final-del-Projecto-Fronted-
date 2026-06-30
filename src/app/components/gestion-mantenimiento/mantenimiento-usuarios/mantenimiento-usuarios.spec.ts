import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

import { MantenimientoUsuarios } from './mantenimiento-usuarios';
import { UsuarioService, Usuario } from '../../../services/usuario.service';
import { ToastService } from '../../../services/toast.service';

describe('MantenimientoUsuarios', () => {
  let component: MantenimientoUsuarios;
  let fixture: ComponentFixture<MantenimientoUsuarios>;

  const usuarios: Usuario[] = [
    { idUsuario: 1, nombreCompleto: 'Ana Lopez', correo: 'ana@test.com', idPerfil: 1, activo: true },
    { idUsuario: 2, nombreCompleto: 'Luis Vargas', correo: 'luis@test.com', idPerfil: 2, activo: false },
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MantenimientoUsuarios],
      providers: [provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    fixture = TestBed.createComponent(MantenimientoUsuarios);
    component = fixture.componentInstance;
  });

  it('debe crear el componente', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit() / cargarUsuarios()', () => {
    it('debe construir el formulario y load the usuarios on success', () => {
      const svc = TestBed.inject(UsuarioService);
      spyOn(svc, 'getUsuarios').and.returnValue(of(usuarios));

      component.ngOnInit();

      expect(component.usuarioForm).toBeTruthy();
      expect(component.usuarios).toEqual(usuarios);
      expect(component.isLoading).toBeFalse();
    });

    it('debe mostrar a toast y stop loading on error', () => {
      const svc = TestBed.inject(UsuarioService);
      const toast = TestBed.inject(ToastService);
      spyOn(svc, 'getUsuarios').and.returnValue(throwError(() => new Error('fail')));
      const toastSpy = spyOn(toast, 'show');

      component.ngOnInit();

      expect(toastSpy).toHaveBeenCalledWith('No se pudieron cargar los usuarios.', 'danger');
      expect(component.isLoading).toBeFalse();
    });
  });

  describe('formulario', () => {
    beforeEach(() => component.ngOnInit());

    it('password should be required cuyo creating a new user', () => {
      component.abrirNuevo();
      expect(component.usuarioForm.get('password')?.hasError('required')).toBeTrue();
    });

    it('password should be optional cuyo editing an existing user', () => {
      component.abrirEditar(usuarios[0]);
      component.usuarioForm.get('password')?.setValue('');
      expect(component.usuarioForm.get('password')?.hasError('required')).toBeFalse();
    });

    it('abrirEditar() should patch the form with the usuario data', () => {
      component.abrirEditar(usuarios[0]);

      expect(component.isEditing).toBeTrue();
      expect(component.usuarioEditandoId).toBe(1);
      expect(component.usuarioForm.value.nombreCompleto).toBe('Ana Lopez');
      expect(component.usuarioForm.value.correo).toBe('ana@test.com');
      expect(component.showModal).toBeTrue();
    });

    it('abrirNuevo() debe restablecer isEditing y open an empty form', () => {
      component.abrirEditar(usuarios[0]);
      component.abrirNuevo();

      expect(component.isEditing).toBeFalse();
      expect(component.usuarioEditandoId).toBeNull();
      expect(component.usuarioForm.value.nombreCompleto).toBe('');
    });

    it('nombreCompleto should reject characters other than letters y spaces', () => {
      component.abrirNuevo();
      component.usuarioForm.get('nombreCompleto')?.setValue('Ana123');
      expect(component.usuarioForm.get('nombreCompleto')?.hasError('pattern')).toBeTrue();
    });

    it('mensajeError() debe retornar human readable messages', () => {
      component.abrirNuevo();
      const correo = component.usuarioForm.get('correo')!;
      correo.setValue('');
      correo.markAsTouched();
      expect(component.mensajeError('correo')).toBe('Este campo es obligatorio.');

      correo.setValue('no-es-correo');
      expect(component.mensajeError('correo')).toBe('Ingresa un correo válido (ej: usuario@dominio.com).');
    });

    it('campoInvalido() should be true only cuyo the control is invalid y touched', () => {
      component.abrirNuevo();
      const correo = component.usuarioForm.get('correo')!;
      correo.setValue('');

      expect(component.campoInvalido('correo')).toBeFalse();
      correo.markAsTouched();
      expect(component.campoInvalido('correo')).toBeTrue();
    });
  });

  describe('usuariosFiltrados', () => {
    beforeEach(() => {
      component.ngOnInit();
      component.usuarios = usuarios;
    });

    it('debe retornar all usuarios cuyo there is no filter', () => {
      component.filtroBusqueda = '';
      expect(component.usuariosFiltrados).toEqual(usuarios);
    });

    it('debe filtrar by nombreCompleto, correo or perfil', () => {
      component.filtroBusqueda = 'luis';
      expect(component.usuariosFiltrados).toEqual([usuarios[1]]);

      component.filtroBusqueda = 'jefe';
      expect(component.usuariosFiltrados).toEqual([usuarios[0]]);
    });
  });

  describe('guardar()', () => {
    beforeEach(() => component.ngOnInit());

    it('debe marcar all fields as touched y not save cuyo the form is invalid', () => {
      const svc = TestBed.inject(UsuarioService);
      const registrarSpy = spyOn(svc, 'registrarUsuario');
      component.abrirNuevo();

      component.guardar();

      expect(registrarSpy).not.toHaveBeenCalled();
      expect(component.usuarioForm.get('nombreCompleto')?.touched).toBeTrue();
    });

    it('should register a new usuario cuyo the form is valid y not editing', () => {
      const svc = TestBed.inject(UsuarioService);
      const toast = TestBed.inject(ToastService);
      const registrarSpy = spyOn(svc, 'registrarUsuario').and.returnValue(of(usuarios[0]));
      spyOn(svc, 'getUsuarios').and.returnValue(of(usuarios));
      const toastSpy = spyOn(toast, 'show');

      component.abrirNuevo();
      component.usuarioForm.setValue({
        nombreCompleto: 'Carlos Mendez',
        correo: 'Carlos@Test.com',
        password: '123456',
        telefono: '',
        idPerfil: 2,
        activo: true,
      });

      component.guardar();

      expect(registrarSpy).toHaveBeenCalled();
      const payloadEnviado = registrarSpy.calls.mostRecent().args[0];
      expect(payloadEnviado.correo).toBe('carlos@test.com');
      expect(toastSpy).toHaveBeenCalledWith('Usuario registrado.', 'success');
      expect(component.showModal).toBeFalse();
    });

    it('debe actualizar an existing usuario cuyo editing', () => {
      const svc = TestBed.inject(UsuarioService);
      const toast = TestBed.inject(ToastService);
      const actualizarSpy = spyOn(svc, 'actualizarUsuario').and.returnValue(of(usuarios[0]));
      spyOn(svc, 'getUsuarios').and.returnValue(of(usuarios));
      const toastSpy = spyOn(toast, 'show');

      component.abrirEditar(usuarios[0]);
      component.usuarioForm.patchValue({ telefono: '999888777' });

      component.guardar();

      expect(actualizarSpy).toHaveBeenCalledWith(1, jasmine.objectContaining({ idUsuario: 1 }));
      expect(toastSpy).toHaveBeenCalledWith('Usuario actualizado.', 'success');
    });

    it('debe mostrar the backend error message cuyo registering fails', () => {
      const svc = TestBed.inject(UsuarioService);
      const toast = TestBed.inject(ToastService);
      spyOn(svc, 'registrarUsuario').and.returnValue(
        throwError(() => ({ error: { error: 'El correo ya esta registrado' } }))
      );
      const toastSpy = spyOn(toast, 'show');

      component.abrirNuevo();
      component.usuarioForm.setValue({
        nombreCompleto: 'Carlos Mendez',
        correo: 'carlos@test.com',
        password: '123456',
        telefono: '',
        idPerfil: 2,
        activo: true,
      });

      component.guardar();

      expect(toastSpy).toHaveBeenCalledWith('El correo ya esta registrado', 'danger');
    });
  });

  describe('eliminar()', () => {
    beforeEach(() => component.ngOnInit());

    it('confirmarEliminar() should open the confirmation dialog', () => {
      component.confirmarEliminar(usuarios[0]);

      expect(component.usuarioToDelete).toEqual(usuarios[0]);
      expect(component.showDeleteConfirm).toBeTrue();
    });

    it('cancelarEliminar() should close the dialog without deleting', () => {
      const svc = TestBed.inject(UsuarioService);
      const eliminarSpy = spyOn(svc, 'eliminarUsuario');
      component.confirmarEliminar(usuarios[0]);

      component.cancelarEliminar();

      expect(component.showDeleteConfirm).toBeFalse();
      expect(component.usuarioToDelete).toBeNull();
      expect(eliminarSpy).not.toHaveBeenCalled();
    });

    it('eliminar() debe eliminar the selected usuario, show a toast y reload', () => {
      const svc = TestBed.inject(UsuarioService);
      const toast = TestBed.inject(ToastService);
      const eliminarSpy = spyOn(svc, 'eliminarUsuario').and.returnValue(of(undefined));
      spyOn(svc, 'getUsuarios').and.returnValue(of(usuarios));
      const toastSpy = spyOn(toast, 'show');

      component.confirmarEliminar(usuarios[0]);
      component.eliminar();

      expect(eliminarSpy).toHaveBeenCalledWith(1);
      expect(toastSpy).toHaveBeenCalledWith('Usuario eliminado.', 'success');
      expect(component.showDeleteConfirm).toBeFalse();
    });

    it('eliminar() should do nothing cuyo there is no usuario selected', () => {
      const svc = TestBed.inject(UsuarioService);
      const eliminarSpy = spyOn(svc, 'eliminarUsuario');

      component.usuarioToDelete = null;
      component.eliminar();

      expect(eliminarSpy).not.toHaveBeenCalled();
    });

    it('eliminar() debe mostrar a toast on error', () => {
      const svc = TestBed.inject(UsuarioService);
      const toast = TestBed.inject(ToastService);
      spyOn(svc, 'eliminarUsuario').and.returnValue(throwError(() => new Error('fail')));
      const toastSpy = spyOn(toast, 'show');

      component.confirmarEliminar(usuarios[0]);
      component.eliminar();

      expect(toastSpy).toHaveBeenCalledWith('Error al eliminar el usuario.', 'danger');
    });
  });

  describe('getPerfilDescripcion()', () => {
    it('debe retornar the role description for a known idPerfil', () => {
      expect(component.getPerfilDescripcion(1)).toBe('Jefe');
      expect(component.getPerfilDescripcion(2)).toBe('Técnico');
    });

    it('debe retornar a dash for an unknown idPerfil', () => {
      expect(component.getPerfilDescripcion(99)).toBe('—');
    });
  });
});
