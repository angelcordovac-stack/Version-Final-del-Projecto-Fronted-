import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DiccionarioFallasService, DiccionarioFalla } from '../../services/diccionario-fallas.service';
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
      error: () => {
        this.toast.show('Error al registrar la falla.', 'danger');
        this.guardando = false;
      },
    });
  }

  get puedeAgregar(): boolean {
    return this.rolCodigo === 'TECNICO' || this.rolCodigo === 'SISTEMAS';
  }

  get esJefe(): boolean { return this.rolCodigo === 'JEFE'; }

  private emptyForm(): DiccionarioFalla {
    return { problemaComun: '', solucionSugerida: '' };
  }
}