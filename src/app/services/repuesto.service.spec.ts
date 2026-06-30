import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';

import { RepuestoService } from './repuesto.service';
import { Repuesto } from '../model/repuesto';
import { environment } from '../environments/environment';

describe('RepuestoService', () => {
  let service: RepuestoService;
  let httpMock: HttpTestingController;
  const baseUrl = `${environment.url}/api/repuestos`;

  const repuesto: Repuesto = {
    idRepuesto: 1,
    descripcion: 'Fuente de poder 500W',
    estado: 'Solicitado',
    idIncidencia: 1,
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(RepuestoService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('debe ser creado', () => {
    expect(service).toBeTruthy();
  });

  it('getAll() debe obtener todos los repuestos', () => {
    service.getAll().subscribe((res) => expect(res).toEqual([repuesto]));

    const req = httpMock.expectOne(baseUrl);
    expect(req.request.method).toBe('GET');
    req.flush([repuesto]);
  });

  it('getSolicitados() debe obtener repuestos solicitados', () => {
    service.getSolicitados().subscribe((res) => expect(res).toEqual([repuesto]));

    const req = httpMock.expectOne(`${baseUrl}/solicitados`);
    expect(req.request.method).toBe('GET');
    req.flush([repuesto]);
  });

  it('getEntregados() debe obtener repuestos entregados', () => {
    const entregado: Repuesto = { ...repuesto, estado: 'Entregado' };
    service.getEntregados().subscribe((res) => expect(res).toEqual([entregado]));

    const req = httpMock.expectOne(`${baseUrl}/entregados`);
    expect(req.request.method).toBe('GET');
    req.flush([entregado]);
  });

  it('solicitar() debe hacer POST una nueva solicitud de repuesto', () => {
    const nuevo: Partial<Repuesto> = { descripcion: 'Memoria RAM 8GB', idIncidencia: 1 };

    service.solicitar(nuevo).subscribe((res) => expect(res).toEqual(repuesto));

    const req = httpMock.expectOne(baseUrl);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(nuevo);
    req.flush(repuesto);
  });

  it('entregar() debe hacer PUT para marcar un repuesto como entregado', () => {
    const entregado: Repuesto = { ...repuesto, estado: 'Entregado' };
    service.entregar(1).subscribe((res) => expect(res).toEqual(entregado));

    const req = httpMock.expectOne(`${baseUrl}/1/entregar`);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual({});
    req.flush(entregado);
  });
});
