import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReporteService } from '../../services/reporte.service';
import { TecnicoService, TecnicoListado } from '../../services/tecnico.service';
import { SessionService } from '../../services/session.service';
import { ToastService } from '../../services/toast.service';
import {
  DashboardResponse,
  TecnicoRendimiento,
  IncidenciaFiltrada,
  IncidenciaDetalleCompleto,
} from '../../model/reporte';

type Tab = 'dashboard' | 'rendimiento' | 'buscar';

@Component({
  selector: 'app-reportes',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './reportes.html',
  styleUrl: './reportes.scss',
})
export class Reportes implements OnInit {
  private svc = inject(ReporteService);
  private tecnicoSvc = inject(TecnicoService);
  private session = inject(SessionService);
  private toast = inject(ToastService);

  rolCodigo = '';
  tab: Tab = 'buscar';

  tecnicos: TecnicoListado[] = [];

  // --- Dashboard ---
  dashboard: DashboardResponse | null = null;
  loadingDashboard = false;

  // --- Rendimiento de tecnicos ---
  rendimiento: TecnicoRendimiento[] = [];
  loadingRendimiento = false;

  // --- Filtrado avanzado ---
  filtro = {
    estado: '',
    desde: '',
    hasta: '',
    idTecnico: null as number | null,
  };
  resultados: IncidenciaFiltrada[] = [];
  loadingBuscar = false;
  yaBusco = false;

  // --- Detalle de incidencia ---
  showDetalleModal = false;
  detalle: IncidenciaDetalleCompleto | null = null;
  loadingDetalle = false;

  ngOnInit(): void {
    this.rolCodigo = this.session.getInfoSession()?.rol?.codigo ?? '';
    this.tab = this.esJefe ? 'dashboard' : 'buscar';

    this.tecnicoSvc.getTodos().subscribe({
      next: (data) => { this.tecnicos = data ?? []; },
      error: () => {}, // el filtro por tecnico simplemente queda vacio si esto falla
    });

    if (this.esJefe) {
      this.cargarDashboard();
    }
  }

  get esJefe(): boolean {
    return this.rolCodigo === 'JEFE';
  }

  cambiarTab(tab: Tab): void {
    this.tab = tab;
    if (tab === 'dashboard' && !this.dashboard) this.cargarDashboard();
    if (tab === 'rendimiento' && this.rendimiento.length === 0) this.cargarRendimiento();
  }

  cargarDashboard(): void {
    this.loadingDashboard = true;
    this.svc.getDashboard().subscribe({
      next: (data) => {
        this.dashboard = data;
        this.loadingDashboard = false;
      },
      error: () => {
        this.toast.show('No se pudo cargar el panel de incidencias.', 'danger');
        this.loadingDashboard = false;
      },
    });
  }

  cargarRendimiento(): void {
    this.loadingRendimiento = true;
    this.svc.getRendimientoTecnicos().subscribe({
      next: (data) => {
        this.rendimiento = data ?? [];
        this.loadingRendimiento = false;
      },
      error: () => {
        this.toast.show('No se pudo cargar el rendimiento de tecnicos.', 'danger');
        this.loadingRendimiento = false;
      },
    });
  }

  buscar(): void {
    this.loadingBuscar = true;
    this.yaBusco = true;
    this.svc
      .filtrarIncidencias({
        estado: this.filtro.estado || undefined,
        desde: this.filtro.desde || undefined,
        hasta: this.filtro.hasta || undefined,
        idTecnico: this.filtro.idTecnico ?? undefined,
      })
      .subscribe({
        next: (data) => {
          this.resultados = data ?? [];
          this.loadingBuscar = false;
        },
        error: () => {
          this.toast.show('No se pudo filtrar incidencias.', 'danger');
          this.loadingBuscar = false;
        },
      });
  }

  limpiarFiltro(): void {
    this.filtro = { estado: '', desde: '', hasta: '', idTecnico: null };
    this.resultados = [];
    this.yaBusco = false;
  }

  verDetalle(idIncidencia: number): void {
    this.showDetalleModal = true;
    this.loadingDetalle = true;
    this.detalle = null;
    this.svc.getDetalleIncidencia(idIncidencia).subscribe({
      next: (data) => {
        this.detalle = data;
        this.loadingDetalle = false;
      },
      error: () => {
        this.toast.show('No se pudo cargar el detalle de la incidencia.', 'danger');
        this.loadingDetalle = false;
        this.showDetalleModal = false;
      },
    });
  }

  cerrarDetalle(): void {
    this.showDetalleModal = false;
    this.detalle = null;
  }

  getEstadoClass(estado: string | undefined): string {
    switch (estado) {
      case 'Pendiente': return 'badge--warn';
      case 'Solucionado': return 'badge--success';
      default: return 'badge--info';
    }
  }

  nombreTecnico(idTecnico: string): string {
    const t = this.tecnicos.find((x) => String(x.idUsuario) === idTecnico);
    return t ? t.nombre : `Técnico #${idTecnico}`;
  }

  /** Para dibujar barras horizontales simples sin depender de una libreria de graficos. */
  porcentaje(valor: number, total: number): number {
    if (!total) return 0;
    return Math.round((valor / total) * 100);
  }

  objectEntries(obj: Record<string, number> | undefined): [string, number][] {
    return obj ? Object.entries(obj) : [];
  }
}
