import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';
import { NotificationService } from '../../../../core/services/notification.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup;
  cargando = false;
  mostrarPassword = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.inicializarFormulario();

    if (this.authService.isLoggedIn()) {
      const usuario = this.authService.getCurrentUser();
      if (usuario) {
        this.redirigirSegunRol(usuario.rol);
      }
    }
  }

  private inicializarFormulario(): void {
    this.loginForm = this.fb.group({
      username: ['', [Validators.required]],
      password: ['', [Validators.required]],
      recuerdame: [false]
    });
  }

  onLogin(): void {
    if (this.loginForm.invalid) {
      return;
    }

    this.cargando = true;
    const { username, password } = this.loginForm.value;

    this.authService.login(username, password).subscribe({
      next: (response) => {
        this.cargando = false;
        const usuario = this.authService.getCurrentUser();
        if (usuario) {
          this.notificationService.mostrarExito('Sesión iniciada correctamente');
          this.redirigirSegunRol(usuario.rol);
        }
      },
      error: (error) => {
        this.cargando = false;
        console.error('Error en login:', error);
      }
    });
  }

  togglePassword(): void {
    this.mostrarPassword = !this.mostrarPassword;
  }

  usarCredencialDemo(username: string, password: string): void {
    this.loginForm.patchValue({
      username,
      password
    });
  }

  private redirigirSegunRol(rol: string): void {
    switch (rol) {
      case 'ADMIN':
        this.router.navigate(['/admin/dashboard']);
        break;
      case 'CLIENTE':
        this.router.navigate(['/cliente/dashboard']);
        break;
      case 'FREELANCER':
        this.router.navigate(['/freelancer/dashboard']);
        break;
      default:
        this.router.navigate(['/']);
    }
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.loginForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }
}
