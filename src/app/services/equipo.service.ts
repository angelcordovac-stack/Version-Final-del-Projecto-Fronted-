import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';

export interface Equipo {
  codigoEquipo: string;
  marcaModelo: string;
  areaUbicacion: string;
  responsable: string;
}

@Injectable({
  providedIn: 'root',
})
export class EquipoService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.url}/api/equipos`;

  getAll(): Observable<Equipo[]> {
    return this.http.get<Equipo[]>(this.baseUrl);
  }
}