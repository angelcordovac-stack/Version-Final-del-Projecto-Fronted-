import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

import { GestionIncidencias } from './gestion-incidencias';
import { IncidenciaService } from '../../services/incidencia.service';
import { TecnicoService, TecnicoListado } from '../../services/tecnico.service';
import { SessionService } from '../../services/session.service';
import { ToastService } from '../../services/toast.service';
import { EquipoService } from '../../services/equipo.service';
import { Incidencia } from '../../model/incidencia';

describe('GestionIncidencias', () => {
  let component: GestionIncidencias;
  let fixture: ComponentFixture<GestionIncidencias>;

  const incidencias: Incidencia[] = [
    { idIncidencia: 1, codigoEquipo: 'PC-001', estado: 'Pendiente', idTecnicoAsignado: 7 },
    { idIncidencia: 2, codigoEquipo: 'PC-002', estado: 'Solucionado', idTecnicoAsignado: 8 },
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GestionIncidencias],
      providers: [provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    fixture = TestBed.createComponent(GestionIncidencias);
    component = fixture.componentInstance;
  });

  it('debe crear el componente', () => {
    expect(component).toBeTruthy();
  });

  describe('cargar()', () => {
    it('debe llamar getAll() para roles no técnicos', () => {
      const svc = TestBed.inject(IncidenciaService);
      const sessionService = TestBed.inject(SessionService);
      spyOn(sessionService, 'getInfoSession').and.returnValue({
        idUsuario: 1, nombreCompleto: 'Jefe', correo: 'j@test.com', idPerfil: 1,
        rol: { codigo: 'JEFE', descripcion: 'Jefe' },
      } as any);
      const getAllSpy = spyOn(svc, 'getAll').and.returnValue(of(incidencias));
      const getPorTecnicoSpy = spyOn(svc, 'getPorTecnico');

      component.rolCodigo = 'JEFE';
      component.cargar();

      expect(getAllSpy).toHaveBeenCalled();
      expect(getPorTecnicoSpy).not.toHaveBeenCalled();
      expect(component.incidencias).toEqual(incidencias);
      expect(component.isLoading).toBeFalse();
    });

    it('debe llamar getPorTecnico() para el rol TECNICO', () => {
      const svc = TestBed.inject(IncidenciaService);
      const sessionService = TestBed.inject(SessionService);
      spyOn(sessionService, 'getInfoSession').and.returnValue({
        idUsuario: 7, nombreCompleto: 'Tec', correo: 't@test.com', idPerfil: 2,
        rol: { codigo: 'TECNICO', descripcion: 'Técnico' },
      } as any);
      const getPorTecnicoSpy = spyOn(svc, 'getPorTecnico').and.returnValue(of(incidencias));

      component.rolCodigo = 'TECNICO';
      component.cargar();

      expect(getPorTecnicoSpy).toHaveBeenCalledWith(7);
    });

    it('debe mostrar un toast en caso de error', () => {
      const svc = TestBed.inject(IncidenciaService);
      const toast = TestBed.inject(ToastService);
      spyOn(svc, 'getAll').and.returnValue(throwError(() => new Error('fail')));
      const toastSpy = spyOn(toast, 'show');

      component.cargar();

      expect(toastSpy).toHaveBeenCalledWith('No se pudieron cargar las incidencias.', 'danger');
      expect(component.isLoading).toBeFalse();
    });
  });

  describe('incidenciasFiltradas', () => {
    beforeEach(() => (component.incidencias = incidencias));

    it('debe retornar todas las incidencias cuando el filtro es TODAS', () => {
      component.filtroEstado = 'TODAS';
      expect(component.incidenciasFiltradas).toEqual(incidencias);
    });

    it('debe filtrar por estado', () => {
      component.filtroEstado = 'Pendiente';
      expect(component.incidenciasFiltradas).toEqual([incidencias[0]]);
    });
  });

  describe('guardarCrear()', () => {
    it('debe recolectar errores de validación y no llamar al servicio cuando el formulario está incompleto', () => {
      const svc = TestBed.inject(IncidenciaService);
      const crearSpy = spyOn(svc, 'crear');

      component.nuevaIncidencia = { codigoEquipo: '', descripcionProblema: '' };
      component.guardarCrear();

      expect(component.erroresCrear.length).toBeGreaterThan(0);
      expect(crearSpy).not.toHaveBeenCalled();
    });

    it('debe requerir al menos 10 caracteres en la descripción', () => {
      component.nuevaIncidencia = { codigoEquipo: 'PC-001', descripcionProblema: 'corta' };
      component.guardarCrear();

      expect(component.erroresCrear).toContain('La descripción debe tener al menos 10 caracteres.');
    });

    it('debe rechazar descripciones de más de 500 caracteres', () => {
      component.nuevaIncidencia = { codigoEquipo: 'PC-001', descripcionProblema: 'a'.repeat(501) };
      component.guardarCrear();

      expect(component.erroresCrear).toContain('La descripción no puede superar los 500 caracteres.');
    });

    it('debe crear la incidencia, mostrar un toast, cerrar el modal y recargar', () => {
      const svc = TestBed.inject(IncidenciaService);
      const sessionService = TestBed.inject(SessionService);
      const toast = TestBed.inject(ToastService);
      spyOn(sessionService, 'getInfoSession').and.returnValue({
        idUsuario: 1, nombreCompleto: 'Ana Reportera', correo: 'a@test.com', idPerfil: 1,
      } as any);
      const crearSpy = spyOn(svc, 'crear').and.returnValue(of(incidencias[0]));
      spyOn(svc, 'getAll').and.returnValue(of(incidencias));
      const toastSpy = spyOn(toast, 'show');

      component.nuevaIncidencia = { codigoEquipo: 'PC-001', descripcionProblema: 'No prende el equipo' };
      component.guardarCrear();

      expect(crearSpy).toHaveBeenCalled();
      expect(component.nuevaIncidencia.quienRegistra).toBe('Ana Reportera');
      expect(toastSpy).toHaveBeenCalledWith('Incidencia registrada.', 'success');
      expect(component.showCrearModal).toBeFalse();
    });

    it('debe mapear los errores de validación del backend desde err.error.campos', () => {
      const svc = TestBed.inject(IncidenciaService);
      spyOn(svc, 'crear').and.returnValue(
        throwError(() => ({ error: { campos: { codigoEquipo: 'Equipo invalido' } } }))
      );

      component.nuevaIncidencia = { codigoEquipo: 'XXX', descripcionProblema: 'Descripcion larga valida' };
      component.guardarCrear();

      expect(component.erroresCrear).toEqual(['Equipo invalido']);
    });
  });

  describe('asignar()', () => {
    const tecnicos: TecnicoListado[] = [
      { idUsuario: 7, nombre: 'Luis', especialidad: 'HW', disponibilidad: true, maxIncidencias: 5 },
    ];

    it('abrirAsignar() debe cargar los técnicos disponibles y abrir el modal', () => {
      const tecnicoSvc = TestBed.inject(TecnicoService);
      spyOn(tecnicoSvc, 'getDisponibles').and.returnValue(of(tecnicos));

      component.abrirAsignar(incidencias[0]);

      expect(component.incidenciaParaAsignar).toEqual(incidencias[0]);
      expect(component.tecnicos).toEqual(tecnicos);
      expect(component.showAsignarModal).toBeTrue();
    });

    it('confirmarAsignar() debe advertir cuando no se selecciona ningún técnico', () => {
      const svc = TestBed.inject(IncidenciaService);
      const toast = TestBed.inject(ToastService);
      const asignarSpy = spyOn(svc, 'asignar');
      const toastSpy = spyOn(toast, 'show');

      component.incidenciaParaAsignar = incidencias[0];
      component.tecnicoSeleccionado = null;
      component.confirmarAsignar();

      expect(asignarSpy).not.toHaveBeenCalled();
      expect(toastSpy).toHaveBeenCalledWith('Selecciona un tecnico.', 'warning');
    });

    it('confirmarAsignar() debe asignar al técnico, mostrar un toast y recargar', () => {
      const svc = TestBed.inject(IncidenciaService);
      const toast = TestBed.inject(ToastService);
      const asignarSpy = spyOn(svc, 'asignar').and.returnValue(of(incidencias[0]));
      spyOn(svc, 'getAll').and.returnValue(of(incidencias));
      const toastSpy = spyOn(toast, 'show');

      component.incidenciaParaAsignar = incidencias[0];
      component.tecnicoSeleccionado = 7;
      component.confirmarAsignar();

      expect(asignarSpy).toHaveBeenCalledWith(1, 7);
      expect(toastSpy).toHaveBeenCalledWith('Tecnico asignado correctamente.', 'success');
      expect(component.showAsignarModal).toBeFalse();
    });
  });

  describe('solucionar()', () => {
    it('confirmarSolucionar() debe advertir cuando no se proporcionó texto de solución', () => {
      const svc = TestBed.inject(IncidenciaService);
      const solucionarSpy = spyOn(svc, 'solucionar');

      component.incidenciaParaSolucionar = incidencias[0];
      component.tipoSolucionInput = '   ';
      component.confirmarSolucionar();

      expect(solucionarSpy).not.toHaveBeenCalled();
    });

    it('confirmarSolucionar() debe marcar la incidencia como solucionada y recargar', () => {
      const svc = TestBed.inject(IncidenciaService);
      const toast = TestBed.inject(ToastService);
      const solucionarSpy = spyOn(svc, 'solucionar').and.returnValue(of(incidencias[0]));
      spyOn(svc, 'getAll').and.returnValue(of(incidencias));
      const toastSpy = spyOn(toast, 'show');

      component.incidenciaParaSolucionar = incidencias[0];
      component.tipoSolucionInput = 'Se reemplazo la fuente';
      component.confirmarSolucionar();

      expect(solucionarSpy).toHaveBeenCalledWith(1, 'Se reemplazo la fuente');
      expect(toastSpy).toHaveBeenCalledWith('Incidencia marcada como solucionada.', 'success');
      expect(component.showSolucionarModal).toBeFalse();
    });
  });

  describe('helpers', () => {
    it('getEstadoClass() debe mapear estados conocidos', () => {
      expect(component.getEstadoClass('Pendiente')).toBe('badge--warn');
      expect(component.getEstadoClass('Solucionado')).toBe('badge--success');
      expect(component.getEstadoClass('Otro')).toBe('badge--info');
    });

    it('los getters esTecnico / esJefe deben reflejar rolCodigo', () => {
      component.rolCodigo = 'TECNICO';
      expect(component.esTecnico).toBeTrue();
      expect(component.esJefe).toBeFalse();

      component.rolCodigo = 'JEFE';
      expect(component.esTecnico).toBeFalse();
      expect(component.esJefe).toBeTrue();
    });
  });
});
