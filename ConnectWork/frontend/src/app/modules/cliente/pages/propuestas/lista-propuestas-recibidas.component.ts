
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { PropuestaService } from '../../../../core/services/propuesta.service';
import { NotificationService } from '../../../../core/services/notification.service';

@Component({
  selector: 'app-lista-propuestas-recibidas',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './lista-propuestas-recibidas.component.html',
  styleUrls: ['./propuestas.component.css']
})
export class ListaPropuestasRecibidasComponent implements OnInit {
  propuestas: any[] = [];

  constructor(
    private propuestaService: PropuestaService,
    private notificationService: NotificationService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.cargarPropuestas();
  }

  cargarPropuestas(): void {
    this.propuestaService.listarRecibidas().subscribe(data => this.propuestas = data);
  }

  verDetalle(id: string): void {
    this.router.navigate(['/cliente/propuestas/detalle', id]);
  }

  rechazar(id: string): void {
    if (confirm('¿Estás seguro de rechazar esta propuesta?')) {
      this.propuestaService.rechazar(id).subscribe(() => {
        this.notificationService.mostrarExito('Propuesta rechazada');
        this.cargarPropuestas();
      });
    }
  }
}
