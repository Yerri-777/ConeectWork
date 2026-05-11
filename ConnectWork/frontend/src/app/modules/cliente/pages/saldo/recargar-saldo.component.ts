import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';

import { SaldoService } from '../../../../core/services/saldo.service';
import { NotificationService } from '../../../../core/services/notification.service';

@Component({
  selector: 'app-recargar-saldo',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule
  ],
  templateUrl: './recargar-saldo.component.html',
  styleUrls: ['./saldo.component.css']
})
export class RecargarSaldoComponent {

  monto = 0;

  procesando = false;

  constructor(
    private saldoService: SaldoService,
    private notification: NotificationService,
    private router: Router
  ) {}

 confirmarRecarga(): void {

  console.log('CLICK RECARGA');

  console.log('Monto:', this.monto);

  if (!this.monto || this.monto <= 0) {

    this.notification.mostrarError(
      'Ingresa un monto válido.'
    );

    return;
  }

  this.procesando = true;

  const montoNumerico = Number(this.monto);

  console.log('Enviando monto:', montoNumerico);

  this.saldoService
    .recargar(montoNumerico)
    .subscribe({

      next: (response) => {

        console.log('RECARGA EXITOSA', response);

        this.notification.mostrarExito(
          `Se han recargado Q${montoNumerico} exitosamente.`
        );

        this.router.navigate(['/cliente/saldo']);
      },

      error: (error) => {

        console.error('ERROR RECARGA:', error);

        this.notification.mostrarError(
          error?.error?.message ||
          'No se pudo procesar la transacción.'
        );

        this.procesando = false;
      }
    });
}

  cancelar(): void {
    this.router.navigate(['/cliente/saldo']);
  }
}
