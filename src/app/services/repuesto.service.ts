import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';
import { Repuesto } from '../model/repuesto';

@Injectable({
  providedIn: 'root',
})
export class RepuestoService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.url}/api/repuestos`;

  getAll(): Observable<Repuesto[]> {
    return this.http.get<Repuesto[]>(this.baseUrl);
  }

  getSolicitados(): Observable<Repuesto[]> {
    return this.http.get<Repuesto[]>(`${this.baseUrl}/solicitados`);
  }

  getEntregados(): Observable<Repuesto[]> {
    return this.http.get<Repuesto[]>(`${this.baseUrl}/entregados`);
  }

  solicitar(repuesto: Partial<Repuesto>): Observable<Repuesto> {
    return this.http.post<Repuesto>(this.baseUrl, repuesto);
  }

  entregar(id: number): Observable<Repuesto> {
    return this.http.put<Repuesto>(`${this.baseUrl}/${id}/entregar`, {});
  }
}
