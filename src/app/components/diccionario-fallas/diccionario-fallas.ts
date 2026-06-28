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
  erroresForm: string[] = [];

  showDetalle = false;
  fallaSeleccionada: DiccionarioFalla | null = null;

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

  get fallasFiltradas(): DiccionarioFalla[] {
    const termino = this.busqueda.trim().toLowerCase();
    if (!termino) return this.fallas;

    return this.fallas.filter((f) =>
      f.problemaComun?.toLowerCase().includes(termino) ||
      f.solucionSugerida?.toLowerCase().includes(termino) ||
      this.estadoLabel(f.estado).toLowerCase().includes(termino)
    );
  }

  buscar(): void {
    // El filtrado ya se aplica en vivo mientras se escribe (ver fallasFiltradas).
    // Enter / botón solo quitan el foco; no se requiere llamada al backend.
  }

  abrirNueva(): void {
    this.formData = this.emptyForm();
    this.guardando = false;
    this.erroresForm = [];
    this.showModal = true;
  }

  cerrarModal(): void {
    this.showModal = false;
    this.guardando = false;
    this.erroresForm = [];
  }

  abrirDetalle(falla: DiccionarioFalla): void {
    this.fallaSeleccionada = falla;
    this.showDetalle = true;
  }

  cerrarDetalle(): void {
    this.showDetalle = false;
    this.fallaSeleccionada = null;
  }

  // El ID visual (KB-00X) se basa en la posición dentro de la lista completa
  // de fallas, no en la lista filtrada, para que no cambie al buscar.
  indiceReal(falla: DiccionarioFalla): number {
    return this.fallas.indexOf(falla);
  }

  guardar(): void {
    if (this.guardando) return;

    this.erroresForm = [];
    const problema = (this.formData.problemaComun ?? '').trim();
    const solucion = (this.formData.solucionSugerida ?? '').trim();

    if (!problema) {
      this.erroresForm.push('El problema común es obligatorio.');
    } else if (problema.length < 5) {
      this.erroresForm.push('El problema común debe tener al menos 5 caracteres.');
    } else if (problema.length > 150) {
      this.erroresForm.push('El problema común no puede superar los 150 caracteres.');
    }

    if (!solucion) {
      this.erroresForm.push('La solución sugerida es obligatoria.');
    } else if (solucion.length < 10) {
      this.erroresForm.push('La solución sugerida debe tener al menos 10 caracteres.');
    } else if (solucion.length > 1000) {
      this.erroresForm.push('La solución sugerida no puede superar los 1000 caracteres.');
    }

    if (!this.formData.estado) {
      this.erroresForm.push('Selecciona el estado de la solución.');
    }

    if (this.erroresForm.length > 0) return;

    this.guardando = true;
    const user = this.session.getInfoSession();
    this.formData.idAutor = user?.idUsuario;
    this.formData.problemaComun = problema;
    this.formData.solucionSugerida = solucion;

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