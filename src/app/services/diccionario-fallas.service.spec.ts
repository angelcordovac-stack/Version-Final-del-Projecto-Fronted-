import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';

import { DiccionarioFallasService, DiccionarioFalla } from './diccionario-fallas.service';
import { environment } from '../environments/environment';

describe('DiccionarioFallasService', () => {
  let service: DiccionarioFallasService;
  let httpMock: HttpTestingController;
  const baseUrl = `${environment.url}/api/fallas`;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(DiccionarioFallasService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('debe ser creado', () => {
    expect(service).toBeTruthy();
  });

  it('getAll() debe obtener la lista de fallas', () => {
    const mock: DiccionarioFalla[] = [
      { idFalla: 1, problemaComun: 'No prende', solucionSugerida: 'Revisar fuente de poder' },
    ];

    service.getAll().subscribe((res) => expect(res).toEqual(mock));

    const req = httpMock.expectOne(baseUrl);
    expect(req.request.method).toBe('GET');
    req.flush(mock);
  });

  it('buscar() debe obtener con la palabra clave como parámetro de consulta', () => {
    const mock: DiccionarioFalla[] = [];

    service.buscar('pantalla azul').subscribe((res) => expect(res).toEqual(mock));

    const req = httpMock.expectOne(`${baseUrl}/buscar?keyword=pantalla azul`);
    expect(req.request.method).toBe('GET');
    req.flush(mock);
  });

  it('registrar() debe hacer POST la nueva falla', () => {
    const nueva: DiccionarioFalla = {
      problemaComun: 'No conecta a wifi',
      solucionSugerida: 'Reiniciar el adaptador de red',
      estado: 'EN_CURSO',
    };
    const respuesta: DiccionarioFalla = { ...nueva, idFalla: 5 };

    service.registrar(nueva).subscribe((res) => expect(res).toEqual(respuesta));

    const req = httpMock.expectOne(baseUrl);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(nueva);
    req.flush(respuesta);
  });
});
