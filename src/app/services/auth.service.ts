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
  refreshToken?: string;
  idUsuario: number;
  nombreCompleto: string;
  correo: string;
  idPerfil: number;
  perfil?: string;
}

export interface RefreshResponse {
  token: string;
  refreshToken: string;
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
   * Guarda el accessToken y el refreshToken en localStorage.
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
        if (res.refreshToken) {
          localStorage.setItem('refresh_token', res.refreshToken);
        }
        this._isLoggedIn.set(true);
      })
    );
  }

  /**
   * Renueva el access token usando el refresh token.
   * Llamado automáticamente por el interceptor cuando recibe un 401.
   */
  refreshAccessToken(refreshToken: string): Observable<RefreshResponse> {
    return this.http.post<RefreshResponse>(`${environment.url}/usuarios/refresh`, {
      refreshToken,
    });
  }

  /**
   * Cierra la sesión: avisa al backend y limpia localStorage.
   */
  logout(): void {
    const refreshToken = localStorage.getItem('refresh_token');
    if (refreshToken) {
      // Notificar al backend para revocar el refresh token (best-effort)
      this.http
        .post(`${environment.url}/usuarios/logout`, { refreshToken })
        .subscribe({ error: () => {} });
    }
    localStorage.removeItem('user_session');
    localStorage.removeItem('user_token');
    localStorage.removeItem('refresh_token');
    this._isLoggedIn.set(false);
  }

  private hasSession(): boolean {
    return !!localStorage.getItem('user_session');
  }
}
