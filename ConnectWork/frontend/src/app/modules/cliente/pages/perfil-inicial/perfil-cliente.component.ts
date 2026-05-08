import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { PerfilService } from '../../../../core/services/perfil.service';
import { AuthService } from '../../../../core/services/auth.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { PermiteSoloNumeroDirective } from '../../../../shared/directivas/permite-solo-numero.directive';

@Component({
  selector: 'app-perfil-cliente',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, PermiteSoloNumeroDirective],
  templateUrl: './perfil-cliente.component.html',
  styleUrls: ['./perfil-cliente.component.css']
})
export class PerfilClienteComponent implements OnInit {
  perfilForm!: FormGroup;
  cargando = false;

  constructor(
    private fb: FormBuilder,
    private perfilService: PerfilService,
    private authService: AuthService,
    private router: Router,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.inicializarFormulario();
    this.cargarPerfilExistente();
  }

  private inicializarFormulario(): void {
    this.perfilForm = this.fb.group({
      nombreEmpresa: ['', [Validators.required]],
      sitioWeb: [''],
      descripcion: ['', [Validators.required, Validators.minLength(20)]],
      departamento: ['', Validators.required],
      municipio: [''],
      direccion: [''],
      telefonoContacto: ['', [Validators.required, Validators.minLength(7)]],
      correoContacto: [''],
      moneda: ['GTQ', Validators.required],
      aceptaTerminos: [false, Validators.requiredTrue]
    });
  }

  private cargarPerfilExistente(): void {
    const usuario = this.authService.getCurrentUser();
    if (usuario?.id) {
      this.perfilService.obtenerPerfil().subscribe({
        next: (perfil) => {
          if (perfil) {
            this.perfilForm.patchValue(perfil);
          }
        },
        error: (error) => {
          console.error('Error cargando perfil:', error);
        }
      });
    }
  }

  guardarPerfil(): void {
    if (this.perfilForm.invalid) {
      return;
    }

    this.cargando = true;
    const datosFormulario = this.perfilForm.value;

    this.perfilService.guardarPerfilCliente(datosFormulario).subscribe({
      next: () => {
        this.cargando = false;
        this.notificationService.mostrarExito('Perfil completado correctamente');

        const usuarioActual = this.authService.getCurrentUser();
        if (usuarioActual) {
          usuarioActual.perfilCompleto = true;
          this.authService.updateCurrentUser(usuarioActual);
        }

        this.router.navigate(['/cliente/dashboard']);
      },
      error: (error) => {
        this.cargando = false;
        console.error('Error guardando perfil:', error);
        this.notificationService.mostrarError('Error al guardar perfil');
      }
    });
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.perfilForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }
}
