import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
  AbstractControl,
  ValidationErrors,
  ValidatorFn
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { PropuestaService } from '../../../../core/services/propuesta.service';
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
    private route: ActivatedRoute,
    private router: Router,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {

    const proyectoId = Number(this.route.snapshot.params['proyectoId']);

    if (proyectoId) {
      this.cargarProyecto(proyectoId);
    }


    this.initForm();
  }


  private initForm(): void {
    this.propuestaForm = this.fb.group({
      contenido: ['', [Validators.required, Validators.minLength(100)]],
      monto: ['', [
        Validators.required,
        Validators.min(100),
        this.validarPresupuestoMaximo()
      ]],
      plazo: ['', [Validators.required, Validators.min(1)]]
    });
  }


  cargarProyecto(id: number): void {
    const proyectos = JSON.parse(
      localStorage.getItem('connectwork_proyectos') || '[]'
    );
    this.proyecto = proyectos.find((p: any) => Number(p.id) === Number(id));


    if (this.proyecto) {
      this.propuestaForm?.get('monto')?.updateValueAndValidity();
    }
  }


  private validarPresupuestoMaximo(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!this.proyecto || !control.value) return null;

      const montoOfertado = control.value;
      const maximoPermitido = this.proyecto.presupuestoMaximo;

      return montoOfertado > maximoPermitido
        ? { presupuestoExcedido: true }
        : null;
    };
  }


  enviarPropuesta(): void {
    if (this.propuestaForm.invalid || !this.proyecto || this.cargando) return;

    this.cargando = true;
    const payload = this.propuestaForm.getRawValue();

    this.propuestaService
      .enviar(payload, this.proyecto.id)
      .subscribe({
        next: (res) => {
          this.cargando = false;
          if (!res) {
            this.notificationService.mostrarError('No se pudo enviar la propuesta');
            return;
          }

          this.notificationService.mostrarExito('Propuesta enviada correctamente');
          this.router.navigate(['/freelancer/propuestas']);
        },
        error: (err) => {
          this.cargando = false;

          this.notificationService.mostrarError(err.message || 'Error al enviar propuesta');
        }
      });
  }
}
