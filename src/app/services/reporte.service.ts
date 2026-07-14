import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';
import {
  DashboardResponse,
  TecnicoRendimiento,
  IncidenciaFiltrada,
  IncidenciaDetalleCompleto,
  FiltroIncidencias,
} from '../model/reporte';

@Injectable({
  providedIn: 'root',
})
export class ReporteService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.url}/reportes`;

  /** Como Jefe de area, quiero ver un panel con el estado general de incidencias. */
  getDashboard(): Observable<DashboardResponse> {
    return this.http.get<DashboardResponse>(`${this.baseUrl}/dashboard`);
  }

  /** Como Jefe de area, quiero ver cuantas incidencias resuelve cada tecnico. */
  getRendimientoTecnicos(): Observable<TecnicoRendimiento[]> {
    return this.http.get<TecnicoRendimiento[]>(`${this.baseUrl}/tecnicos/rendimiento`);
  }

  /** Como usuario del sistema, quiero filtrar incidencias por estado, fecha y tecnico. */
  filtrarIncidencias(filtro: FiltroIncidencias): Observable<IncidenciaFiltrada[]> {
    let params = new HttpParams();
    if (filtro.estado) params = params.set('estado', filtro.estado);
    if (filtro.desde) params = params.set('desde', filtro.desde);
    if (filtro.hasta) params = params.set('hasta', filtro.hasta);
    if (filtro.idTecnico) params = params.set('idTecnico', filtro.idTecnico);

    return this.http.get<IncidenciaFiltrada[]>(`${this.baseUrl}/incidencias/filtrar`, { params });
  }

  /** Como usuario del sistema, quiero ver el detalle completo de una incidencia registrada. */
  getDetalleIncidencia(id: number): Observable<IncidenciaDetalleCompleto> {
    return this.http.get<IncidenciaDetalleCompleto>(`${this.baseUrl}/incidencias/${id}/detalle`);
  }
}
