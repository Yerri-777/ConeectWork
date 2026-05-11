import {
  Component,
  OnInit,
  OnDestroy
} from '@angular/core';

import {
  CommonModule
} from '@angular/common';

import {
  FormsModule,
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators
} from '@angular/forms';

import {
  Router,
  RouterModule,
  RouterLink
} from '@angular/router';

import {
  Subject
} from 'rxjs';

import {
  takeUntil
} from 'rxjs/operators';

import {
  AuthService
} from '../../../../core/services/auth.service';

import {
  NotificationService
} from '../../../../core/services/notification.service';

@Component({
  selector: 'app-login',

  standalone: true,

  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    RouterLink
  ],

  templateUrl: './login.component.html',

  styleUrls: ['./login.component.css']
})
export class LoginComponent
implements OnInit, OnDestroy {

  loginForm!: FormGroup;

  cargando = false;

  mostrarPassword = false;

  private destroy$ =
    new Subject<void>();

  constructor(

    private fb: FormBuilder,

    private authService:
      AuthService,

    private router: Router,

    private notificationService:
      NotificationService

  ) {}

  // =====================================================
  // INIT
  // =====================================================

  ngOnInit(): void {

    console.log(
      '[LoginComponent] Inicializando login...'
    );

    /**
     * RESTAURAR SESIÓN
     */
    this.authService.restoreSession();

    /**
     * FORM
     */
    this.inicializarFormulario();

    /**
     * SI YA EXISTE SESIÓN
     */
    setTimeout(() => {

      if (
        this.authService.isLoggedIn()
      ) {

        const usuario =
          this.authService.getCurrentUser();

        if (usuario) {

          console.log(
            '[LoginComponent] Usuario ya autenticado'
          );

          this.redirigirSegunRol(
            usuario.rol
          );
        }
      }

    }, 300);
  }

  // =====================================================
  // DESTROY
  // =====================================================

  ngOnDestroy(): void {

    this.destroy$.next();

    this.destroy$.complete();
  }

  // =====================================================
  // FORM
  // =====================================================

  private inicializarFormulario(): void {

    this.loginForm =
      this.fb.group({

        username: [

          '',

          [
            Validators.required,
            Validators.minLength(3)
          ]
        ],

        password: [

          '',

          [
            Validators.required,
            Validators.minLength(6)
          ]
        ],

        recuerdame: [false]
      });
  }

  // =====================================================
  // LOGIN
  // =====================================================

  onLogin(): void {

    if (this.loginForm.invalid) {

      console.warn(
        '[LoginComponent] Form inválido'
      );

      this.loginForm.markAllAsTouched();

      this.notificationService
        .mostrarError(
          'Completa todos los campos'
        );

      return;
    }

    if (this.cargando) {
      return;
    }

    this.cargando = true;

    const {

      username,
      password

    } = this.loginForm.value;

    console.log(
      '[LoginComponent] Login:',
      username
    );

    this.authService.login(
      username,
      password
    )

    .pipe(
      takeUntil(this.destroy$)
    )

    .subscribe({

      next: (response) => {

        console.log(
          '[LoginComponent] ✓ Login exitoso'
        );

        console.log(
          '[LoginComponent] RESPONSE:',
          response
        );

        const usuario =
          this.authService
            .getCurrentUser();

        if (!usuario) {

          console.error(
            '[LoginComponent] Usuario NULL después login'
          );

          this.notificationService
            .mostrarError(
              'Error obteniendo usuario'
            );

          this.cargando = false;

          return;
        }

        this.notificationService
          .mostrarExito(
            `Bienvenido ${usuario.nombreCompleto}`
          );

        /**
         * IMPORTANTE:
         * Esperar estabilización:
         * localStorage
         * interceptor
         * auth state
         */
        setTimeout(() => {

          this.redirigirSegunRol(
            usuario.rol
          );

        }, 400);

        this.cargando = false;
      },

      error: (error) => {

        console.error(
          '[LoginComponent] ERROR LOGIN:',
          error
        );

        this.cargando = false;

        if (error.status === 401) {

          this.notificationService
            .mostrarError(
              'Credenciales inválidas'
            );
        }

        else if (
          error.status === 403
        ) {

          this.notificationService
            .mostrarError(
              'Usuario inactivo'
            );
        }

        else if (
          error.error?.mensaje
        ) {

          this.notificationService
            .mostrarError(
              error.error.mensaje
            );
        }

        else {

          this.notificationService
            .mostrarError(
              'Error interno del servidor'
            );
        }

        /**
         * Limpiar password
         */
        this.loginForm.patchValue({

          password: ''
        });
      }
    });
  }

  // =====================================================
  // PASSWORD
  // =====================================================

  togglePassword(): void {

    this.mostrarPassword =
      !this.mostrarPassword;
  }

  // =====================================================
  // DEMO
  // =====================================================

  usarCredencialDemo(
    username: string,
    password: string
  ): void {

    console.log(
      '[LoginComponent] Demo:',
      username
    );

    this.loginForm.patchValue({

      username,

      password
    });
  }

  // =====================================================
  // REDIRECCIÓN
  // =====================================================

  private redirigirSegunRol(
    rol: string
  ): void {

    const rolNormalizado =
      rol?.trim()?.toUpperCase();

    console.log(
      '[LoginComponent] Rol:',
      rolNormalizado
    );

    switch (rolNormalizado) {

      case 'ADMIN':

        console.log(
          '[LoginComponent] → ADMIN DASHBOARD'
        );

        this.router.navigate([
          '/admin/dashboard'
        ]);

        break;

      case 'CLIENTE':

        console.log(
          '[LoginComponent] → CLIENTE DASHBOARD'
        );

        this.router.navigate([
          '/cliente/dashboard'
        ]);

        break;

      case 'FREELANCER':

        console.log(
          '[LoginComponent] → FREELANCER DASHBOARD'
        );

        this.router.navigate([
          '/freelancer/dashboard'
        ]);

        break;

      default:

        console.warn(
          '[LoginComponent] Rol inválido:',
          rolNormalizado
        );

        this.router.navigate([
          '/'
        ]);
    }
  }

  // =====================================================
  // VALIDACIONES
  // =====================================================

  isFieldInvalid(
    fieldName: string
  ): boolean {

    const field =
      this.loginForm.get(fieldName);

    return !!(

      field &&

      field.invalid &&

      (
        field.dirty ||
        field.touched
      )
    );
  }

  getFieldError(
    fieldName: string
  ): string {

    const field =
      this.loginForm.get(fieldName);

    if (
      !field ||
      !field.errors
    ) {

      return '';
    }

    if (
      field.errors['required']
    ) {

      return `${fieldName} es requerido`;
    }

    if (
      field.errors['minlength']
    ) {

      return `${fieldName} debe tener mínimo ${field.errors['minlength'].requiredLength} caracteres`;
    }

    return 'Campo inválido';
  }
}
