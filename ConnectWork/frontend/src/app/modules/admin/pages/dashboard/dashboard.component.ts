import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReporteService } from '../../../../core/services/reporte.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { trigger, transition, style, animate } from '@angular/animations';

interface EstadisticaCard {
  titulo: string;
  valor: string | number;
  icono: string;
  color: string;
}

@Component({
  selector: 'app-dashboard-admin',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
  animations: [
    trigger('fadeInUp', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(20px)' }),
        animate('500ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ])
  ]
})
export class DashboardComponent implements OnInit {
  estadisticas: EstadisticaCard[] = [];
  topFreelancers: any[] = [];
  topCategorias: any[] = [];
  ingresos: any = null;

  constructor(
    private reporteService: ReporteService,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.cargarDatos();
  }

  private cargarDatos(): void {
    this.reporteService.obtenerEstadisticasGlobales().subscribe({
      next: (datos) => {
        this.estadisticas = [
          { titulo: 'Usuarios', valor: datos.totalUsuarios || 0, icono: '👥', color: 'blue' },
          { titulo: 'Proyectos', valor: datos.totalProyectos || 0, icono: '📁', color: 'green' },
          { titulo: 'Contratos Activos', valor: datos.totalContratosActivos || 0, icono: '📜', color: 'orange' },
          { titulo: 'Solicitudes Pendientes', valor: datos.totalSolicitudesPendientes || 0, icono: '📮', color: 'red' }
        ];
      },
      error: (error) => console.error('Error:', error)
    });

    this.reporteService.obtenerTopFreelancers().subscribe({
      next: (data) => {
        this.topFreelancers = data.slice(0, 5);
      },
      error: (error) => console.error('Error:', error)
    });

    this.reporteService.obtenerTopCategorias().subscribe({
      next: (data) => {
        this.topCategorias = data.slice(0, 5);
      },
      error: (error) => console.error('Error:', error)
    });

    this.reporteService.obtenerIngresos().subscribe({
      next: (data) => {
        this.ingresos = data;
      },
      error: (error) => console.error('Error:', error)
    });
  }
}
