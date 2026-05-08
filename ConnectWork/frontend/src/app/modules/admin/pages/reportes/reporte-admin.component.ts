import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../services/admin.service';

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

  topHabilidades: any[] = [];
  topFreelancers: any[] = [];
  proyectosEstado: any[] = [];

  constructor(private adminService: AdminService) {}

  ngOnInit(): void {
    this.cargarDatosReporte();
  }

  cargarDatosReporte(): void {
    this.adminService.obtenerEstadisticasGenerales().subscribe(data => {
      this.topHabilidades = data.habilidades;
      this.topFreelancers = data.freelancers;
      this.proyectosEstado = data.proyectos;
    });
  }

  generarReporte(): void {
    this.adminService.descargarReportePDF(this.fechaInicio, this.fechaFin).subscribe(blob => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `reporte-admin-${new Date().getTime()}.pdf`;
      a.click();
    });
  }
}
