import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { PropuestaService } from '../../../../core/services/propuesta.service';
import { ProyectoService } from '../../../../core/services/proyecto.service';
import { NotificationService } from '../../../../core/services/notification.service';

@Component({
  selector: 'app-crear-propuesta',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './crear-propuesta.component.html',
  styleUrls: ['./propuestas.component.css']
})
export class CrearPropuestaComponent implements OnInit {
  propuestaForm!: FormGroup;
  cargando = false;
  proyecto: any = null;

  constructor(
    private fb: FormBuilder,
    private propuestaService: PropuestaService,
    private proyectoService: ProyectoService,
    private route: ActivatedRoute,
    private router: Router,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.propuestaForm = this.fb.group({
      contenido: ['', [Validators.required, Validators.minLength(100)]],
      monto: ['', [Validators.required, Validators.min(100)]],
      plazo: ['', [Validators.required, Validators.min(1)]]
    });

    const proyectoId = this.route.snapshot.params['proyectoId'];
    if (proyectoId) this.cargarProyecto(proyectoId);
  }

  cargarProyecto(id: string): void {
    this.proyectoService.obtenerPorId(id).subscribe(data => this.proyecto = data);
  }

  enviarPropuesta(): void {
    if (this.propuestaForm.invalid) return;
    this.cargando = true;
    this.propuestaService.enviar(this.propuestaForm.value).subscribe({
      next: () => {
        this.notificationService.mostrarExito('Propuesta enviada');
        this.router.navigate(['/freelancer/propuestas']);
      }
    });
  }
}
