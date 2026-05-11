import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ProyectoService } from '../../../../core/services/proyecto.service';
import { PropuestaService } from '../../../../core/services/propuesta.service';
import { ContratoService } from '../../../../core/services/contrato.service';
import { SaldoService } from '../../../../core/services/saldo.service';
import { trigger, transition, style, animate } from '@angular/animations';

@Component({
  selector: 'app-dashboard-cliente',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './dashboard-cliente.component.html',
  styleUrls: ['./dashboard-cliente.component.css'],
  animations: [
    trigger('fadeInUp', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(20px)' }),
        animate('500ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ])
  ]
})
export class DashboardClienteComponent implements OnInit {
  stats = {
    proyectosActivos: 0,
    propuestasRecibidas: 0,
    contratosActivos: 0,
    saldoDisponible: 0
  };

  constructor(
    private proyectoService: ProyectoService,
    private propuestaService: PropuestaService,
    private contratoService: ContratoService,
    private saldoService: SaldoService
  ) {}

  ngOnInit(): void {
    this.cargarDatos();
  }

  private cargarDatos(): void {

  this.proyectoService.listar().subscribe({
    next: (proyectos) => {
      this.stats.proyectosActivos = (proyectos || []).length;
    },
    error: (error) => {
      console.error('Error cargando proyectos:', error);
      this.stats.proyectosActivos = 0;
    }
  });


  this.propuestaService.listarMias().subscribe({
    next: (propuestas) => {
      this.stats.propuestasRecibidas = (propuestas || []).length;
    },
    error: (error) => {
      console.error('Error cargando propuestas:', error);
      this.stats.propuestasRecibidas = 0;
    }
  });


  this.contratoService.listar().subscribe({
    next: (contratos) => {
      this.stats.contratosActivos = (contratos || []).length;
    },
    error: (error) => {
      console.error('Error cargando contratos:', error);
      this.stats.contratosActivos = 0;
    }
  });


  this.saldoService.consultarSaldo().subscribe({
    next: (saldo: any) => {
      this.stats.saldoDisponible = saldo?.disponible || 0;
    },
    error: (error) => {
      console.error('Error cargando saldo:', error);
      this.stats.saldoDisponible = 0;
    }
  });
}}
