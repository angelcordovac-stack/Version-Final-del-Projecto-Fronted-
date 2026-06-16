import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UsuarioService, Usuario, UsuarioRequest } from '../../../services/usuario.service';
import { ToastService } from '../../../services/toast.service';

@Component({
  selector: 'app-mantenimiento-usuarios',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './mantenimiento-usuarios.html',
  styleUrl: './mantenimiento-usuarios.scss',
})
export class MantenimientoUsuarios implements OnInit {
  private usuarioService = inject(UsuarioService);
  private toast = inject(ToastService);

  usuarios: Usuario[] = [];
  isLoading = true;
  filtroBusqueda: string = '';

  // Modal crear/editar
  showModal = false;
  isEditing = false;
  formData: UsuarioRequest = this.emptyForm();
  formErrors: string[] = [];

  // Confirmar eliminación
  showDeleteConfirm = false;
  usuarioToDelete: Usuario | null = null;

  readonly ROLES = [
    { id: 1, codigo: 'JEFE',     descripcion: 'Jefe' },
    { id: 2, codigo: 'TECNICO',  descripcion: 'Técnico' },
    { id: 3, codigo: 'SISTEMAS', descripcion: 'Sistemas' },
  ];

  ngOnInit(): void {
    this.cargarUsuarios();
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
    this.formData = this.emptyForm();
    this.formErrors = [];
    this.showModal = true;
  }

  abrirEditar(u: Usuario): void {
    this.isEditing = true;
    this.formData = {
      idUsuario: u.idUsuario,
      nombreCompleto: u.nombreCompleto,
      correo: u.correo,
      telefono: u.telefono,
      idPerfil: u.idPerfil,
      activo: u.activo,
      password: '',
    };
    this.formErrors = [];
    this.showModal = true;
  }

  cerrarModal(): void {
    this.showModal = false;
  }

  validar(): boolean {
    this.formErrors = [];
    if (!this.formData.nombreCompleto?.trim()) this.formErrors.push('El nombre completo es requerido.');
    if (!this.formData.correo?.trim()) this.formErrors.push('El correo es requerido.');
    if (!this.isEditing && !this.formData.password?.trim()) this.formErrors.push('La contraseña es requerida.');
    if (!this.formData.idPerfil) this.formErrors.push('El rol es requerido.');
    return this.formErrors.length === 0;
  }

  guardar(): void {
    if (!this.validar()) return;

    if (this.isEditing && this.formData.idUsuario) {
      this.usuarioService.actualizarUsuario(this.formData.idUsuario, this.formData).subscribe({
        next: () => {
          this.toast.show('Usuario actualizado.', 'success');
          this.cerrarModal();
          this.cargarUsuarios();
        },
        error: () => this.toast.show('Error al actualizar el usuario.', 'danger'),
      });
    } else {
      this.usuarioService.registrarUsuario(this.formData).subscribe({
        next: () => {
          this.toast.show('Usuario registrado.', 'success');
          this.cerrarModal();
          this.cargarUsuarios();
        },
        error: () => this.toast.show('Error al registrar el usuario.', 'danger'),
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

  private emptyForm(): UsuarioRequest {
    return {
      nombreCompleto: '',
      correo: '',
      password: '',
      telefono: '',
      idPerfil: 2,
      activo: true,
    };
  }
}