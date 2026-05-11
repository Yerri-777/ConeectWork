// lista-contratos-freelancer.component.ts
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
export class ListaContratosFreelancerComponent implements OnInit {
  contratos: any[] = [];
  cargando = true;

  constructor(private contratoService: ContratoService) {}

  ngOnInit(): void {
    this.cargarContratos();
  }

  cargarContratos(): void {
    this.contratoService.listar().subscribe({
      next: (data: any[]) => {
        this.contratos = (data || []).map(c => ({
          ...c,
          // Mapeamos para que el HTML encuentre los objetos proyecto y cliente
          proyecto: { titulo: c.tituloProyecto || c.proyectoTitulo || 'Proyecto' },
          cliente: { nombreCompleto: c.nombreCliente || c.clienteNombre || 'Cliente' },
          monto: c.monto || 0
        }));
        this.cargando = false;
      },
      error: () => this.cargando = false
    });
  }


  getClaseEstado(estado: string | undefined): string {
    if (!estado) return 'activo';
    return estado.toLowerCase();
  }
}
