import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { PerfilService } from '../../../../core/services/perfil.service';
import { AuthService } from '../../../../core/services/auth.service';
import { HabilidadService } from '../../../../core/services/habilidad.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { PermiteSoloNumeroDirective } from '../../../../shared/directivas/permite-solo-numero.directive';

@Component({
  selector: 'app-perfil-freelancer',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, PermiteSoloNumeroDirective],
  templateUrl: './perfil-freelancer.component.html',
  styleUrls: ['./perfil-freelancer.component.css']
})
export class PerfilFreelancerComponent implements OnInit {
  perfilForm!: FormGroup;
  cargando = false;
  habilidades: any[] = [];
  habilidadesSeleccionadas: string[] = [];

  constructor(
    private fb: FormBuilder,
    private perfilService: PerfilService,
    private authService: AuthService,
    private habilidadService: HabilidadService,
    private router: Router,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.inicializarFormulario();
    this.cargarHabilidades();
    this.cargarPerfilExistente();
  }

  private inicializarFormulario(): void {
    this.perfilForm = this.fb.group({
      titulos: ['', Validators.required],
      biografia: ['', [Validators.required, Validators.minLength(50)]],
      portafolio: [''],
      aniosExperiencia: [''],
      nivelExperiencia: [''],
      habilidadesIds: [[]],
      departamento: [''],
      municipio: [''],
      telefonoContacto: [''],
      tarifaHoraria: ['', [Validators.required, Validators.min(50)]],
      moneda: ['GTQ', Validators.required],
      aceptaTerminos: [false, Validators.requiredTrue]
    });
  }

  private cargarHabilidades(): void {
    this.habilidadService.listar().subscribe({
      next: (habilidades) => {
        this.habilidades = habilidades.filter(h => h.activo);
      }
    });
  }

  private cargarPerfilExistente(): void {
    const usuario = this.authService.getCurrentUser();
    if (usuario?.id) {
      this.perfilService.obtenerPerfil().subscribe({
        next: (perfil) => {
          this.perfilForm.patchValue(perfil);
          this.habilidadesSeleccionadas = perfil.habilidadesIds || [];
        }
      });
    }
  }

  toggleHabilidad(event: any): void {
    const habilidadId = event.target.value;
    if (event.target.checked) {
      this.habilidadesSeleccionadas.push(habilidadId);
    } else {
      this.habilidadesSeleccionadas = this.habilidadesSeleccionadas.filter(h => h !== habilidadId);
    }
    this.perfilForm.patchValue({ habilidadesIds: this.habilidadesSeleccionadas });
  }

  guardarPerfil(): void {
    if (this.perfilForm.invalid) {
      return;
    }

    this.cargando = true;
    const datosFormulario = this.perfilForm.value;
    this.perfilService.guardarPerfilFreelancer(datosFormulario).subscribe({
      next: () => {
        this.cargando = false;
        this.notificationService.mostrarExito('Perfil completado correctamente');

        const usuarioActual = this.authService.getCurrentUser();
        if (usuarioActual) {
          usuarioActual.perfilCompleto = true;
          this.authService.updateCurrentUser(usuarioActual);
        }

        this.router.navigate(['/freelancer/dashboard']);
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
