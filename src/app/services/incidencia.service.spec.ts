import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';

import { IncidenciaService } from './incidencia.service';
import { Incidencia } from '../model/incidencia';
import { environment } from '../environments/environment';

describe('IncidenciaService', () => {
  let service: IncidenciaService;
  let httpMock: HttpTestingController;
  const baseUrl = `${environment.url}/api/incidencias`;

  const incidencia: Incidencia = {
    idIncidencia: 1,
    codigoEquipo: 'PC-001',
    descripcionProblema: 'No prende el equipo',
    estado: 'Pendiente',
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(IncidenciaService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('debe ser creado', () => {
    expect(service).toBeTruthy();
  });

  it('getAll() debe obtener todas las incidencias', () => {
    service.getAll().subscribe((res) => expect(res).toEqual([incidencia]));

    const req = httpMock.expectOne(baseUrl);
    expect(req.request.method).toBe('GET');
    req.flush([incidencia]);
  });

  it('getById() debe obtener una incidencia por id', () => {
    service.getById(1).subscribe((res) => expect(res).toEqual(incidencia));

    const req = httpMock.expectOne(`${baseUrl}/1`);
    expect(req.request.method).toBe('GET');
    req.flush(incidencia);
  });

  it('getPorTecnico() debe obtener incidencias filtradas por id de técnico', () => {
    service.getPorTecnico(7).subscribe((res) => expect(res).toEqual([incidencia]));

    const req = httpMock.expectOne(`${baseUrl}/tecnico/7`);
    expect(req.request.method).toBe('GET');
    req.flush([incidencia]);
  });

  it('crear() debe hacer POST una nueva incidencia', () => {
    const nueva: Partial<Incidencia> = { codigoEquipo: 'PC-002', descripcionProblema: 'No tiene red' };

    service.crear(nueva).subscribe((res) => expect(res).toEqual(incidencia));

    const req = httpMock.expectOne(baseUrl);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(nueva);
    req.flush(incidencia);
  });

  it('asignar() debe hacer PUT con el técnico asignado', () => {
    service.asignar(1, 7).subscribe((res) => expect(res).toEqual(incidencia));

    const req = httpMock.expectOne(`${baseUrl}/1/asignar`);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual({ idTecnico: 7 });
    req.flush(incidencia);
  });

  it('solucionar() debe hacer PUT con el tipo de solución', () => {
    service.solucionar(1, 'Se reemplazo la fuente de poder').subscribe((res) => expect(res).toEqual(incidencia));

    const req = httpMock.expectOne(`${baseUrl}/1/solucionar`);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual({ tipoSolucion: 'Se reemplazo la fuente de poder' });
    req.flush(incidencia);
  });

  it('historialEquipo() debe obtener el historial de incidencias para un equipo', () => {
    service.historialEquipo('PC-001').subscribe((res) => expect(res).toEqual([incidencia]));

    const req = httpMock.expectOne(`${baseUrl}/equipo/PC-001`);
    expect(req.request.method).toBe('GET');
    req.flush([incidencia]);
  });
});
