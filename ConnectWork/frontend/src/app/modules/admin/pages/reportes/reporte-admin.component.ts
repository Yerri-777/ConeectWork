import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReporteService } from '../../../../core/services/reporte.service';
import { NotificationService } from '../../../../core/services/notification.service';

@Component({
  selector: 'app-reporte-admin',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './reporte-admin.component.html',
  styleUrls: ['./reporte-admin.component.css']
})
export class ReporteAdminComponent implements OnInit {
  fechaInicio: string = '';
  fechaFin: string = '';

  // Variables sincronizadas con el HTML
  topFreelancers: any[] = [];
  topHabilidades: any[] = [];
  proyectosEstado: any[] = [];

  ingresos: any = null;
  cargando = false;
  generandoPDF = false;

  constructor(
    private reporteService: ReporteService,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.cargarDatos();
  }

  cargarDatos(): void {
    this.cargando = true;

    // Obtener Freelancers
    this.reporteService.obtenerTopFreelancers().subscribe({
      next: (data) => this.topFreelancers = (data || []).slice(0, 10),
      error: (err) => console.error('Error Freelancers:', err)
    });

    // Obtener Habilidades (mapeando desde topCategorias si es necesario)
    this.reporteService.obtenerTopCategorias().subscribe({
      next: (data) => {
        // Aseguramos que la estructura coincida con el HTML (nombre, cantidad)
        this.topHabilidades = (data || []).map((item: any) => ({
          nombre: item.nombre,
          cantidad: item.totalProyectos || item.cantidad || 0
        })).slice(0, 10);
      },
      error: (err) => console.error('Error Habilidades:', err)
    });

    // Obtener Ingresos y Proyectos por Estado
    this.reporteService.obtenerIngresos().subscribe({
      next: (data) => {
        this.ingresos = data || {};
        // Mapeo para el gráfico de barras del HTML
        this.proyectosEstado = data?.proyectosEstado || [];
        this.cargando = false;
      },
      error: (err) => {
        console.error('Error Ingresos:', err);
        this.cargando = false;
        this.notificationService.mostrarError('Error al cargar estadísticas');
      }
    });
  }

  generarReporte(): void {
    if (!this.fechaInicio || !this.fechaFin) {
      this.notificationService.mostrarAdvertencia('Selecciona ambas fechas');
      return;
    }

    const inicio = new Date(this.fechaInicio);
    const fin = new Date(this.fechaFin);

    if (inicio > fin) {
      this.notificationService.mostrarAdvertencia('La fecha de inicio no puede ser posterior a la final');
      return;
    }

    this.generandoPDF = true;

    this.reporteService.descargarReportePDF(this.fechaInicio, this.fechaFin).subscribe({
      next: (blob: Blob) => {
        this.generandoPDF = false;
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `reporte-general-${this.fechaInicio}-al-${this.fechaFin}.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        this.notificationService.mostrarExito('Reporte generado exitosamente');
      },
      error: (error) => {
        this.generandoPDF = false;
        console.error('Error al descargar reporte:', error);
        this.notificationService.mostrarError('No se pudo generar el archivo PDF');
      }
    });
  }
}
