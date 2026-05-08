import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { SaldoService } from '../../../../core/services/saldo.service';
import { NotificationService } from '../../../../core/services/notification.service';

@Component({
  selector: 'app-recargar-saldo',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
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
    this.procesando = true;
    this.saldoService.recargar(this.monto).subscribe({
      next: () => {
        this.notification.mostrarExito(`Se han recargado Q${this.monto} exitosamente.`);
        this.router.navigate(['/cliente/saldo']);
      },
      error: () => {
        this.procesando = false;
        this.notification.mostrarError('No se pudo procesar la transacción.');
      }
    });
  }
}
