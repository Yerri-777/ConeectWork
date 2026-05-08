import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ContratoService } from '../../../../core/services/contrato.service';

@Component({
  selector: 'app-lista-contratos',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './lista-contratos.component.html',
  styleUrls: ['./contratos.component.css']
})
export class ListaContratosComponent implements OnInit {
  contratos: any[] = [];

  constructor(private contratoService: ContratoService) {}

  ngOnInit(): void {
    this.cargarContratos();
  }

  cargarContratos(): void {
    this.contratoService.listar().subscribe({
      next: (data) => this.contratos = data,
      error: (err) => console.error('Error al cargar contratos', err)
    });
  }
}
