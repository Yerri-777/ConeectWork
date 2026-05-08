import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { PermiteSoloNumeroDirective } from '../../../../shared/directivas/permite-solo-numero.directive';

@Component({
  selector: 'app-registro',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, PermiteSoloNumeroDirective, RouterModule],
  templateUrl: './registro.component.html',
  styleUrls: ['./registro.component.css']
})
export class RegistroComponent implements OnInit {
  registroForm!: FormGroup;
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
  }

  private inicializarFormulario(): void {
    this.registroForm = this.fb.group({
      nombreCompleto: ['', [Validators.required, Validators.minLength(3)]],
      username: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(20)]],
      correo: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, this.passwordValidator.bind(this)]],
      confirmPassword: ['', Validators.required],
      telefono: ['', [Validators.required, Validators.minLength(7), Validators.maxLength(15)]],
      cui: ['', [Validators.required, Validators.pattern(/^\d{13}$/)]],
      direccion: ['', Validators.required],
      fechaNacimiento: ['', Validators.required],
      rol: ['', Validators.required],
      terminos: [false, Validators.requiredTrue]
    }, {
      validators: this.passwordMatchValidator()
    });
  }

  private passwordValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.value;
    if (!password) return null;

    const hasUpperCase = /[A-Z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasMinLength = password.length >= 8;

    if (!hasUpperCase || !hasNumber || !hasMinLength) {
      return { invalidPassword: true };
    }
    return null;
  }

  private passwordMatchValidator() {
    return (formGroup: AbstractControl): ValidationErrors | null => {
      const password = formGroup.get('password');
      const confirmPassword = formGroup.get('confirmPassword');

      if (password && confirmPassword && password.value !== confirmPassword.value) {
        confirmPassword.setErrors({ passwordMismatch: true });
        return { passwordMismatch: true };
      }

      if (confirmPassword?.hasError('passwordMismatch') && password?.value === confirmPassword?.value) {
        confirmPassword.setErrors(null);
      }
      return null;
    };
  }

 onRegistro(): void {
  if (this.registroForm.invalid) {
    this.notificationService.mostrarError('Por favor completa todos los campos correctamente');
    return;
  }

  this.cargando = true;
  const { confirmPassword, ...datosRegistro } = this.registroForm.value;

  this.authService.registro(datosRegistro).subscribe({
    next: (response) => {
      this.cargando = false;
      this.notificationService.mostrarExito(
        'Registro exitoso. Por favor inicia sesión con tus credenciales.'
      );
      setTimeout(() => {
        this.router.navigate(['/auth/login']);
      }, 2000);
    },
    error: (error) => {
      this.cargando = false;
      console.error('Error en registro:', error);

      // MANEJO ESPECÍFICO DE ERRORES
      if (error.status === 409) {
        // Conflict - Datos duplicados
        const mensaje = error.error?.error || '';
        if (mensaje.includes('USERNAME')) {
          this.notificationService.mostrarError(
            'El nombre de usuario ya está en uso. Por favor elige otro.'
          );
        } else if (mensaje.includes('CORREO')) {
          this.notificationService.mostrarError(
            'El correo ya está registrado. Usa otro correo o inicia sesión.'
          );
        } else {
          this.notificationService.mostrarError(
            'Error: Datos duplicados. Por favor intenta con información diferente.'
          );
        }
      } else if (error.status === 400) {
        // Bad Request
        this.notificationService.mostrarError(
          error.error?.error || 'Por favor verifica los datos ingresados'
        );
      } else if (error.status === 500) {
        // Server Error
        this.notificationService.mostrarError(
          'Error del servidor. Por favor intenta más tarde.'
        );
      } else {
        this.notificationService.mostrarError(
          'Error al registrar. Por favor intenta de nuevo.'
        );
      }
    }
  });
}

  togglePassword(): void {
    this.mostrarPassword = !this.mostrarPassword;
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.registroForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  getErrorMessagePassword(): string {
    const password = this.registroForm.get('password');
    if (password?.hasError('required')) return 'Contraseña requerida';
    if (password?.hasError('invalidPassword')) return 'Debe tener 8+ caracteres, mayúscula y número';
    return '';
  }

  getErrorMessageUsername(): string {
    const username = this.registroForm.get('username');
    if (username?.hasError('required')) return 'Usuario requerido';
    if (username?.hasError('minlength')) return 'Mínimo 3 caracteres';
    if (username?.hasError('maxlength')) return 'Máximo 20 caracteres';
    return '';
  }
}
