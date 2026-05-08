import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { PropuestaService } from '../../../../core/services/propuesta.service';
import { NotificationService } from '../../../../core/services/notification.service';

@Component({
  selector: 'app-detalle-propuesta',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './detalle-propuesta.component.html',
  styleUrls: ['./propuestas.component.css']
})
export class DetallePropuestaComponent implements OnInit {
  propuesta: any;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private propuestaService: PropuestaService,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.propuestaService.obtenerPorId(id).subscribe(data => this.propuesta = data);
    }
  }

  aceptarPropuesta(): void {
    if (confirm('Al aceptar, se creará un contrato formal. ¿Deseas continuar?')) {
      this.propuestaService.aceptar(this.propuesta.id).subscribe({
        next: () => {
          this.notificationService.mostrarExito('¡Propuesta aceptada!');
          this.router.navigate(['/cliente/contratos']);
        },
        error: () => this.notificationService.mostrarError('Saldo insuficiente o error de red')
      });
    }
  }

  volver(): void {
    this.router.navigate(['/cliente/propuestas']);
  }
}
