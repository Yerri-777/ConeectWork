import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef
} from '@angular/core';

import { CommonModule } from '@angular/common';

import {
  ActivatedRoute,
  Router,
  RouterModule
} from '@angular/router';

import { NotificationService } from '../../../../core/services/notification.service';

@Component({
  selector: 'app-detalle-propuesta',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule
  ],
  templateUrl: './detalle-propuesta.component.html',
  styleUrls: ['./propuestas.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DetallePropuestaComponent implements OnInit {

  propuesta: any = null;
  cargando = true;
  aceptando = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private notificationService: NotificationService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');

    if (!id) {
      this.router.navigate(['/cliente/propuestas']);
      return;
    }

    this.cargarPropuesta(id);
  }

  private cargarPropuesta(id: string): void {
    try {

      const proyectosRaw = localStorage.getItem('connectwork_proyectos');
      const proyectos = proyectosRaw ? JSON.parse(proyectosRaw) : [];

      let encontrado = null;

      for (const proyecto of proyectos) {
        const prop = (proyecto.propuestas || []).find(
          (p: any) => String(p.id) === String(id)
        );

        if (prop) {

          encontrado = {
            ...prop,
            proyectoId: proyecto.id,
            proyectoTitulo: proyecto.titulo,
            montoOferta: prop.monto,
            tiempoEstimado: prop.plazo,
            descripcion: prop.contenido,
            freelancerNombre: prop.freelancer?.nombre || 'Freelancer Demo',
            clienteNombre: proyecto.nombreCliente || 'Cliente Demo'
          };
          break;
        }
      }

      if (!encontrado) {
        this.notificationService.mostrarError('Propuesta no encontrada');
        this.volver();
        return;
      }

      this.propuesta = encontrado;
      this.cargando = false;
      this.cdr.markForCheck();

    } catch (error) {
      console.error('[DetallePropuesta] Error:', error);
      this.notificationService.mostrarError('Error cargando propuesta');
      this.volver();
    }
  }

  aceptarPropuesta(): void {
    if (!this.propuesta || this.aceptando) return;

    const confirmar = confirm(
      'Al aceptar la propuesta se creará un contrato automáticamente y el proyecto pasará a estar EN PROGRESO. ¿Deseas continuar?'
    );

    if (!confirmar) return;

    this.aceptando = true;

    try {
      const proyectosRaw = localStorage.getItem('connectwork_proyectos');
      let proyectos = proyectosRaw ? JSON.parse(proyectosRaw) : [];


      proyectos = proyectos.map((proj: any) => {
        if (proj.id === this.propuesta.proyectoId) {

          proj.estado = 'EN_PROGRESO';

          // Actualizamos las propuestas de este proyecto
          proj.propuestas = (proj.propuestas || []).map((p: any) => {
            if (String(p.id) === String(this.propuesta.id)) {
              return { ...p, estado: 'ACEPTADA', fechaAceptacion: new Date() };
            }
            // Las demás propuestas se rechazan automáticamente
            return { ...p, estado: 'RECHAZADA' };
          });
        }
        return proj;
      });

      localStorage.setItem('connectwork_proyectos', JSON.stringify(proyectos));


      const contratosStorage = localStorage.getItem('connectwork_contratos');
      const contratos = contratosStorage ? JSON.parse(contratosStorage) : [];

      const nuevoContrato = {
        id: Date.now(),
        propuestaId: this.propuesta.id,
        proyectoId: this.propuesta.proyectoId,
        freelancerNombre: this.propuesta.freelancerNombre,
        clienteNombre: this.propuesta.clienteNombre,
        proyectoTitulo: this.propuesta.proyectoTitulo,
        monto: this.propuesta.montoOferta,
        fechaInicio: new Date(),
        estado: 'ACTIVO'
      };

      contratos.unshift(nuevoContrato);
      localStorage.setItem('connectwork_contratos', JSON.stringify(contratos));

      this.notificationService.mostrarExito('Propuesta aceptada y contrato generado');

      setTimeout(() => {
        this.router.navigate(['/cliente/contratos']);
      }, 500);

    } catch (error) {
      console.error('[DetallePropuesta] Error aceptando:', error);
      this.notificationService.mostrarError('No se pudo procesar la aceptación');
    } finally {
      this.aceptando = false;
      this.cdr.markForCheck();
    }
  }

  volver(): void {
    this.router.navigate(['/cliente/propuestas']);
  }
}
