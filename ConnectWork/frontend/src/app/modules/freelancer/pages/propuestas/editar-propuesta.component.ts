import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { PropuestaService } from '../../../../core/services/propuesta.service';
import { NotificationService } from '../../../../core/services/notification.service';

@Component({
  selector: 'app-editar-propuesta',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './crear-propuesta.component.html',
  styleUrls: ['./propuestas.component.css']
})
export class EditarPropuestaComponent implements OnInit {

  propuestaForm!: FormGroup;
  cargando = false;

  propuestaId!: number;
  proyecto: any = null;

  constructor(
    private fb: FormBuilder,
    private propuestaService: PropuestaService,
    private route: ActivatedRoute,
    private router: Router,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {

    this.propuestaId = Number(this.route.snapshot.params['id']);

    this.propuestaForm = this.fb.group({
      contenido: ['', [Validators.required, Validators.minLength(100)]],
      monto: ['', [Validators.required, Validators.min(100)]],
      plazo: ['', [Validators.required, Validators.min(1)]]
    });

    this.cargarPropuesta();
  }


  cargarPropuesta(): void {

    const proyectos = JSON.parse(
      localStorage.getItem('connectwork_proyectos') || '[]'
    );

    let encontrada: any = null;

    for (const p of proyectos) {

      const propuesta = (p.propuestas || []).find(
        (x: any) => Number(x.id) === Number(this.propuestaId)
      );

      if (propuesta) {
        encontrada = {
          ...propuesta,
          proyecto: p
        };
        break;
      }
    }

    if (!encontrada) return;

    this.propuestaForm.patchValue({
      contenido: encontrada.contenido,
      monto: encontrada.monto,
      plazo: encontrada.plazo
    });

    this.proyecto = encontrada.proyecto;
  }

  enviarPropuesta(): void {

    if (this.propuestaForm.invalid || this.cargando) return;

    this.cargando = true;

    this.propuestaService
      .actualizar(this.propuestaId, this.propuestaForm.value)
      .subscribe({
        next: () => {

          this.cargando = false;

          this.notificationService.mostrarExito(
            'Propuesta actualizada correctamente'
          );

          this.router.navigate(['/freelancer/propuestas']);
        },
        error: () => {

          this.cargando = false;

          this.notificationService.mostrarError(
            'Error al actualizar propuesta'
          );
        }
      });
  }
}
