import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DiccionarioFallasService, DiccionarioFalla, ESTADOS_FALLA } from '../../services/diccionario-fallas.service';
import { SessionService } from '../../services/session.service';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-diccionario-fallas',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './diccionario-fallas.html',
  styleUrl: './diccionario-fallas.scss',
})
export class DiccionarioFallas implements OnInit {
  private svc = inject(DiccionarioFallasService);
  private session = inject(SessionService);
  private toast = inject(ToastService);

  fallas: DiccionarioFalla[] = [];
  isLoading = true;
  busqueda = '';
  rolCodigo = '';

  estados = ESTADOS_FALLA;

  showModal = false;
  guardando = false;
  formData: DiccionarioFalla = this.emptyForm();

  ngOnInit(): void {
    this.rolCodigo = this.session.getInfoSession()?.rol?.codigo ?? '';
    this.cargar();
  }

  cargar(): void {
    this.isLoading = true;
    this.svc.getAll().subscribe({
      next: (data) => {
        this.fallas = [...(data ?? [])];
        this.isLoading = false;
      },
      error: () => {
        this.toast.show('No se pudieron cargar las fallas.', 'danger');
        this.isLoading = false;
      },
    });
  }

  buscar(): void {
    if (!this.busqueda.trim()) {
      this.cargar();
      return;
    }
    this.isLoading = true;
    this.svc.buscar(this.busqueda).subscribe({
      next: (data) => {
        this.fallas = [...(data ?? [])];
        this.isLoading = false;
      },
      error: () => {
        this.toast.show('Error al buscar.', 'danger');
        this.isLoading = false;
      },
    });
  }

  abrirNueva(): void {
    this.formData = this.emptyForm();
    this.guardando = false;
    this.showModal = true;
  }

  cerrarModal(): void {
    this.showModal = false;
    this.guardando = false;
  }

  guardar(): void {
    if (this.guardando) return;
    if (!this.formData.problemaComun?.trim() || !this.formData.solucionSugerida?.trim()) {
      this.toast.show('Completa el problema y la solución.', 'warning');
      return;
    }
    if (!this.formData.estado) {
      this.toast.show('Selecciona el estado de la solución.', 'warning');
      return;
    }
    this.guardando = true;
    const user = this.session.getInfoSession();
    this.formData.idAutor = user?.idUsuario;

    this.svc.registrar(this.formData).subscribe({
      next: () => {
        this.toast.show('Falla registrada correctamente.', 'success');
        this.guardando = false;
        this.cerrarModal();
        this.cargar();
      },
      error: (err) => {
        const msg = err?.error?.error ?? 'Error al registrar la falla.';
        this.toast.show(msg, 'danger');
        this.guardando = false;
      },
    });
  }

  get puedeAgregar(): boolean {
    return this.rolCodigo === 'TECNICO' || this.rolCodigo === 'SISTEMAS';
  }

  get esJefe(): boolean { return this.rolCodigo === 'JEFE'; }

  estadoLabel(estado?: string): string {
    return this.estados.find((e) => e.value === estado)?.label ?? 'Sin estado';
  }

  estadoClass(estado?: string): string {
    switch (estado) {
      case 'CRITICO': return 'dic__badge--red';
      case 'EN_CURSO': return 'dic__badge--blue';
      case 'MANTENIMIENTO': return 'dic__badge--yellow';
      case 'RESUELTO': return 'dic__badge--green';
      default: return 'dic__badge--blue';
    }
  }

  cardAccentClass(estado?: string): string {
    switch (estado) {
      case 'CRITICO': return 'dic__card--accent-red';
      case 'EN_CURSO': return 'dic__card--accent-blue';
      case 'MANTENIMIENTO': return 'dic__card--accent-yellow';
      case 'RESUELTO': return 'dic__card--accent-green';
      default: return 'dic__card--accent-blue';
    }
  }

  private emptyForm(): DiccionarioFalla {
    return { problemaComun: '', solucionSugerida: '', estado: '', fecha: '' };
  }
}