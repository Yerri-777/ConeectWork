import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FreelancerService } from '../../services/freelancer.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-reporte-freelancer',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './reporte-freelancer.component.html',
  styleUrls: ['./reporte-freelancer.component.css']
})
export class ReporteFreelancerComponent implements OnInit, OnDestroy {

  stats: any = {
    propuestasEnviadas: 0,
    propuestasAceptadas: 0,
    contratosCompletados: 0,
    ingresoTotal: 0,
    calificacionPromedio: 0,
    topCategorias: [],
    historialPropuestas: [],
    historialContratos: []
  };

  cargando: boolean = false;
  private destroy$ = new Subject<void>();

  constructor(
    private freelancerService: FreelancerService,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.cargarEstadisticas();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private cargarEstadisticas(): void {
    this.cargando = true;

    this.freelancerService.obtenerEstadisticas()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data: any) => {
          this.stats = {
            propuestasEnviadas: data.propuestasEnviadas || 0,
            propuestasAceptadas: data.propuestasAceptadas || 0,
            contratosCompletados: data.contratosCompletados || 0,
            ingresoTotal: data.ingresoTotal || 0,
            calificacionPromedio: data.calificacionPromedio || 0,
            topCategorias: data.topCategorias || [],
            historialPropuestas: data.historialPropuestas || [],
            historialContratos: data.historialContratos || []
          };
          this.cargando = false;
          this.notificationService.mostrarExito('Reportes cargados correctamente');
        },
        error: (err: any) => {
          this.cargando = false;
          console.error('Error al cargar estadísticas:', err);
          this.notificationService.mostrarError('Error al cargar los reportes');
          this.stats = {
            propuestasEnviadas: 0,
            propuestasAceptadas: 0,
            contratosCompletados: 0,
            ingresoTotal: 0,
            calificacionPromedio: 0,
            topCategorias: [],
            historialPropuestas: [],
            historialContratos: []
          };
        }
      });
  }

  exportarPDF(): void {
    this.freelancerService.descargarReportePDF()
      .subscribe({
        next: (blob: Blob) => {
          const url = window.URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = `reporte-freelancer-${new Date().toISOString().split('T')[0]}.pdf`;
          link.click();
          window.URL.revokeObjectURL(url);
        },
        error: (err: any) => {
          console.error('Error al descargar PDF:', err);
        }
      });
  }

  recargar(): void {
    this.cargarEstadisticas();
  }

  obtenerColor(valor: number, max: number = 5): string {
    const porcentaje = (valor / max) * 100;
    if (porcentaje >= 80) {
      return 'green';
    } else if (porcentaje >= 50) {
      return 'yellow';
    } else {
      return 'red';
    }
  }

  formatearMoneda(valor: number): string {
    return new Intl.NumberFormat('es-GT', {
      style: 'currency',
      currency: 'GTQ'
    }).format(valor);
  }

  generarEstrellas(puntuacion: number): string {
    const estrellas = Math.round(puntuacion);
    return '⭐'.repeat(Math.min(estrellas, 5)) + '☆'.repeat(Math.max(0, 5 - estrellas));
  }
}
