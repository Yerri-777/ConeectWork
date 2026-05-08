import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ProyectoService } from '../../../../core/services/proyecto.service';

@Component({
  selector: 'app-lista-proyectos',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './lista-proyectos.component.html',
  styleUrls: ['./proyectos.component.css']
})
export class ListaProyectosComponent implements OnInit {
  proyectos: any[] = [];

  constructor(private proyectoService: ProyectoService) {}

  ngOnInit(): void {
    this.proyectoService.listar().subscribe(data => this.proyectos = data);
  }
}
