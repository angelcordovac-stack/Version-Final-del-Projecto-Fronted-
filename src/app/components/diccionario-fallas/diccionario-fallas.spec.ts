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

  it('debe crear el componente', () => {
    expect(component).toBeTruthy();
  });

  describe('cargar()', () => {
    it('debe cargar las fallas y poner isLoading en falso al tener éxito', () => {
      const svc = TestBed.inject(DiccionarioFallasService);
      spyOn(svc, 'getAll').and.returnValue(of(fallas));

      component.cargar();

      expect(component.fallas).toEqual(fallas);
      expect(component.isLoading).toBeFalse();
    });

    it('debe mostrar un toast y poner isLoading en falso en caso de error', () => {
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

    it('debe retornar todas las fallas cuando no hay término de búsqueda', () => {
      component.busqueda = '';
      expect(component.fallasFiltradas).toEqual(fallas);
    });

    it('debe filtrar por problemaComun (sin distinguir mayúsculas/minúsculas)', () => {
      component.busqueda = 'PANTALLA';
      expect(component.fallasFiltradas).toEqual([fallas[0]]);
    });

    it('debe filtrar por solucionSugerida', () => {
      component.busqueda = 'router';
      expect(component.fallasFiltradas).toEqual([fallas[1]]);
    });

    it('debe filtrar por la etiqueta de estado', () => {
      component.busqueda = 'crítico';
      expect(component.fallasFiltradas).toEqual([fallas[1]]);
    });
  });

  describe('modal de nueva falla', () => {
    it('abrirNueva() debe restablecer el formulario y abrir el modal', () => {
      component.formData = { problemaComun: 'algo', solucionSugerida: 'algo', estado: 'RESUELTO' };
      component.abrirNueva();

      expect(component.showModal).toBeTrue();
      expect(component.formData.problemaComun).toBe('');
      expect(component.formData.solucionSugerida).toBe('');
    });

    it('cerrarModal() debe cerrar el modal', () => {
      component.showModal = true;
      component.guardando = true;

      component.cerrarModal();

      expect(component.showModal).toBeFalse();
      expect(component.guardando).toBeFalse();
    });
  });

  describe('guardar()', () => {
    it('debe advertir y no llamar al servicio cuando problemaComun está vacío', () => {
      const svc = TestBed.inject(DiccionarioFallasService);
      const registrarSpy = spyOn(svc, 'registrar');

      component.formData = { problemaComun: '', solucionSugerida: 'algo', estado: 'RESUELTO' };
      component.guardar();

      expect(registrarSpy).not.toHaveBeenCalled();
      expect(component.erroresForm.length).toBeGreaterThan(0);
    });

    it('debe advertir y no llamar al servicio cuando falta el estado', () => {
      const svc = TestBed.inject(DiccionarioFallasService);
      const registrarSpy = spyOn(svc, 'registrar');

      component.formData = { problemaComun: 'algo', solucionSugerida: 'una solucion', estado: '' };
      component.guardar();

      expect(registrarSpy).not.toHaveBeenCalled();
    });

    it('debe registrar la falla, mostrar un toast de éxito, cerrar el modal y recargar', () => {
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

    it('debe mostrar el mensaje de error del backend y detener el guardado en caso de error', () => {
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

    it('no debe llamar al servicio dos veces mientras un guardado ya está en curso', () => {
      const svc = TestBed.inject(DiccionarioFallasService);
      const registrarSpy = spyOn(svc, 'registrar');
      component.guardando = true;

      component.formData = { problemaComun: 'algo', solucionSugerida: 'una solucion', estado: 'EN_CURSO' };
      component.guardar();

      expect(registrarSpy).not.toHaveBeenCalled();
    });
  });

  describe('helpers de presentación', () => {
    it('puedeAgregar debe ser verdadero para TECNICO y SISTEMAS', () => {
      component.rolCodigo = 'TECNICO';
      expect(component.puedeAgregar).toBeTrue();
      component.rolCodigo = 'SISTEMAS';
      expect(component.puedeAgregar).toBeTrue();
      component.rolCodigo = 'JEFE';
      expect(component.puedeAgregar).toBeFalse();
    });

    it('estadoLabel() debe mapear estados conocidos y usar un valor por defecto para los desconocidos', () => {
      expect(component.estadoLabel('CRITICO')).toBe('Crítico');
      expect(component.estadoLabel('RESUELTO')).toBe('Resuelto');
      expect(component.estadoLabel(undefined)).toBe('Sin estado');
    });

    it('estadoClass() y cardAccentClass() deben mapear estados conocidos', () => {
      expect(component.estadoClass('CRITICO')).toBe('dic__badge--red');
      expect(component.estadoClass('RESUELTO')).toBe('dic__badge--green');
      expect(component.cardAccentClass('MANTENIMIENTO')).toBe('dic__card--accent-yellow');
      expect(component.cardAccentClass(undefined)).toBe('dic__card--accent-blue');
    });

    it('indiceReal() debe retornar la posición de la falla en la lista sin filtrar', () => {
      component.fallas = fallas;
      expect(component.indiceReal(fallas[1])).toBe(1);
    });
  });

  describe('detalle', () => {
    it('abrirDetalle() / cerrarDetalle() deben alternar la falla seleccionada', () => {
      component.abrirDetalle(fallas[0]);
      expect(component.showDetalle).toBeTrue();
      expect(component.fallaSeleccionada).toEqual(fallas[0]);

      component.cerrarDetalle();
      expect(component.showDetalle).toBeFalse();
      expect(component.fallaSeleccionada).toBeNull();
    });
  });
});
