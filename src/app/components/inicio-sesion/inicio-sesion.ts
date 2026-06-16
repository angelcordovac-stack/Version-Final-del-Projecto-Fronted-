import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ToastService } from '../../services/toast.service';
import { Header } from '../header/header';
import { Footer } from '../footer/footer';

@Component({
  selector: 'app-inicio-sesion',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, Header, Footer],
  templateUrl: './inicio-sesion.html',
  styleUrl: './inicio-sesion.scss',
})
export class InicioSesion {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private toast = inject(ToastService);
  private router = inject(Router);

  loginForm: FormGroup;
  isLoading = false;
  errorMessage = '';

  constructor() {
    this.loginForm = this.fb.group({
      correo: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(1)]],
    });
  }

  onSubmit(): void {
    if (this.loginForm.invalid) return;

    this.isLoading = true;
    this.errorMessage = '';

    const payload = {
      correo: this.loginForm.value.correo,
      password: this.loginForm.value.password,
    };

    this.authService.login(payload).subscribe({
      next: () => {
        this.toast.show('Ingreso exitoso.', 'success');
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        console.error('Error de login:', err);
        if (err.status === 0) {
          this.errorMessage = 'No se puede conectar con el servidor. ¿El backend esta corriendo en localhost:8080?';
        } else if (err.status === 401) {
          this.errorMessage = 'Correo o contrasena incorrectos.';
        } else {
          this.errorMessage = `Error ${err.status}: ${err.error?.error || err.message || 'Intentalo mas tarde.'}`;
        }
        this.toast.show(this.errorMessage, 'danger');
        this.isLoading = false;
      },
    });
  }

  get correo() { return this.loginForm.get('correo'); }
  get password() { return this.loginForm.get('password'); }
}
