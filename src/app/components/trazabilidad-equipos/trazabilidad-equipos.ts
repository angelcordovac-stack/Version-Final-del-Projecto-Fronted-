import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IncidenciaService } from '../../services/incidencia.service';
import { EquipoService, Equipo } from '../../services/equipo.service';
import { Incidencia } from '../../model/incidencia';
import { ToastService } from '../../services/toast.service';

interface EstadisticaEquipo {
  codigoEquipo: string;
  marcaModelo: string;
  areaUbicacion: string;
  totalIncidencias: number;
  pendientes: number;
  solucionadas: number;
  ultimaFecha: string | null;
}

@Component({
  selector: 'app-trazabilidad-equipos',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './trazabilidad-equipos.html',
  styleUrl:    './trazabilidad-equipos.scss',
})
export class TrazabilidadEquipos implements OnInit {
  private incidenciaSvc = inject(IncidenciaService);
  private equipoSvc     = inject(EquipoService);
  private toast         = inject(ToastService);

  // ── Estado general ─────────────────────────────────────────────────────────
  equipos:      Equipo[]             = [];
  estadisticas: EstadisticaEquipo[]  = [];
  isLoadingTabla = true;

  // ── Búsqueda en tabla resumen ──────────────────────────────────────────────
  filtroBusqueda = '';

  // ── Vista detalle de un equipo ─────────────────────────────────────────────
  equipoSeleccionado:  string | null  = null;
  historial:           Incidencia[]   = [];
  isLoadingHistorial   = false;
  filtroEstadoDetalle  = 'TODAS';

  ngOnInit(): void {
    this.cargarResumen();
  }

  // ── Carga el resumen de todos los equipos ───────────────────────────────────
  cargarResumen(): void {
    this.isLoadingTabla = true;

    this.equipoSvc.getAll().subscribe({
      next: (equipos) => {
        this.equipos = equipos ?? [];

        // Para cada equipo, traemos su historial y calculamos stats
        let pendientes = this.equipos.length;
        const stats: EstadisticaEquipo[] = [];

        if (pendientes === 0) {
          this.estadisticas = [];
          this.isLoadingTabla = false;
          return;
        }

        this.equipos.forEach(eq => {
          this.incidenciaSvc.historialEquipo(eq.codigoEquipo).subscribe({
            next: (incs) => {
              const lista = incs ?? [];
              stats.push({
                codigoEquipo:   eq.codigoEquipo,
                marcaModelo:    eq.marcaModelo,
                areaUbicacion:  eq.areaUbicacion,
                totalIncidencias: lista.length,
                pendientes:     lista.filter(i => i.estado !== 'Solucionado').length,
                solucionadas:   lista.filter(i => i.estado === 'Solucionado').length,
                ultimaFecha:    lista.length > 0 ? lista[0].fechaRegistro?.toString() ?? null : null,
              });
            },
            error: () => {
              // Si un equipo falla, lo agregamos con ceros para no romper la vista
              stats.push({
                codigoEquipo:    eq.codigoEquipo,
                marcaModelo:     eq.marcaModelo,
                areaUbicacion:   eq.areaUbicacion,
                totalIncidencias: 0,
                pendientes:      0,
                solucionadas:    0,
                ultimaFecha:     null,
              });
            },
            complete: () => {
              pendientes--;
              if (pendientes === 0) {
                // Ordenar por mayor cantidad de incidencias
                this.estadisticas = stats.sort((a, b) => b.totalIncidencias - a.totalIncidencias);
                this.isLoadingTabla = false;
              }
            },
          });
        });
      },
      error: () => {
        this.toast.show('No se pudieron cargar los equipos.', 'danger');
        this.isLoadingTabla = false;
      },
    });
  }

  // ── Tabla resumen filtrada ──────────────────────────────────────────────────
  get estadisticasFiltradas(): EstadisticaEquipo[] {
    if (!this.filtroBusqueda.trim()) return this.estadisticas;
    const f = this.filtroBusqueda.toLowerCase();
    return this.estadisticas.filter(e =>
      e.codigoEquipo.toLowerCase().includes(f) ||
      e.marcaModelo.toLowerCase().includes(f)  ||
      e.areaUbicacion.toLowerCase().includes(f)
    );
  }

  // ── Abre el historial detallado de un equipo ───────────────────────────────
  verHistorial(codigoEquipo: string): void {
    this.equipoSeleccionado = codigoEquipo;
    this.historial          = [];
    this.filtroEstadoDetalle = 'TODAS';
    this.isLoadingHistorial  = true;

    this.incidenciaSvc.historialEquipo(codigoEquipo).subscribe({
      next: (data) => {
        this.historial          = data ?? [];
        this.isLoadingHistorial = false;
      },
      error: () => {
        this.toast.show('No se pudo cargar el historial del equipo.', 'danger');
        this.isLoadingHistorial = false;
      },
    });
  }

  // ── Vuelve a la tabla resumen ───────────────────────────────────────────────
  volverResumen(): void {
    this.equipoSeleccionado = null;
    this.historial          = [];
  }

  // ── Historial filtrado por estado ──────────────────────────────────────────
  get historialFiltrado(): Incidencia[] {
    if (this.filtroEstadoDetalle === 'TODAS') return this.historial;
    return this.historial.filter(i => i.estado === this.filtroEstadoDetalle);
  }

  // ── Equipo seleccionado para mostrar info en header del detalle ─────────────
  get equipoInfo(): Equipo | null {
    return this.equipos.find(e => e.codigoEquipo === this.equipoSeleccionado) ?? null;
  }

  // ── Helpers ────────────────────────────────────────────────────────────────
  getEstadoClass(estado: string): string {
    switch (estado) {
      case 'Pendiente':   return 'badge--warn';
      case 'Solucionado': return 'badge--success';
      default:            return 'badge--info';
    }
  }

  getRiesgoClass(total: number): string {
    if (total >= 5) return 'risk--alto';
    if (total >= 2) return 'risk--medio';
    return 'risk--bajo';
  }

  getRiesgoLabel(total: number): string {
    if (total >= 5) return 'Alto';
    if (total >= 2) return 'Medio';
    return 'Bajo';
  }

  // ── KPIs globales (vista resumen) ──────────────────────────────────────────
  getTotalPendientes(): number {
    return this.estadisticas.reduce((acc, e) => acc + e.pendientes, 0);
  }

  getTotalSolucionadas(): number {
    return this.estadisticas.reduce((acc, e) => acc + e.solucionadas, 0);
  }

  getEquiposAltoRiesgo(): number {
    return this.estadisticas.filter(e => e.totalIncidencias >= 5).length;
  }

  // ── KPIs locales (vista detalle de equipo) ─────────────────────────────────
  getCountPendientes(): number {
    return this.historial.filter(i => i.estado !== 'Solucionado').length;
  }

  getCountSolucionadas(): number {
    return this.historial.filter(i => i.estado === 'Solucionado').length;
  }
}
