import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { EntregaService } from '../../../../core/services/entrega.service';
import { NotificationService } from '../../../../core/services/notification.service';

@Component({
  selector: 'app-aprobar-entrega',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './aprobar-entrega.component.html',
  styleUrls: ['./entregas.component.css']
})
export class AprobarEntregaComponent implements OnInit {
  entregaId: string | null = null;
  entrega: any = null;
  cargando = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private entregaService: EntregaService,
    private notification: NotificationService
  ) {}

  ngOnInit(): void {
    this.entregaId = this.route.snapshot.paramMap.get('id');
    if (this.entregaId) {
      this.obtenerDetallesEntrega();
    } else {
      this.router.navigate(['/cliente/entregas']);
    }
  }

  obtenerDetallesEntrega(): void {
    this.entregaService.obtenerPorId(this.entregaId!).subscribe({
      next: (data) => this.entrega = data,
      error: () => this.router.navigate(['/cliente/entregas'])
    });
  }

  procesarAprobacion(): void {
    if (!this.entregaId) return;

    this.cargando = true;
    this.entregaService.aprobarSolo(this.entregaId).subscribe({
      next: () => {
        this.notification.mostrarExito('Entrega aprobada y pago liberado.');
        // Una vez aprobado, el flujo natural es pedir la calificación
        this.router.navigate(['/cliente/entregas/calificar', this.entregaId]);
      },
      error: (err) => {
        this.cargando = false;
        this.notification.mostrarError('Error al procesar el pago. Intente de nuevo.');
      }
    });
  }

  volver(): void {
    this.router.navigate(['/cliente/entregas']);
  }
}
