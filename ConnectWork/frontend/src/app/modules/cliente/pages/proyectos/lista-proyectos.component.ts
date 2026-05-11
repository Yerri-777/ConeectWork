

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-lista-proyectos',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './lista-proyectos.component.html',
  styleUrls: ['./proyectos.component.css']
})
export class ListaProyectosComponent implements OnInit {

  proyectos: any[] = [];

  cargando = false;

  ngOnInit(): void {

    console.log(' Cargando proyectos cliente...');

    this.cargarProyectos();
  }


  cargarProyectos(): void {

    this.cargando = true;

    try {

      const proyectosGuardados =
        localStorage.getItem('connectwork_proyectos');

      this.proyectos = proyectosGuardados
        ? JSON.parse(proyectosGuardados)
        : [];

      console.log(' Proyectos cargados:', this.proyectos);

    } catch (error) {

      console.error('Error cargando proyectos:', error);

      this.proyectos = [];

    } finally {

      this.cargando = false;
    }
  }



  trackByProyecto(index: number, proyecto: any): number {

    return proyecto.id || index;
  }

  obtenerClaseEstado(estado: string): string {

    if (!estado) return 'badge-abierto';

    switch (estado.toUpperCase()) {

      case 'ABIERTO':
        return 'badge-abierto';

      case 'EN_PROGRESO':
        return 'badge-progreso';

      case 'COMPLETADO':
        return 'badge-completado';

      case 'CANCELADO':
        return 'badge-cancelado';

      case 'ENTREGA_PENDIENTE':
        return 'badge-pendiente';

      default:
        return 'badge-abierto';
    }
  }
}
