import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { UsuarioService, Usuario, UsuarioRequest } from '../../../services/usuario.service';
import { ToastService } from '../../../services/toast.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-mantenimiento-usuarios',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './mantenimiento-usuarios.html',
  styleUrl: './mantenimiento-usuarios.scss',
})
export class MantenimientoUsuarios implements OnInit {
  private usuarioService = inject(UsuarioService);
  private toast = inject(ToastService);
  private fb = inject(FormBuilder);

  usuarios: Usuario[] = [];
  isLoading = true;
  filtroBusqueda: string = '';

  // Modal crear/editar
  showModal = false;
  isEditing = false;
  usuarioEditandoId: number | null = null;
  usuarioForm!: FormGroup;

  // Confirmar eliminación
  showDeleteConfirm = false;
  usuarioToDelete: Usuario | null = null;

  readonly ROLES = [
    { id: 1, codigo: 'JEFE',     descripcion: 'Jefe' },
    { id: 2, codigo: 'TECNICO',  descripcion: 'Técnico' },
    { id: 3, codigo: 'SISTEMAS', descripcion: 'Sistemas' },
  ];

  ngOnInit(): void {
    this.inicializarForm();
    this.cargarUsuarios();
  }

  private inicializarForm(isEditing = false): void {
    this.usuarioForm = this.fb.group({
      nombreCompleto: ['', [
        Validators.required,
        Validators.minLength(3),
        Validators.maxLength(100),
        Validators.pattern(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/),
      ]],
      correo: ['', [
        Validators.required,
        Validators.email,
        Validators.maxLength(100),
      ]],
      password: ['', isEditing
        ? [Validators.minLength(6)]                              // Opcional al editar
        : [Validators.required, Validators.minLength(6)],       // Obligatorio al crear
      ],
      telefono: ['', [
        Validators.pattern(/^[0-9+\-\s]{7,15}$/),
      ]],
      idPerfil: [2, [Validators.required]],
      activo: [true],
    });
  }

  cargarUsuarios(): void {
    this.isLoading = true;
    this.usuarioService.getUsuarios().subscribe({
      next: (data) => {
        this.usuarios = [...(data ?? [])];
        this.isLoading = false;
      },
      error: (err) => {
        console.error(err);
        this.toast.show('No se pudieron cargar los usuarios.', 'danger');
        this.isLoading = false;
      },
    });
  }

  get usuariosFiltrados(): Usuario[] {
    if (!this.filtroBusqueda.trim()) return this.usuarios;
    const filtro = this.filtroBusqueda.toLowerCase();
    return this.usuarios.filter(u =>
      u.nombreCompleto?.toLowerCase().includes(filtro) ||
      u.correo?.toLowerCase().includes(filtro) ||
      this.getPerfilDescripcion(u.idPerfil).toLowerCase().includes(filtro)
    );
  }

  abrirNuevo(): void {
    this.isEditing = false;
    this.usuarioEditandoId = null;
    this.inicializarForm(false);
    this.showModal = true;
  }

  abrirEditar(u: Usuario): void {
    this.isEditing = true;
    this.usuarioEditandoId = u.idUsuario;
    this.inicializarForm(true);
    this.usuarioForm.patchValue({
      nombreCompleto: u.nombreCompleto,
      correo: u.correo,
      telefono: u.telefono ?? '',
      idPerfil: u.idPerfil,
      activo: u.activo,
      password: '',
    });
    this.showModal = true;
  }

  cerrarModal(): void {
    this.showModal = false;
  }

  guardar(): void {
    if (this.usuarioForm.invalid) {
      this.usuarioForm.markAllAsTouched();
      return;
    }

    const valores = this.usuarioForm.value;
    const payload: UsuarioRequest = {
      nombreCompleto: valores.nombreCompleto.trim(),
      correo: valores.correo.trim().toLowerCase(),
      telefono: valores.telefono?.trim() || '',
      idPerfil: valores.idPerfil,
      activo: valores.activo,
      password: valores.password || '',
    };

    if (this.isEditing && this.usuarioEditandoId) {
      payload.idUsuario = this.usuarioEditandoId;
      this.usuarioService.actualizarUsuario(this.usuarioEditandoId, payload).subscribe({
        next: () => {
          this.toast.show('Usuario actualizado.', 'success');
          this.cerrarModal();
          this.cargarUsuarios();
        },
        error: (err) => {
          const msg = err?.error?.error ?? 'Error al actualizar el usuario.';
          this.toast.show(msg, 'danger');
        },
      });
    } else {
      this.usuarioService.registrarUsuario(payload).subscribe({
        next: () => {
          this.toast.show('Usuario registrado.', 'success');
          this.cerrarModal();
          this.cargarUsuarios();
        },
        error: (err) => {
          const msg = err?.error?.error ?? 'Error al registrar el usuario.';
          this.toast.show(msg, 'danger');
        },
      });
    }
  }

  confirmarEliminar(u: Usuario): void {
    this.usuarioToDelete = u;
    this.showDeleteConfirm = true;
  }

  cancelarEliminar(): void {
    this.usuarioToDelete = null;
    this.showDeleteConfirm = false;
  }

  eliminar(): void {
    if (!this.usuarioToDelete) return;
    this.usuarioService.eliminarUsuario(this.usuarioToDelete.idUsuario).subscribe({
      next: () => {
        this.toast.show('Usuario eliminado.', 'success');
        this.cancelarEliminar();
        this.cargarUsuarios();
      },
      error: () => {
        this.toast.show('Error al eliminar el usuario.', 'danger');
        this.cancelarEliminar();
      },
    });
  }

  getPerfilDescripcion(idPerfil: number): string {
    return this.ROLES.find(r => r.id === idPerfil)?.descripcion ?? '—';
  }

  // Helpers para el template
  get f(): Record<string, AbstractControl> {
    return this.usuarioForm.controls;
  }

  campoInvalido(campo: string): boolean {
    const ctrl = this.usuarioForm.get(campo);
    return !!(ctrl?.invalid && ctrl?.touched);
  }

  mensajeError(campo: string): string {
    const ctrl = this.usuarioForm.get(campo);
    if (!ctrl?.errors) return '';

    if (ctrl.errors['required'])   return 'Este campo es obligatorio.';
    if (ctrl.errors['email'])      return 'Ingresa un correo válido (ej: usuario@dominio.com).';
    if (ctrl.errors['minlength'])  {
      const min = ctrl.errors['minlength'].requiredLength;
      return `Mínimo ${min} caracteres.`;
    }
    if (ctrl.errors['maxlength'])  {
      const max = ctrl.errors['maxlength'].requiredLength;
      return `Máximo ${max} caracteres.`;
    }
    if (ctrl.errors['pattern']) {
      if (campo === 'nombreCompleto') return 'Solo se permiten letras y espacios.';
      if (campo === 'telefono')       return 'Formato inválido. Ej: 999 888 777';
    }
    return 'Valor inválido.';
  }
}
