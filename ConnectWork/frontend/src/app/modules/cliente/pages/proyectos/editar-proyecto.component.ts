import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ProyectoService } from '../../../../core/services/proyecto.service';
import { NotificationService } from '../../../../core/services/notification.service';

@Component({
  selector: 'app-editar-proyecto',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './editar-proyecto.component.html',
  styleUrls: ['./proyectos.component.css'], // Reutiliza los estilos compartidos
})
export class EditarProyectoComponent implements OnInit {
  proyectoForm!: FormGroup;
  proyectoId!: string;
  cargando = true;
  guardando = false;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private proyectoService: ProyectoService,
    private notificationService: NotificationService,
  ) {
    this.inicializarFormulario();
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.proyectoId = id;
      this.cargarProyecto();
    } else {
      this.router.navigate(['/cliente/proyectos']);
    }
  }

  private inicializarFormulario(): void {
    this.proyectoForm = this.fb.group({
      titulo: ['', [Validators.required, Validators.minLength(5)]],
      descripcion: ['', [Validators.required, Validators.minLength(50)]],
      presupuesto: [0, [Validators.required, Validators.min(10)]],
      categoria: ['', Validators.required],
    });
  }

  private cargarProyecto(): void {
    this.proyectoService.obtenerPorId(this.proyectoId).subscribe({
      next: (proyecto) => {
        this.proyectoForm.patchValue({
          titulo: proyecto.titulo,
          descripcion: proyecto.descripcion,
          presupuestoMin: proyecto.presupuestoMin,
          presupuestoMax: proyecto.presupuestoMax,
          categoria: proyecto.categoriaId,
        });
        this.cargando = false;
      },
      error: (err) => {
        this.notificationService.mostrarError('No se pudo cargar el proyecto');
        this.router.navigate(['/cliente/proyectos']);
      },
    });
  }

  onSubmit(): void {
    if (this.proyectoForm.invalid) return;

    this.guardando = true;
    this.proyectoService
      .actualizar(this.proyectoId, this.proyectoForm.value)
      .subscribe({
        next: () => {
          this.notificationService.mostrarExito(
            'Proyecto actualizado con éxito',
          );
          this.router.navigate(['/cliente/proyectos/detalle', this.proyectoId]);
        },
        error: (err) => {
          this.guardando = false;
          this.notificationService.mostrarError(
            'Error al actualizar el proyecto',
          );
        },
      });
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.proyectoForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  cancelar(): void {
    this.router.navigate(['/cliente/proyectos/detalle', this.proyectoId]);
  }
}
