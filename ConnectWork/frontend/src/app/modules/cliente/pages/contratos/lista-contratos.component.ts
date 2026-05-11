import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ContratoService } from '../../../../core/services/contrato.service';
import { NotificationService } from '../../../../core/services/notification.service';

@Component({
  selector: 'app-lista-contratos-freelancer',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './lista-contratos.component.html',
  styleUrls: ['./contratos.component.css']
})
export class ListaContratosComponent implements OnInit {

  contratos: any[] = [];
  cargando = true;

  constructor(
    private contratoService: ContratoService,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.cargarContratos();
  }

  cargarContratos(): void {
    this.cargando = true;
    this.contratoService.listar().subscribe({
      next: (data: any[]) => {

        this.contratos = (data || []).map(c => ({
          ...c,

          proyecto: c.proyecto || { titulo: c.proyectoTitulo },
          cliente: c.cliente || { nombreCompleto: c.clienteNombre || 'Cliente Demo' }
        }));

        console.log('Contratos cargados (Freelancer):', this.contratos);
        this.cargando = false;
      },
      error: (error) => {
        this.cargando = false;
        this.notificationService.mostrarError('Error al cargar contratos');
        console.error('Error:', error);
      }
    });
  }


  getClaseEstado(estado: string): string {
    if (!estado) return 'estado-pendiente';
    switch (estado.toUpperCase()) {
      case 'ACTIVO': return 'estado-activo';
      case 'COMPLETADO': return 'estado-completado';
      case 'CANCELADO': return 'estado-cancelado';
      default: return 'estado-pendiente';
    }
  }
}
