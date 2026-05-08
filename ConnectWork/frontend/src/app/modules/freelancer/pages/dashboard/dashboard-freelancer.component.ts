import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ProyectoService } from '../../../../core/services/proyecto.service';
import { PropuestaService } from '../../../../core/services/propuesta.service';
import { ContratoService } from '../../../../core/services/contrato.service';
import { SaldoService } from '../../../../core/services/saldo.service';
import { ReporteService } from '../../../../core/services/reporte.service';
import { trigger, transition, style, animate } from '@angular/animations';

@Component({
  selector: 'app-dashboard-freelancer',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './dashboard-freelancer.component.html',
  styleUrls: ['./dashboard-freelancer.component.css'],
  animations: [
    trigger('fadeInUp', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(20px)' }),
        animate('500ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ])
  ]
})
export class DashboardFreelancerComponent implements OnInit {
  stats = {
    propuestasEnviadas: 0,
    contratosActivos: 0,
    calificacion: 0,
    saldoDisponible: 0,
    proyectosCompletados: 0,
    tasaAceptacion: 0,
    ingresosEsteMes: 0
  };

  constructor(
    private proyectoService: ProyectoService,
    private propuestaService: PropuestaService,
    private contratoService: ContratoService,
    private saldoService: SaldoService,
    private reporteService: ReporteService
  ) {}

  ngOnInit(): void {
    this.cargarDatos();
  }

  private cargarDatos(): void {
    this.propuestaService.listarMias().subscribe({
      next: (propuestas) => {
        this.stats.propuestasEnviadas = propuestas.length;
        const aceptadas = propuestas.filter(p => p.estado === 'ACEPTADA').length;
        this.stats.tasaAceptacion = propuestas.length > 0 ? (aceptadas / propuestas.length) * 100 : 0;
      }
    });

    this.contratoService.listar().subscribe({
      next: (contratos) => {
        this.stats.contratosActivos = contratos.filter(c => c.estado === 'ACTIVO').length;
        this.stats.proyectosCompletados = contratos.filter(c => c.estado === 'COMPLETADO').length;

        const ingresosTotal = contratos
          .filter(c => c.fechaInicio && new Date(c.fechaInicio).getMonth() === new Date().getMonth())
          .reduce((sum, c) => sum + (c.monto || 0), 0);

        this.stats.ingresosEsteMes = ingresosTotal;
      }
    });

    this.saldoService.consultarSaldo().subscribe({
      next: (saldo) => {
        this.stats.saldoDisponible = saldo.disponible || 0;
      }
    });

    this.reporteService.obtenerEstadisticasGlobales().subscribe({
      next: (stats) => {
        // this.stats.calificacion = stats.miCalificacion || 0;
      }
    });
  }
}
