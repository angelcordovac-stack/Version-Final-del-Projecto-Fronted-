import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../environments/environment';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

export interface LoginRequest {
  correo: string;
  password: string;
}

export interface LoginResponse {
  token?: string;
  idUsuario: number;
  nombreCompleto: string;
  correo: string;
  idPerfil: number;
  perfil?: string;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private http = inject(HttpClient);

  private _isLoggedIn = signal<boolean>(this.hasSession());
  isLoggedIn = this._isLoggedIn.asReadonly();

  /**
   * Login contra el backend Spring.
   * Endpoint: POST /usuarios/login
   *
   * El backend recibe un objeto Usuario completo, por eso mandamos el campo
   * como `passwordHash` (asi se llama en la entity), aunque sea texto plano
   * que el backend va a hashear/comparar con BCrypt.
   */
  login(payload: LoginRequest): Observable<LoginResponse> {
    const body = {
  correo: payload.correo,
  password: payload.password,
};

    return this.http.post<LoginResponse>(`${environment.url}/usuarios/login`, body).pipe(
      tap((res) => {
        localStorage.setItem('user_session', JSON.stringify(res));
        if (res.token) {
          localStorage.setItem('user_token', res.token);
        }
        this._isLoggedIn.set(true);
      })
    );
  }

  private hasSession(): boolean {
    return !!localStorage.getItem('user_session');
  }

  logout(): void {
    localStorage.removeItem('user_session');
    localStorage.removeItem('user_token');
    this._isLoggedIn.set(false);
  }
}
