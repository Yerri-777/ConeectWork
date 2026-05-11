
import { Component, OnInit } from '@angular/core';

import { CommonModule } from '@angular/common';

import { ActivatedRoute, RouterModule } from '@angular/router';

@Component({
  selector: 'app-detalle-proyecto',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './detalle-proyecto.component.html',
  styleUrls: ['./proyectos.component.css']
})
export class DetalleProyectoComponent implements OnInit {

  proyecto: any = null;

  cargando = false;

  constructor(
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {

    console.log(' Cargando detalle proyecto...');

    this.obtenerProyecto();
  }



  obtenerProyecto(): void {

    this.cargando = true;

    try {

      const id =
        Number(this.route.snapshot.paramMap.get('id'));

      const proyectos =
        JSON.parse(
          localStorage.getItem('connectwork_proyectos') || '[]'
        );

      this.proyecto =
        proyectos.find((p: any) => p.id === id);

      console.log('Proyecto encontrado:', this.proyecto);

    } catch (error) {

      console.error('Error cargando proyecto:', error);

      this.proyecto = null;

    } finally {

      this.cargando = false;
    }
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

      default:
        return 'badge-abierto';
    }
  }
}
