import {
  Component,
  OnInit
} from '@angular/core';

import {
  CommonModule,
  DecimalPipe
} from '@angular/common';

import {
  RouterModule
} from '@angular/router';

import {
  SaldoService
} from '../../../../core/services/saldo.service';

import {
  NotificationService
} from '../../../../core/services/notification.service';

@Component({
  selector: 'app-saldo-freelancer',
  standalone: true,
  imports: [
    CommonModule,
    DecimalPipe,
    RouterModule
  ],
  templateUrl:
    './saldo-freelancer.component.html',

  styleUrls: [
    './saldo.component.css'
  ]
})
export class SaldoFreelancerComponent
  implements OnInit {

  /**
   * SALDO DISPONIBLE
   */
  saldo: number = 0;

  /**
   * HISTORIAL
   */
  historial: any[] = [];

  /**
   * ESTADO LOADING
   */
  loading = false;

  /**
   * TOTALES
   */
  totalIngresos = 0;
  totalEgresos = 0;

  /**
   * DATOS FREELANCER
   */
  freelancer: any = null;

  constructor(

    private saldoService:
      SaldoService,

    private notification:
      NotificationService

  ) {}

  ngOnInit(): void {

    console.log(
      '[SaldoFreelancer] Inicializando componente'
    );

    this.obtenerSesion();
    this.cargarSaldo();
  }

  /**
   * OBTENER SESIÓN ACTUAL
   */
  obtenerSesion(): void {

    try {

      this.freelancer = JSON.parse(

        localStorage.getItem(
          'usuario'
        )

        ||

        localStorage.getItem(
          'connectwork_user'
        )

        ||

        '{}'
      );

      console.log(
        '[SaldoFreelancer] Sesión freelancer:',
        this.freelancer
      );

    } catch (error) {

      console.error(
        '[SaldoFreelancer] Error obteniendo sesión',
        error
      );
    }
  }

  /**
   * CARGAR SALDO
   */
  cargarSaldo(): void {

    this.loading = true;

    console.log(
      '[SaldoFreelancer] Consultando saldo...'
    );

    /**
     * PEQUEÑO DELAY
     * PARA ASEGURAR
     * STORAGE SINCRONIZADO
     */
    setTimeout(() => {

      this.saldoService
        .consultarSaldo()
        .subscribe({

          next: (res: any) => {

            console.log(
              '[SaldoFreelancer] Respuesta:',
              res
            );

            /**
             * SALDO
             */
            this.saldo =
              Number(
                res?.disponible
              ) || 0;

            /**
             * HISTORIAL
             */
            this.historial =
              Array.isArray(
                res?.historial
              )
                ? res.historial
                : [];

            /**
             * ORDENAR
             * MÁS RECIENTES PRIMERO
             */
            this.historial.sort(

              (
                a: any,
                b: any
              ) =>

                new Date(
                  b.fecha
                ).getTime()

                -

                new Date(
                  a.fecha
                ).getTime()
            );

            /**
             * RECALCULAR SALDO
             * DESDE HISTORIAL
             * PARA EVITAR
             * DESINCRONIZACIONES
             */
            const ingresos =

              this.historial
                .filter(
                  (m: any) =>
                    m.tipo ===
                    'INGRESO'
                )
                .reduce(
                  (
                    total: number,
                    mov: any
                  ) =>

                    total +
                    Number(
                      mov.monto || 0
                    ),

                  0
                );

            const egresos =

              this.historial
                .filter(
                  (m: any) =>
                    m.tipo ===
                    'EGRESO'
                )
                .reduce(
                  (
                    total: number,
                    mov: any
                  ) =>

                    total +
                    Number(
                      mov.monto || 0
                    ),

                  0
                );

            /**
             * SI EL STORAGE
             * VIENE EN 0
             * PERO EXISTEN
             * INGRESOS
             */
            if (
              this.saldo <= 0 &&
              ingresos > 0
            ) {

              this.saldo =
                ingresos - egresos;

              console.warn(
                '[SaldoFreelancer] Saldo reconstruido desde historial:',
                this.saldo
              );
            }

            /**
             * TOTALES
             */
            this.totalIngresos =
              ingresos;

            this.totalEgresos =
              egresos;

            this.loading = false;

            console.log(
              '[SaldoFreelancer] ✓ Saldo final:',
              this.saldo
            );

            console.log(
              '[SaldoFreelancer] ✓ Historial:',
              this.historial
            );
          },

          error: (err) => {

            console.error(
              '[SaldoFreelancer] ✗ Error cargando saldo:',
              err
            );

            this.notification
              .mostrarError(
                'No se pudo cargar el saldo.'
              );

            this.loading = false;
          }
        });

    }, 150);
  }

  /**
   * TRACK MOVIMIENTOS
   */
  trackByMovimiento(
    index: number,
    item: any
  ): number {

    return (
      item?.id || index
    );
  }

  /**
   * REFRESCAR
   */
  refrescar(): void {

    console.log(
      '[SaldoFreelancer] Refrescando saldo...'
    );

    this.cargarSaldo();
  }
}
