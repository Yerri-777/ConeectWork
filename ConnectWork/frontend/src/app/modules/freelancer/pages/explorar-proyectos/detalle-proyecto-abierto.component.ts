import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { ProyectoService } from '../../../../core/services/proyecto.service';

@Component({
  selector: 'app-detalle-proyecto-abierto',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './detalle-proyecto-abierto.component.html',
  styleUrls: ['./proyectos-abiertos.component.css']
})
export class DetalleProyectoAbiertoComponent implements OnInit {
  proyecto: any = null;

  constructor(
    private route: ActivatedRoute,
    private proyectoService: ProyectoService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.proyectoService.obtenerPorId(id).subscribe({
        next: (data) => this.proyecto = data
      });
    }
  }
}
