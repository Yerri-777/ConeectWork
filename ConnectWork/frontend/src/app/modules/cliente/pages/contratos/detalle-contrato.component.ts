import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ContratoService } from '../../../../core/services/contrato.service';
import { NotificationService } from '../../../../core/services/notification.service';

@Component({
  selector: 'app-detalle-contrato',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './detalle-contrato.component.html',
  styleUrls: ['./contratos.component.css']
})
export class DetalleContratoComponent implements OnInit {
  contrato: any;

  constructor(
    private route: ActivatedRoute,
    private contratoService: ContratoService,
    private notificationService: NotificationService,
    private router: Router
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.contratoService.obtenerPorId(id).subscribe(data => this.contrato = data);
    }
  }

  cancelarContrato(): void {
    if (confirm('¿Estás seguro de solicitar la cancelación? Esto notificará al freelancer.')) {
      this.contratoService.cancelar(this.contrato.id).subscribe({
        next: () => {
          this.notificationService.mostrarExito('Solicitud enviada');
          this.router.navigate(['/cliente/contratos']);
        },
        error: () => this.notificationService.mostrarError('No se pudo cancelar el contrato')
      });
    }
  }
}
