import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ActivatedRoute,
  Router,
  RouterModule
} from '@angular/router';

import { EntregaService } from '../../../../core/services/entrega.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { SaldoService } from '../../../../core/services/saldo.service';

@Component({
  selector: 'app-aprobar-entrega',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule
  ],
  templateUrl: './aprobar-entrega.component.html',
  styleUrls: ['./entregas.component.css']
})
export class AprobarEntregaComponent
  implements OnInit {

  entregaId: string | null = null;

  entrega: any = null;

  cargando = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private entregaService: EntregaService,
    private saldoService: SaldoService,
    private notification: NotificationService
  ) {}

  ngOnInit(): void {

    this.entregaId =
      this.route.snapshot.paramMap.get('id');

    console.log(
      '[AprobarEntrega.ngOnInit] ID recibido:',
      this.entregaId
    );

    if (this.entregaId) {

      this.obtenerEntrega();

    } else {

      this.notification.mostrarError(
        'ID de entrega no válido'
      );

      this.router.navigate([
        '/cliente/entregas'
      ]);
    }
  }

  private obtenerEntrega(): void {

    this.entregaService
      .obtenerPorId(this.entregaId!)
      .subscribe({

        next: (data) => {

          this.entrega = data;

          console.log(
            '[AprobarEntrega] ✓ Datos cargados:',
            data
          );

          /**
           * VALIDAR freelancerId
           */
          if (!data.freelancerId) {

            console.warn(
              '[AprobarEntrega] ⚠ Esta entrega no tiene freelancerId asociado'
            );

          } else {

            console.log(
              '[AprobarEntrega] ✓ Freelancer ID:',
              data.freelancerId
            );
          }
        },

        error: (error) => {

          console.error(
            '[AprobarEntrega] ✗ Error cargando entrega:',
            error
          );

          this.notification.mostrarError(
            'No se pudo cargar la información de la entrega'
          );

          this.router.navigate([
            '/cliente/entregas'
          ]);
        }
      });
  }

  procesarAprobacion(): void {

    /**
     * VALIDAR
     */
    if (
      !this.entregaId ||
      this.cargando
    ) {
      return;
    }

    this.cargando = true;

    console.log(
      '[AprobarEntrega] Procesando aprobación...'
    );

    this.entregaService
      .aprobarYFinalizar(this.entregaId)
      .subscribe({

        next: (res: any) => {

          console.log(
            '[AprobarEntrega] ✓ Respuesta aprobación:',
            res
          );

          /**
           * DESCONTAR SALDO AUTOMÁTICAMENTE
           */
          this.saldoService
            .debitarPago(
              Number(this.entrega?.monto || 0),
              this.entrega?.proyectoTitulo || 'Proyecto'
            )
            .subscribe({
              next: () => {
                console.log(
                  '[AprobarEntrega] ✓ Saldo debitado correctamente'
                );
              },
              error: (err) => {
                console.warn(
                  '[AprobarEntrega] ⚠ Error debitando saldo:',
                  err
                );
              }
            });

          this.notification.mostrarExito(
            '¡Entrega pagada y aprobada!'
          );

          /**
           * PRIORIDAD DE RESCATE
           * DEL FREELANCER ID
           */
          const fId =

            res?.freelancerId ||

            this.entrega?.freelancerId ||

            this.entrega?.contrato?.freelancerId ||

            this.entrega?.contrato?.freelancer?.id ||

            null;

          console.log(
            ' Navegando con ID confirmado:',
            fId
          );

          /**
           * VALIDAR ID
           */
          if (!fId) {

            console.warn(
              '[AprobarEntrega]  No se pudo detectar freelancerId'
            );
          }

          /**
           * NAVEGAR A CALIFICACIÓN
           */
          this.router.navigate(

            [
              '/cliente/entregas/calificar',
              this.entregaId
            ],

            {
              queryParams: {
                freelancerId: fId
              }
            }
          );
        },

        error: (err) => {

          console.error(
            '[AprobarEntrega] ✗ Error procesando aprobación:',
            err
          );

          this.cargando = false;

          this.notification.mostrarError(
            'Error al procesar el pago.'
          );
        }
      });
  }

  volver(): void {

    console.log(
      '[AprobarEntrega] Volviendo al listado'
    );

    this.router.navigate([
      '/cliente/entregas'
    ]);
  }
}
