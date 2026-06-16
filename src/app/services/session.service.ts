import { Injectable } from '@angular/core';

export interface UserSesion {
  idUsuario: number;
  nombreCompleto: string;
  correo: string;
  idPerfil: number;
  perfil?: string; // Etiqueta visible
  // Compatibilidad con código que usaba la versión anterior:
  names?: string;
  personaId?: string;
  rol?: { codigo: string; descripcion: string };
}

@Injectable({
  providedIn: 'root',
})
export class SessionService {
  /**
   * Devuelve la información del usuario logueado.
   * Lee de localStorage el JSON guardado por AuthService.login().
   *
   * Se calcula también un campo `rol` con la forma que usa el resto del
   * frontend, mapeando el `idPerfil` numérico al código y descripción.
   */
  getInfoSession(): UserSesion | null {
    const raw = localStorage.getItem('user_session');
    if (!raw) return null;

    try {
      const data = JSON.parse(raw);

      // Mapeo de idPerfil a rol con código + descripción
      const roleMap: Record<number, { codigo: string; descripcion: string }> = {
        1: { codigo: 'JEFE', descripcion: 'Jefe' },
        2: { codigo: 'TECNICO', descripcion: 'Técnico' },
        3: { codigo: 'SISTEMAS', descripcion: 'Sistemas' },
      };

      return {
        idUsuario: data.idUsuario,
        nombreCompleto: data.nombreCompleto,
        correo: data.correo,
        idPerfil: data.idPerfil,
        perfil: roleMap[data.idPerfil]?.descripcion ?? `Perfil ${data.idPerfil}`,
        // Campos de compatibilidad
        names: data.nombreCompleto,
        personaId: String(data.idUsuario),
        rol: roleMap[data.idPerfil] ?? { codigo: 'UNKNOWN', descripcion: 'Sin rol' },
      };
    } catch {
      return null;
    }
  }
}
