import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

import { DiccionarioFallas } from './diccionario-fallas';
import { DiccionarioFallasService, DiccionarioFalla } from '../../services/diccionario-fallas.service';
import { SessionService } from '../../services/session.service';
import { ToastService } from '../../services/toast.service';

describe('DiccionarioFallas', () => {
  let component: DiccionarioFallas;
  let fixture: ComponentFixture<DiccionarioFallas>;

  const fallas: DiccionarioFalla[] = [
    { idFalla: 1, problemaComun: 'Pantalla azul', solucionSugerida: 'Actualizar drivers', estado: 'RESUELTO' },
    { idFalla: 2, problemaComun: 'No conecta a wifi', solucionSugerida: 'Reiniciar router', estado: 'CRITICO' },
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DiccionarioFallas],
      providers: [provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    fixture = TestBed.createComponent(DiccionarioFallas);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('cargar()', () => {
    it('should load the fallas and set isLoading to false on success', () => {
      const svc = TestBed.inject(DiccionarioFallasService);
      spyOn(svc, 'getAll').and.returnValue(of(fallas));

      component.cargar();

      expect(component.fallas).toEqual(fallas);
      expect(component.isLoading).toBeFalse();
    });

    it('should show a toast and set isLoading to false on error', () => {
      const svc = TestBed.inject(DiccionarioFallasService);
      const toast = TestBed.inject(ToastService);
      spyOn(svc, 'getAll').and.returnValue(throwError(() => new Error('fail')));
      const toastSpy = spyOn(toast, 'show');

      component.cargar();

      expect(toastSpy).toHaveBeenCalledWith('No se pudieron cargar las fallas.', 'danger');
      expect(component.isLoading).toBeFalse();
    });
  });

  describe('fallasFiltradas', () => {
    beforeEach(() => {
      component.fallas = fallas;
    });

    it('should return all fallas when there is no search term', () => {
      component.busqueda = '';
      expect(component.fallasFiltradas).toEqual(fallas);
    });

    it('should filter by problemaComun (case insensitive)', () => {
      component.busqueda = 'PANTALLA';
      expect(component.fallasFiltradas).toEqual([fallas[0]]);
    });

    it('should filter by solucionSugerida', () => {
      component.busqueda = 'router';
      expect(component.fallasFiltradas).toEqual([fallas[1]]);
    });

    it('should filter by the estado label', () => {
      component.busqueda = 'crítico';
      expect(component.fallasFiltradas).toEqual([fallas[1]]);
    });
  });

  describe('modal de nueva falla', () => {
    it('abrirNueva() should reset the form and open the modal', () => {
      component.formData = { problemaComun: 'algo', solucionSugerida: 'algo', estado: 'RESUELTO' };
      component.abrirNueva();

      expect(component.showModal).toBeTrue();
      expect(component.formData.problemaComun).toBe('');
      expect(component.formData.solucionSugerida).toBe('');
    });

    it('cerrarModal() should close the modal', () => {
      component.showModal = true;
      component.guardando = true;

      component.cerrarModal();

      expect(component.showModal).toBeFalse();
      expect(component.guardando).toBeFalse();
    });
  });

  describe('guardar()', () => {
    it('should warn and not call the service when problemaComun is empty', () => {
      const svc = TestBed.inject(DiccionarioFallasService);
      const registrarSpy = spyOn(svc, 'registrar');

      component.formData = { problemaComun: '', solucionSugerida: 'algo', estado: 'RESUELTO' };
      component.guardar();

      expect(registrarSpy).not.toHaveBeenCalled();
      expect(component.erroresForm.length).toBeGreaterThan(0);
    });

    it('should warn and not call the service when estado is missing', () => {
      const svc = TestBed.inject(DiccionarioFallasService);
      const registrarSpy = spyOn(svc, 'registrar');

      component.formData = { problemaComun: 'algo', solucionSugerida: 'una solucion', estado: '' };
      component.guardar();

      expect(registrarSpy).not.toHaveBeenCalled();
    });

    it('should register the falla, show a success toast, close the modal and reload', () => {
      const svc = TestBed.inject(DiccionarioFallasService);
      const sessionService = TestBed.inject(SessionService);
      const toast = TestBed.inject(ToastService);
      spyOn(sessionService, 'getInfoSession').and.returnValue({
        idUsuario: 9, nombreCompleto: 'Tec', correo: 't@test.com', idPerfil: 2,
      } as any);
      const registrarSpy = spyOn(svc, 'registrar').and.returnValue(of(fallas[0]));
      spyOn(svc, 'getAll').and.returnValue(of(fallas));
      const toastSpy = spyOn(toast, 'show');

      component.formData = { problemaComun: 'Problema de prueba', solucionSugerida: 'Una solucion de prueba', estado: 'EN_CURSO' };
      component.guardar();

      expect(registrarSpy).toHaveBeenCalled();
      expect(component.formData.idAutor).toBe(9);
      expect(toastSpy).toHaveBeenCalledWith('Falla registrada correctamente.', 'success');
      expect(component.showModal).toBeFalse();
      expect(component.guardando).toBeFalse();
    });

    it('should show the backend error message and stop saving on error', () => {
      const svc = TestBed.inject(DiccionarioFallasService);
      const sessionService = TestBed.inject(SessionService);
      const toast = TestBed.inject(ToastService);
      spyOn(sessionService, 'getInfoSession').and.returnValue(null);
      spyOn(svc, 'registrar').and.returnValue(
        throwError(() => ({ error: { error: 'Ya existe esa falla' } }))
      );
      const toastSpy = spyOn(toast, 'show');

      component.formData = { problemaComun: 'Problema de prueba', solucionSugerida: 'Una solucion de prueba', estado: 'EN_CURSO' };
      component.guardar();

      expect(toastSpy).toHaveBeenCalledWith('Ya existe esa falla', 'danger');
      expect(component.guardando).toBeFalse();
    });

    it('should not call the service twice while a save is already in progress', () => {
      const svc = TestBed.inject(DiccionarioFallasService);
      const registrarSpy = spyOn(svc, 'registrar');
      component.guardando = true;

      component.formData = { problemaComun: 'algo', solucionSugerida: 'una solucion', estado: 'EN_CURSO' };
      component.guardar();

      expect(registrarSpy).not.toHaveBeenCalled();
    });
  });

  describe('helpers de presentación', () => {
    it('puedeAgregar should be true for TECNICO and SISTEMAS', () => {
      component.rolCodigo = 'TECNICO';
      expect(component.puedeAgregar).toBeTrue();
      component.rolCodigo = 'SISTEMAS';
      expect(component.puedeAgregar).toBeTrue();
      component.rolCodigo = 'JEFE';
      expect(component.puedeAgregar).toBeFalse();
    });

    it('estadoLabel() should map known states and fall back for unknown ones', () => {
      expect(component.estadoLabel('CRITICO')).toBe('Crítico');
      expect(component.estadoLabel('RESUELTO')).toBe('Resuelto');
      expect(component.estadoLabel(undefined)).toBe('Sin estado');
    });

    it('estadoClass() and cardAccentClass() should map known states', () => {
      expect(component.estadoClass('CRITICO')).toBe('dic__badge--red');
      expect(component.estadoClass('RESUELTO')).toBe('dic__badge--green');
      expect(component.cardAccentClass('MANTENIMIENTO')).toBe('dic__card--accent-yellow');
      expect(component.cardAccentClass(undefined)).toBe('dic__card--accent-blue');
    });

    it('indiceReal() should return the position of the falla in the unfiltered list', () => {
      component.fallas = fallas;
      expect(component.indiceReal(fallas[1])).toBe(1);
    });
  });

  describe('detalle', () => {
    it('abrirDetalle() / cerrarDetalle() should toggle the selected falla', () => {
      component.abrirDetalle(fallas[0]);
      expect(component.showDetalle).toBeTrue();
      expect(component.fallaSeleccionada).toEqual(fallas[0]);

      component.cerrarDetalle();
      expect(component.showDetalle).toBeFalse();
      expect(component.fallaSeleccionada).toBeNull();
    });
  });
});
