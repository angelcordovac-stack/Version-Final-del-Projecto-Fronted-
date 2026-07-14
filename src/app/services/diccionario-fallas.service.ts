import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';

export interface DiccionarioFalla {
  idFalla?: number;
  problemaComun: string;
  solucionSugerida: string;
  idAutor?: number;
  nombreAutor?: string;
  estado?: string;
  fecha?: string;
  fechaRegistro?: string;
}

export const ESTADOS_FALLA: { value: string; label: string }[] = [
  { value: 'CRITICO', label: 'Crítico' },
  { value: 'EN_CURSO', label: 'En curso' },
  { value: 'MANTENIMIENTO', label: 'Mantenimiento' },
  { value: 'RESUELTO', label: 'Resuelto' },
];

@Injectable({
  providedIn: 'root',
})
export class DiccionarioFallasService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.url}/diccionario-fallas`;

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