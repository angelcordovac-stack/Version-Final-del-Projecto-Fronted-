import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

import { InicioDash } from './inicio-dash';
import { IncidenciaService } from '../../services/incidencia.service';
import { SessionService } from '../../services/session.service';

describe('InicioDash', () => {
  let component: InicioDash;
  let fixture: ComponentFixture<InicioDash>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InicioDash],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    fixture = TestBed.createComponent(InicioDash);
    component = fixture.componentInstance;
  });

  it('debe crear el componente', () => {
    expect(component).toBeTruthy();
  });

  it('ngOnInit() debe calcular los totales, pendientes y solucionadas a partir de las incidencias', () => {
    const incidenciaService = TestBed.inject(IncidenciaService);
    const sessionService = TestBed.inject(SessionService);
    spyOn(sessionService, 'getInfoSession').and.returnValue({
      idUsuario: 1, nombreCompleto: 'Ana', correo: 'a@test.com', idPerfil: 1,
      rol: { codigo: 'JEFE', descripcion: 'Jefe' },
    } as any);
    spyOn(incidenciaService, 'getAll').and.returnValue(of([
      { idIncidencia: 1, estado: 'Pendiente' },
      { idIncidencia: 2, estado: 'Pendiente' },
      { idIncidencia: 3, estado: 'Solucionado' },
    ] as any));

    component.ngOnInit();

    expect(component.totalIncidencias).toBe(3);
    expect(component.pendientes).toBe(2);
    expect(component.solucionadas).toBe(1);
    expect(component.rolCodigo).toBe('JEFE');
  });

  it('ngOnInit() debe manejar una lista vacía de incidencias', () => {
    const incidenciaService = TestBed.inject(IncidenciaService);
    const sessionService = TestBed.inject(SessionService);
    spyOn(sessionService, 'getInfoSession').and.returnValue(null);
    spyOn(incidenciaService, 'getAll').and.returnValue(of([] as any));

    component.ngOnInit();

    expect(component.totalIncidencias).toBe(0);
    expect(component.pendientes).toBe(0);
    expect(component.solucionadas).toBe(0);
    expect(component.rolCodigo).toBe('');
  });

  it('los getters de rol deben permitir acceso para JEFE, TECNICO y SISTEMAS', () => {
    component.rolCodigo = 'TECNICO';
    expect(component.puedeIncidencias).toBeTrue();
    expect(component.puedeRepuestos).toBeTrue();
    expect(component.puedeDiccionario).toBeTrue();
    expect(component.esJefe).toBeFalse();
  });

  it('el getter esJefe solo debe ser verdadero para JEFE', () => {
    component.rolCodigo = 'JEFE';
    expect(component.esJefe).toBeTrue();
  });
});
