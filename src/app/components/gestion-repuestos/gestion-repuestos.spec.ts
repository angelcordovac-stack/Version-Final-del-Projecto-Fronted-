import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

import { GestionRepuestos } from './gestion-repuestos';
import { RepuestoService } from '../../services/repuesto.service';
import { IncidenciaService } from '../../services/incidencia.service';
import { SessionService } from '../../services/session.service';
import { ToastService } from '../../services/toast.service';
import { Repuesto } from '../../model/repuesto';
import { Incidencia } from '../../model/incidencia';

describe('GestionRepuestos', () => {
  let component: GestionRepuestos;
  let fixture: ComponentFixture<GestionRepuestos>;

  const repuestos: Repuesto[] = [
    { idRepuesto: 1, descripcion: 'Fuente de poder', estado: 'Solicitado' },
    { idRepuesto: 2, descripcion: 'Memoria RAM', estado: 'Entregado' },
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GestionRepuestos],
      providers: [provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    fixture = TestBed.createComponent(GestionRepuestos);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('cargar()', () => {
    it('should load the repuestos and set isLoading to false on success', () => {
      const svc = TestBed.inject(RepuestoService);
      spyOn(svc, 'getAll').and.returnValue(of(repuestos));

      component.cargar();

      expect(component.repuestos).toEqual(repuestos);
      expect(component.isLoading).toBeFalse();
    });

    it('should show a toast on error', () => {
      const svc = TestBed.inject(RepuestoService);
      const toast = TestBed.inject(ToastService);
      spyOn(svc, 'getAll').and.returnValue(throwError(() => new Error('fail')));
      const toastSpy = spyOn(toast, 'show');

      component.cargar();

      expect(toastSpy).toHaveBeenCalledWith('No se pudieron cargar los repuestos.', 'danger');
    });
  });

  describe('cargarIncidencias()', () => {
    it('should only keep pending incidencias assigned to the current technician', () => {
      const incidenciaSvc = TestBed.inject(IncidenciaService);
      const sessionService = TestBed.inject(SessionService);
      spyOn(sessionService, 'getInfoSession').and.returnValue({
        idUsuario: 7, nombreCompleto: 'Tec', correo: 't@test.com', idPerfil: 2,
      } as any);
      const todas: Incidencia[] = [
        { idIncidencia: 1, estado: 'Pendiente', idTecnicoAsignado: 7 },
        { idIncidencia: 2, estado: 'Pendiente', idTecnicoAsignado: 8 },
        { idIncidencia: 3, estado: 'Solucionado', idTecnicoAsignado: 7 },
      ];
      spyOn(incidenciaSvc, 'getAll').and.returnValue(of(todas));

      component.cargarIncidencias();

      expect(component.incidencias).toEqual([todas[0]]);
    });
  });

  describe('repuestosFiltrados', () => {
    beforeEach(() => (component.repuestos = repuestos));

    it('should return all repuestos when the filter is TODOS', () => {
      component.filtroEstado = 'TODOS';
      expect(component.repuestosFiltrados).toEqual(repuestos);
    });

    it('should filter by estado', () => {
      component.filtroEstado = 'Entregado';
      expect(component.repuestosFiltrados).toEqual([repuestos[1]]);
    });
  });

  describe('cantidad', () => {
    it('incrementarCantidad() should increase the cantidad', () => {
      component.formSolicitar.cantidad = 1;
      component.incrementarCantidad();
      expect(component.formSolicitar.cantidad).toBe(2);
    });

    it('decrementarCantidad() should not go below 1', () => {
      component.formSolicitar.cantidad = 1;
      component.decrementarCantidad();
      expect(component.formSolicitar.cantidad).toBe(1);
    });
  });

  describe('guardarSolicitar()', () => {
    it('should collect validation errors when the form is incomplete', () => {
      const svc = TestBed.inject(RepuestoService);
      const solicitarSpy = spyOn(svc, 'solicitar');

      component.formSolicitar = { idIncidencia: null, descripcion: '', cantidad: 0, urgencia: 'estandar' };
      component.guardarSolicitar();

      expect(component.erroresSolicitar.length).toBeGreaterThan(0);
      expect(solicitarSpy).not.toHaveBeenCalled();
    });

    it('should require a minimum description length of 5 characters', () => {
      component.formSolicitar = { idIncidencia: 1, descripcion: 'ab', cantidad: 1, urgencia: 'estandar' };
      component.guardarSolicitar();

      expect(component.erroresSolicitar).toContain('La descripción debe tener al menos 5 caracteres.');
    });

    it('should request the repuesto, show a success toast, close the modal and reload', () => {
      const svc = TestBed.inject(RepuestoService);
      const toast = TestBed.inject(ToastService);
      const solicitarSpy = spyOn(svc, 'solicitar').and.returnValue(of(repuestos[0]));
      spyOn(svc, 'getAll').and.returnValue(of(repuestos));
      const toastSpy = spyOn(toast, 'show');

      component.formSolicitar = { idIncidencia: 1, descripcion: 'Fuente de poder 500W', cantidad: 1, urgencia: 'estandar' };
      component.guardarSolicitar();

      expect(solicitarSpy).toHaveBeenCalledWith({ idIncidencia: 1, descripcion: 'Fuente de poder 500W' });
      expect(toastSpy).toHaveBeenCalledWith('Repuesto solicitado correctamente.', 'success');
      expect(component.showSolicitarModal).toBeFalse();
    });

    it('should map backend validation errors from err.error.campos', () => {
      const svc = TestBed.inject(RepuestoService);
      spyOn(svc, 'solicitar').and.returnValue(
        throwError(() => ({ error: { campos: { descripcion: 'Descripcion invalida' } } }))
      );

      component.formSolicitar = { idIncidencia: 1, descripcion: 'Fuente de poder', cantidad: 1, urgencia: 'estandar' };
      component.guardarSolicitar();

      expect(component.erroresSolicitar).toEqual(['Descripcion invalida']);
    });
  });

  describe('entregar()', () => {
    it('should not call the service when the user cancels the confirmation', () => {
      const svc = TestBed.inject(RepuestoService);
      const entregarSpy = spyOn(svc, 'entregar');
      spyOn(window, 'confirm').and.returnValue(false);

      component.entregar(repuestos[0]);

      expect(entregarSpy).not.toHaveBeenCalled();
    });

    it('should mark the repuesto as delivered, show a toast and reload when confirmed', () => {
      const svc = TestBed.inject(RepuestoService);
      const toast = TestBed.inject(ToastService);
      spyOn(window, 'confirm').and.returnValue(true);
      const entregarSpy = spyOn(svc, 'entregar').and.returnValue(of(repuestos[0]));
      spyOn(svc, 'getAll').and.returnValue(of(repuestos));
      const toastSpy = spyOn(toast, 'show');

      component.entregar(repuestos[0]);

      expect(entregarSpy).toHaveBeenCalledWith(1);
      expect(toastSpy).toHaveBeenCalledWith('Repuesto marcado como entregado.', 'success');
    });
  });

  describe('role getters', () => {
    it('should reflect rolCodigo correctly', () => {
      component.rolCodigo = 'TECNICO';
      expect(component.esTecnico).toBeTrue();
      expect(component.esSistemas).toBeFalse();
      expect(component.esJefe).toBeFalse();
    });
  });
});
