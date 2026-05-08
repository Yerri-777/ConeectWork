import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { ProyectoService } from '../../../../core/services/proyecto.service';

@Component({
  selector: 'app-detalle-proyecto',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './detalle-proyecto.component.html',
  styleUrls: ['./proyectos.component.css']
})
export class DetalleProyectoComponent implements OnInit {
  proyecto: any;

  constructor(
    private route: ActivatedRoute,
    private proyectoService: ProyectoService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.proyectoService.obtenerPorId(id).subscribe(data => this.proyecto = data);
    }
  }
}
