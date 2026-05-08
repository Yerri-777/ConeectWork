import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ClienteService } from '../../services/cliente.service';

@Component({
  selector: 'app-reporte-cliente',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './reporte-cliente.component.html',
  styleUrls: ['./reporte-cliente.component.css']
})
export class ReporteClienteComponent implements OnInit {
  periodo = 'mes';
  statsCategorias: any[] = [];
  statsEstados: any[] = [];

  constructor(private clienteService: ClienteService) {}

  ngOnInit(): void {
    this.cargarDatos();
  }

  cargarDatos(): void {
    this.clienteService.getEstadisticas(this.periodo).subscribe(data => {
      this.statsCategorias = data.categorias;
      this.statsEstados = data.estados;
    });
  }

  exportarPDF(): void {
    console.log('Generando reporte en PDF...');
    // Lógica para jsPDF o similar
  }
}
