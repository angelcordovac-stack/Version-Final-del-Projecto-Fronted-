import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';

export interface Usuario {
  idUsuario: number;
  nombreCompleto: string;
  correo: string;
  telefono?: string;
  idPerfil: number;
  activo: boolean;
}

export interface UsuarioRequest {
  idUsuario?: number;
  nombreCompleto: string;
  correo: string;
  password?: string;
  telefono?: string;
  idPerfil: number;
  activo: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class UsuarioService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.url}/mantenimiento/usuarios`;

  getUsuarios(): Observable<Usuario[]> {
    return this.http.get<Usuario[]>(this.baseUrl);
  }

  getUsuario(id: number): Observable<Usuario> {
    return this.http.get<Usuario>(`${this.baseUrl}/${id}`);
  }

  registrarUsuario(usuario: UsuarioRequest): Observable<Usuario> {
    return this.http.post<Usuario>(this.baseUrl, this.toBackendPayload(usuario));
  }

  actualizarUsuario(id: number, usuario: UsuarioRequest): Observable<Usuario> {
    return this.http.put<Usuario>(`${this.baseUrl}/${id}`, this.toBackendPayload(usuario));
  }

  eliminarUsuario(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  /**
   * Adapta el DTO del frontend ({password}) al formato que espera el backend ({passwordHash}).
   * El backend va a hashear la contrasena con BCrypt antes de guardarla.
   */
  private toBackendPayload(u: UsuarioRequest): any {
    const { password, ...rest } = u;
    return {
      ...rest,
      passwordHash: password, // el backend lo recibe en este campo y lo hashea
    };
  }
}
