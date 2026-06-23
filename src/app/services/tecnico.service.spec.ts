import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';

import { TecnicoService, TecnicoListado } from './tecnico.service';
import { environment } from '../environments/environment';

describe('TecnicoService', () => {
  let service: TecnicoService;
  let httpMock: HttpTestingController;
  const baseUrl = `${environment.url}/api/tecnicos`;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(TecnicoService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('getDisponibles() should GET the list of available technicians', () => {
    const mock: TecnicoListado[] = [
      { idUsuario: 1, nombre: 'Luis Vargas', especialidad: 'Hardware', disponibilidad: true, maxIncidencias: 5 },
    ];

    service.getDisponibles().subscribe((res) => expect(res).toEqual(mock));

    const req = httpMock.expectOne(`${baseUrl}/disponibles`);
    expect(req.request.method).toBe('GET');
    req.flush(mock);
  });
});
