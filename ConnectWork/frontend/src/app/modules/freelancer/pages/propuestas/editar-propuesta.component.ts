import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { PropuestaService } from '../../../../core/services/propuesta.service';
import { NotificationService } from '../../../../core/services/notification.service';

@Component({
  selector: 'app-editar-propuesta',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './crear-propuesta.component.html', // Reutiliza el HTML de crear
  styleUrls: ['./propuestas.component.css']
})
export class EditarPropuestaComponent implements OnInit {
  propuestaForm!: FormGroup;
  cargando = false;
  propuestaId!: string;
  proyecto: any = null; // compatibilizar con plantilla que usa `proyecto`

  constructor(
    private fb: FormBuilder,
    private propuestaService: PropuestaService,
    private route: ActivatedRoute,
    private router: Router,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.propuestaId = this.route.snapshot.params['id'];
    this.propuestaForm = this.fb.group({
      contenido: ['', [Validators.required, Validators.minLength(100)]],
      monto: ['', [Validators.required, Validators.min(100)]],
      plazo: ['', [Validators.required, Validators.min(1)]]
    });
    this.cargarPropuesta();
  }

  cargarPropuesta(): void {
    this.propuestaService.obtenerMias().subscribe((propuestas: any[]) => {
      const encontrada = propuestas.find((p: any) => p.id === this.propuestaId);
      if (encontrada) this.propuestaForm.patchValue(encontrada);
      // Si la propuesta contiene información del proyecto, asignarla para la plantilla
      if (encontrada && encontrada.tituloProyecto) {
        this.proyecto = {
          titulo: encontrada.tituloProyecto,
          descripcion: encontrada.descripcion || '',
          presupuestoMinimo: encontrada.presupuestoMin || 0,
          presupuestoMaximo: encontrada.presupuestoMax || 0
        };
      }
    });
  }

  enviarPropuesta(): void {
    this.cargando = true;
    this.propuestaService.actualizar(this.propuestaId, this.propuestaForm.value).subscribe({
      next: () => {
        this.notificationService.mostrarExito('Propuesta actualizada');
        this.router.navigate(['/freelancer/propuestas']);
      }
    });
  }
}
