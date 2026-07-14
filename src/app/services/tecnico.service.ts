import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';

/**
 * Lo que devuelve /tecnicos/disponibles.
 * Es un mapa que el backend arma combinando Tecnico + Usuario.
 */
export interface TecnicoListado {
  idUsuario: number;
  nombre: string;
  especialidad: string;
  disponibilidad: boolean;
  maxIncidencias: number;
}

@Injectable({
  providedIn: 'root',
})
export class TecnicoService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.url}/tecnicos`;

  getDisponibles(): Observable<TecnicoListado[]> {
    return this.http.get<TecnicoListado[]>(`${this.baseUrl}/disponibles`);
  }

  /** Todos los tecnicos (disponibles o no), usado para poblar filtros. */
  getTodos(): Observable<TecnicoListado[]> {
    return this.http.get<TecnicoListado[]>(this.baseUrl);
  }
}
