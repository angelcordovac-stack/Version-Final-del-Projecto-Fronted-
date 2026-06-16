import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';
import { Incidencia } from '../model/incidencia';

@Injectable({
  providedIn: 'root',
})
export class IncidenciaService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.url}/api/incidencias`;

  getAll(): Observable<Incidencia[]> {
    return this.http.get<Incidencia[]>(this.baseUrl);
  }

  getById(id: number): Observable<Incidencia> {
    return this.http.get<Incidencia>(`${this.baseUrl}/${id}`);
  }

  getPorTecnico(idTecnico: number): Observable<Incidencia[]> {
    return this.http.get<Incidencia[]>(`${this.baseUrl}/tecnico/${idTecnico}`);
  }

  /**
   * Registrar nueva incidencia.
   * El backend setea fechaRegistro y estado="Pendiente" automaticamente.
   */
  crear(incidencia: Partial<Incidencia>): Observable<Incidencia> {
    return this.http.post<Incidencia>(this.baseUrl, incidencia);
  }

  asignar(id: number, idTecnico: number): Observable<Incidencia> {
    return this.http.put<Incidencia>(`${this.baseUrl}/${id}/asignar`, { idTecnico });
  }

  /**
   * Solucionar: ahora MANDA tipoSolucion al backend.
   */
  solucionar(id: number, tipoSolucion: string): Observable<Incidencia> {
    return this.http.put<Incidencia>(`${this.baseUrl}/${id}/solucionar`, { tipoSolucion });
  }

  historialEquipo(codigoEquipo: string): Observable<Incidencia[]> {
    return this.http.get<Incidencia[]>(`${this.baseUrl}/equipo/${codigoEquipo}`);
  }
}
