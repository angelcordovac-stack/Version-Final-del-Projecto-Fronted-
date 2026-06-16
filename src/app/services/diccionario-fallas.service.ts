import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';

export interface DiccionarioFalla {
  idFalla?: number;
  problemaComun: string;
  solucionSugerida: string;
  idAutor?: number;
  fechaRegistro?: string;
}

@Injectable({
  providedIn: 'root',
})
export class DiccionarioFallasService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.url}/api/fallas`;

  getAll(): Observable<DiccionarioFalla[]> {
    return this.http.get<DiccionarioFalla[]>(this.baseUrl);
  }

  buscar(keyword: string): Observable<DiccionarioFalla[]> {
    return this.http.get<DiccionarioFalla[]>(`${this.baseUrl}/buscar?keyword=${keyword}`);
  }

  registrar(falla: DiccionarioFalla): Observable<DiccionarioFalla> {
    return this.http.post<DiccionarioFalla>(this.baseUrl, falla);
  }
}