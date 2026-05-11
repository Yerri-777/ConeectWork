import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormsModule,
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
  AbstractControl,
  ValidationErrors
} from '@angular/forms';

import { Router, RouterModule } from '@angular/router';

import { AuthService } from '../../../../core/services/auth.service';
import { NotificationService } from '../../../../core/services/notification.service';

@Component({
  selector: 'app-registro',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule
  ],
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

      nombreCompleto: [
        '',
        [
          Validators.required,
          Validators.minLength(3)
        ]
      ],

      username: [
        '',
        [
          Validators.required,
          Validators.minLength(3),
          Validators.maxLength(20)
        ]
      ],

      correo: [
        '',
        [
          Validators.required,
          Validators.email
        ]
      ],

      password: [
        '',
        [
          Validators.required,
          this.passwordValidator.bind(this)
        ]
      ],

      confirmPassword: [
        '',
        Validators.required
      ],

      telefono: [
        '',
        [
          Validators.required,
          Validators.minLength(7),
          Validators.maxLength(15)
        ]
      ],

      cui: [
        '',
        [
          Validators.required,
          Validators.pattern(/^\d{13}$/)
        ]
      ],

      direccion: [
        '',
        Validators.required
      ],

      fechaNacimiento: [
        '',
        Validators.required
      ],

      rol: [
        'CLIENTE',
        Validators.required
      ],

      terminos: [
        false,
        Validators.requiredTrue
      ]

    }, {
      validators: this.passwordMatchValidator()
    });
  }

  private passwordValidator(
    control: AbstractControl
  ): ValidationErrors | null {

    const password = control.value;

    if (!password) {
      return null;
    }

    const hasUpperCase =
      /[A-Z]/.test(password);

    const hasNumber =
      /[0-9]/.test(password);

    const hasMinLength =
      password.length >= 8;

    if (
      !hasUpperCase ||
      !hasNumber ||
      !hasMinLength
    ) {

      return {
        invalidPassword: true
      };
    }

    return null;
  }

  private passwordMatchValidator() {

    return (
      formGroup: AbstractControl
    ): ValidationErrors | null => {

      const password =
        formGroup.get('password');

      const confirmPassword =
        formGroup.get('confirmPassword');

      if (
        password &&
        confirmPassword &&
        password.value !== confirmPassword.value
      ) {

        confirmPassword.setErrors({
          passwordMismatch: true
        });

        return {
          passwordMismatch: true
        };
      }

      if (
        confirmPassword?.hasError('passwordMismatch') &&
        password?.value === confirmPassword?.value
      ) {

        confirmPassword.setErrors(null);
      }

      return null;
    };
  }

  onRegistro(): void {

    /**
     * VALIDAR FORMULARIO
     */
    if (this.registroForm.invalid) {

      this.notificationService.mostrarError(
        'Por favor completa todos los campos correctamente'
      );

      return;
    }

    this.cargando = true;

    /**
     * Extraer datos y eliminar
     * campos innecesarios
     */
    const {
      confirmPassword,
      terminos,
      ...datosRegistro
    } = this.registroForm.value;

    /**
     * Normalizar rol
     */
    datosRegistro.rol =
      datosRegistro.rol.toUpperCase();

    console.log(
      '[RegistroComponent.onRegistro] Datos enviados:',
      datosRegistro
    );

    this.authService
      .registro(datosRegistro)
      .subscribe({

        next: (response) => {

          this.cargando = false;

          console.log(
            '[RegistroComponent.onRegistro] ✓ Registro exitoso:',
            response
          );

          this.notificationService.mostrarExito(
            '¡Cuenta creada con éxito!'
          );

          /**
           * Si el backend devuelve token,
           * ya quedó logueado automáticamente
           */
          if (response.token || response.jwt) {

            console.log(
              '[RegistroComponent.onRegistro] ✓ Usuario autenticado automáticamente'
            );

            setTimeout(() => {

              /**
               * Redirigir según rol
               */
              const rol =
                localStorage.getItem(
                  'connectwork_rol'
                );

              if (rol === 'ADMIN') {

                this.router.navigate([
                  '/admin'
                ]);

              } else if (
                rol === 'FREELANCER'
              ) {

                this.router.navigate([
                  '/freelancer/dashboard'
                ]);

              } else {

                this.router.navigate([
                  '/cliente/dashboard'
                ]);
              }

            }, 1500);

          } else {

            /**
             * Si NO devuelve token,
             * ir al login manual
             */
            console.warn(
              '[RegistroComponent.onRegistro] ⚠ Backend no devolvió token'
            );

            setTimeout(() => {

              this.router.navigate([
                '/auth/login'
              ]);

            }, 1500);
          }
        },

        error: (error) => {

          this.cargando = false;

          console.error(
            '[RegistroComponent.onRegistro] ✗ Error completo:',
            error
          );

          console.error(
            'Detalle del error:',
            error.error
          );

          let mensajeError =
            'Error en los datos. Verifica los campos.';

          /**
           * ERROR 409
           */
          if (error.status === 409) {

            const mensaje =
              error.error?.mensaje ||
              error.error?.error ||
              '';

            if (
              mensaje.includes('nombre de usuario')
            ) {

              mensajeError =
                'El nombre de usuario ya está en uso.';

            } else if (
              mensaje.includes('correo')
            ) {

              mensajeError =
                'El correo ya está registrado.';

            } else {

              mensajeError =
                'Ya existe una cuenta con esos datos.';
            }
          }

          /**
           * ERROR 400
           */
          else if (
            error.status === 400 &&
            error.error
          ) {

            mensajeError =
              error.error.mensaje ||
              error.error.error ||
              mensajeError;
          }

          /**
           * ERROR 500
           */
          else if (
            error.status === 500
          ) {

            mensajeError =
              'Error interno del servidor. Intenta más tarde.';
          }

          /**
           * ERROR DESCONOCIDO
           */
          else {

            mensajeError =
              'Error al registrar. Por favor intenta nuevamente.';
          }

          this.notificationService
            .mostrarError(mensajeError);
        }
      });
  }

  togglePassword(): void {

    this.mostrarPassword =
      !this.mostrarPassword;
  }

  isFieldInvalid(
    fieldName: string
  ): boolean {

    const field =
      this.registroForm.get(fieldName);

    return !!(
      field &&
      field.invalid &&
      (field.dirty || field.touched)
    );
  }

  getErrorMessagePassword(): string {

    const password =
      this.registroForm.get('password');

    if (
      password?.hasError('required')
    ) {
      return 'Contraseña requerida';
    }

    if (
      password?.hasError('invalidPassword')
    ) {
      return 'Debe tener 8+ caracteres, mayúscula y número';
    }

    return '';
  }

  getErrorMessageUsername(): string {

    const username =
      this.registroForm.get('username');

    if (
      username?.hasError('required')
    ) {
      return 'Usuario requerido';
    }

    if (
      username?.hasError('minlength')
    ) {
      return 'Mínimo 3 caracteres';
    }

    if (
      username?.hasError('maxlength')
    ) {
      return 'Máximo 20 caracteres';
    }

    return '';
  }

  getErrorMessageCUI(): string {

    const cui =
      this.registroForm.get('cui');

    if (
      cui?.hasError('required')
    ) {
      return 'CUI requerido';
    }

    if (
      cui?.hasError('pattern')
    ) {
      return 'CUI debe ser 13 dígitos';
    }

    return '';
  }

  getErrorMessageTelefono(): string {

    const telefono =
      this.registroForm.get('telefono');

    if (
      telefono?.hasError('required')
    ) {
      return 'Teléfono requerido';
    }

    if (
      telefono?.hasError('minlength')
    ) {
      return 'Mínimo 7 caracteres';
    }

    if (
      telefono?.hasError('maxlength')
    ) {
      return 'Máximo 15 caracteres';
    }

    return '';
  }

  getErrorMessageEmail(): string {

    const correo =
      this.registroForm.get('correo');

    if (
      correo?.hasError('required')
    ) {
      return 'Correo requerido';
    }

    if (
      correo?.hasError('email')
    ) {
      return 'Correo no válido';
    }

    return '';
  }

  getErrorMessageNombreCompleto(): string {

    const nombreCompleto =
      this.registroForm.get('nombreCompleto');

    if (
      nombreCompleto?.hasError('required')
    ) {
      return 'Nombre completo requerido';
    }

    if (
      nombreCompleto?.hasError('minlength')
    ) {
      return 'Mínimo 3 caracteres';
    }

    return '';
  }
}
