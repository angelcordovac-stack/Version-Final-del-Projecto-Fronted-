import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';

import { EquipoService, Equipo } from './equipo.service';
import { environment } from '../environments/environment';

describe('EquipoService', () => {
  let service: EquipoService;
  let httpMock: HttpTestingController;
  const baseUrl = `${environment.url}/api/equipos`;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(EquipoService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('debe ser creado', () => {
    expect(service).toBeTruthy();
  });

  it('getAll() debe obtener la lista de equipos', () => {
    const mock: Equipo[] = [
      { codigoEquipo: 'PC-001', marcaModelo: 'Dell Optiplex', areaUbicacion: 'Ventas', responsable: 'Ana' },
    ];

    service.getAll().subscribe((res) => expect(res).toEqual(mock));

    const req = httpMock.expectOne(baseUrl);
    expect(req.request.method).toBe('GET');
    req.flush(mock);
  });
});
