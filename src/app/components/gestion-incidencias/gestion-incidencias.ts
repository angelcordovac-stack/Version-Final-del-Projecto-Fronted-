import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IncidenciaService } from '../../services/incidencia.service';
import { TecnicoService, TecnicoListado } from '../../services/tecnico.service';
import { SessionService } from '../../services/session.service';
import { ToastService } from '../../services/toast.service';
import { EquipoService, Equipo } from '../../services/equipo.service';
import { Incidencia } from '../../model/incidencia';

@Component({
  selector: 'app-gestion-incidencias',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './gestion-incidencias.html',
  styleUrl: './gestion-incidencias.scss',
})
export class GestionIncidencias implements OnInit {
  private svc = inject(IncidenciaService);
  private tecnicoSvc = inject(TecnicoService);
  private session = inject(SessionService);
  private toast = inject(ToastService);
  private equipoSvc = inject(EquipoService);

  incidencias: Incidencia[] = [];
  equipos: Equipo[] = [];
  isLoading = true;
  filtroEstado: string = 'TODAS';
  rolCodigo = '';

  showCrearModal = false;
  nuevaIncidencia: Partial<Incidencia> = this.emptyIncidencia();

  showAsignarModal = false;
  incidenciaParaAsignar: Incidencia | null = null;
  tecnicos: TecnicoListado[] = [];
  tecnicoSeleccionado: number | null = null;

  showSolucionarModal = false;
  incidenciaParaSolucionar: Incidencia | null = null;
  tipoSolucionInput = '';

  ngOnInit(): void {
    const user = this.session.getInfoSession();
    this.rolCodigo = user?.rol?.codigo ?? '';
    this.cargarEquipos();
    this.cargar();
  }

  cargar(): void {
    this.isLoading = true;

    const user = this.session.getInfoSession();
    const obs = this.esTecnico
      ? this.svc.getPorTecnico(user!.idUsuario)
      : this.svc.getAll();

    obs.subscribe({
      next: (data) => {
        this.incidencias = [...(data ?? [])];
        this.isLoading = false;
      },
      error: () => {
        this.toast.show('No se pudieron cargar las incidencias.', 'danger');
        this.isLoading = false;
      },
    });
  }

  cargarEquipos(): void {
    this.equipoSvc.getAll().subscribe({
      next: (data) => { this.equipos = data ?? []; },
      error: () => this.toast.show('No se pudieron cargar los equipos.', 'danger'),
    });
  }

  get incidenciasFiltradas(): Incidencia[] {
    if (this.filtroEstado === 'TODAS') return this.incidencias;
    return this.incidencias.filter(i => i.estado === this.filtroEstado);
  }

  abrirCrear(): void {
    this.nuevaIncidencia = this.emptyIncidencia();
    this.showCrearModal = true;
  }
  cerrarCrear(): void {
    this.showCrearModal = false;
  }
  guardarCrear(): void {
    const i = this.nuevaIncidencia;
    if (!i.codigoEquipo?.trim() || !i.descripcionProblema?.trim()) {
      this.toast.show('Completa codigo de equipo y descripcion.', 'warning');
      return;
    }
    const user = this.session.getInfoSession();
    i.quienRegistra = user?.nombreCompleto ?? '—';

    this.svc.crear(i).subscribe({
      next: () => {
        this.toast.show('Incidencia registrada.', 'success');
        this.showCrearModal = false;
        this.cargar();
      },
      error: () => this.toast.show('Error al registrar la incidencia.', 'danger'),
    });
  }

  abrirAsignar(inc: Incidencia): void {
    this.incidenciaParaAsignar = inc;
    this.tecnicoSeleccionado = null;
    this.tecnicoSvc.getDisponibles().subscribe({
      next: (data) => { this.tecnicos = data ?? []; },
      error: () => this.toast.show('No se pudieron cargar los tecnicos.', 'danger'),
    });
    this.showAsignarModal = true;
  }
  cerrarAsignar(): void {
    this.showAsignarModal = false;
    this.incidenciaParaAsignar = null;
  }
  confirmarAsignar(): void {
    if (!this.tecnicoSeleccionado || !this.incidenciaParaAsignar) {
      this.toast.show('Selecciona un tecnico.', 'warning');
      return;
    }
    this.svc.asignar(this.incidenciaParaAsignar.idIncidencia, this.tecnicoSeleccionado).subscribe({
      next: () => {
        this.toast.show('Tecnico asignado correctamente.', 'success');
        this.cerrarAsignar();
        this.cargar();
      },
      error: (err) => {
        const msg = err?.error?.error ?? 'Error al asignar tecnico.';
        this.toast.show(msg, 'danger');
      },
    });
  }

  abrirSolucionar(inc: Incidencia): void {
    this.incidenciaParaSolucionar = inc;
    this.tipoSolucionInput = '';
    this.showSolucionarModal = true;
  }
  cerrarSolucionar(): void {
    this.showSolucionarModal = false;
    this.incidenciaParaSolucionar = null;
  }
  confirmarSolucionar(): void {
    if (!this.tipoSolucionInput.trim() || !this.incidenciaParaSolucionar) {
      this.toast.show('Describe la solucion aplicada.', 'warning');
      return;
    }
    this.svc.solucionar(this.incidenciaParaSolucionar.idIncidencia, this.tipoSolucionInput).subscribe({
      next: () => {
        this.toast.show('Incidencia marcada como solucionada.', 'success');
        this.cerrarSolucionar();
        this.cargar();
      },
      error: () => this.toast.show('Error al actualizar la incidencia.', 'danger'),
    });
  }

  getEstadoClass(estado: string): string {
    switch (estado) {
      case 'Pendiente': return 'badge--warn';
      case 'Solucionado': return 'badge--success';
      default: return 'badge--info';
    }
  }

  private emptyIncidencia(): Partial<Incidencia> {
    return { codigoEquipo: '', descripcionProblema: '' };
  }

  get esTecnico(): boolean { return this.rolCodigo === 'TECNICO'; }
  get esJefe(): boolean { return this.rolCodigo === 'JEFE'; }
}