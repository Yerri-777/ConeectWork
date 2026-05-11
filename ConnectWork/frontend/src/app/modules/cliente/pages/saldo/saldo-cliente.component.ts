import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';

import { SaldoService } from '../../../../core/services/saldo.service';
import { NotificationService } from '../../../../core/services/notification.service';

@Component({
  selector: 'app-saldo-cliente',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule
  ],
  templateUrl: './saldo-cliente.component.html',
  styleUrls: ['./saldo.component.css']
})
export class SaldoClienteComponent implements OnInit {

  saldoActual = 0;

  movimientos: any[] = [];

  retenciones: any[] = [];

  cargando = false;

  constructor(
    private saldoService: SaldoService,
    private notification: NotificationService,
    private router: Router
  ) {}

  ngOnInit(): void {

    console.log(
      '[SaldoClienteComponent] Inicializando...'
    );

    this.cargarDatos();
  }

  /**
   * CARGAR DATOS
   */
  cargarDatos(): void {

    this.cargando = true;

    console.log(
      '[SaldoClienteComponent] Cargando saldo...'
    );

    /**
     * PEQUEÑO DELAY
     * PARA ASEGURAR
     * STORAGE LISTO
     */
    setTimeout(() => {

      this.saldoService
        .consultarSaldo()
        .subscribe({

          next: (response: any) => {

            console.log(
              '[SaldoClienteComponent] ✓ Respuesta saldo:',
              response
            );

            this.saldoActual =
              response?.disponible || 0;

            this.movimientos =
              response?.historial || [];

            this.retenciones =
              response?.bloqueado || [];

            this.cargando = false;
          },

          error: (error: any) => {

            console.error(
              '[SaldoClienteComponent] ✗ Error:',
              error
            );

            this.notification.mostrarError(
              'No se pudo cargar la información del saldo.'
            );

            this.cargando = false;
          }
        });

    }, 100);
  }

  /**
   * IR A RECARGAR
   */
  irRecargar(): void {

    console.log(
      '[SaldoClienteComponent] Navegando a recarga...'
    );

    this.router.navigate([
      '/cliente/saldo/recargar'
    ]);
  }

  /**
   * TRACK MOVIMIENTOS
   */
  trackByMovimiento(
    index: number,
    item: any
  ): number {

    return item?.id || index;
  }

  /**
   * TRACK RETENCIONES
   */
  trackByRetencion(
    index: number,
    item: any
  ): number {

    return item?.id || index;
  }
}
