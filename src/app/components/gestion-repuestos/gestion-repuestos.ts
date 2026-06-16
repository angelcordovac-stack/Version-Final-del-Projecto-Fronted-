import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RepuestoService } from '../../services/repuesto.service';
import { IncidenciaService } from '../../services/incidencia.service';
import { SessionService } from '../../services/session.service';
import { ToastService } from '../../services/toast.service';
import { Repuesto } from '../../model/repuesto';
import { Incidencia } from '../../model/incidencia';

@Component({
  selector: 'app-gestion-repuestos',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './gestion-repuestos.html',
  styleUrl: './gestion-repuestos.scss',
})
export class GestionRepuestos implements OnInit {
  private svc = inject(RepuestoService);
  private incidenciaSvc = inject(IncidenciaService);
  private session = inject(SessionService);
  private toast = inject(ToastService);

  repuestos: Repuesto[] = [];
  incidencias: Incidencia[] = [];
  isLoading = true;
  filtroEstado: string = 'TODOS';
  rolCodigo = '';

  // Formulario solicitar
  showSolicitarModal = false;
  formSolicitar = {
    idIncidencia: null as number | null,
    descripcion: '',
    cantidad: 1,
    urgencia: 'estandar',
  };

  ngOnInit(): void {
    this.rolCodigo = this.session.getInfoSession()?.rol?.codigo ?? '';
    this.cargar();
    if (this.esTecnico) {
      this.cargarIncidencias();
    }
  }

  cargar(): void {
    this.isLoading = true;
    this.svc.getAll().subscribe({
      next: (data) => {
        this.repuestos = [...(data ?? [])];
        this.isLoading = false;
      },
      error: () => {
        this.toast.show('No se pudieron cargar los repuestos.', 'danger');
        this.isLoading = false;
      },
    });
  }

  cargarIncidencias(): void {
    this.incidenciaSvc.getAll().subscribe({
      next: (data) => {
        const user = this.session.getInfoSession();
        this.incidencias = (data ?? []).filter(i =>
          Number(i.idTecnicoAsignado) === Number(user?.idUsuario) && i.estado === 'Pendiente'
        );
      },
      error: () => this.toast.show('No se pudieron cargar las incidencias.', 'danger'),
    });
  }

  get repuestosFiltrados(): Repuesto[] {
    if (this.filtroEstado === 'TODOS') return this.repuestos;
    return this.repuestos.filter(r => r.estado === this.filtroEstado);
  }

  abrirSolicitar(): void {
    this.formSolicitar = { idIncidencia: null, descripcion: '', cantidad: 1, urgencia: 'estandar' };
    this.showSolicitarModal = true;
  }

  cerrarSolicitar(): void {
    this.showSolicitarModal = false;
  }

  incrementarCantidad(): void { this.formSolicitar.cantidad++; }
  decrementarCantidad(): void { if (this.formSolicitar.cantidad > 1) this.formSolicitar.cantidad--; }

  guardarSolicitar(): void {
    if (!this.formSolicitar.idIncidencia || !this.formSolicitar.descripcion.trim()) {
      this.toast.show('Selecciona una incidencia y describe el repuesto.', 'warning');
      return;
    }
    this.svc.solicitar({
      idIncidencia: this.formSolicitar.idIncidencia,
      descripcion: this.formSolicitar.descripcion,
    }).subscribe({
      next: () => {
        this.toast.show('Repuesto solicitado correctamente.', 'success');
        this.cerrarSolicitar();
        this.cargar();
      },
      error: () => this.toast.show('Error al solicitar el repuesto.', 'danger'),
    });
  }

  entregar(r: Repuesto): void {
    if (!confirm(`¿Marcar como entregado el repuesto "${r.descripcion}"?`)) return;
    this.svc.entregar(r.idRepuesto).subscribe({
      next: () => {
        this.toast.show('Repuesto marcado como entregado.', 'success');
        this.cargar();
      },
      error: () => this.toast.show('Error al actualizar el repuesto.', 'danger'),
    });
  }

  get esTecnico(): boolean { return this.rolCodigo === 'TECNICO'; }
  get esSistemas(): boolean { return this.rolCodigo === 'SISTEMAS'; }
  get esJefe(): boolean { return this.rolCodigo === 'JEFE'; }
}