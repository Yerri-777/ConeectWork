import { Component, Output, EventEmitter, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CategoriaService } from '../../../../core/services/categoria.service';

@Component({
  selector: 'app-filtros-busqueda',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './filtros-busqueda.component.html',
  styleUrls: ['./proyectos-abiertos.component.css']
})
export class FiltrosBusquedaComponent implements OnInit {
  // Recibe las categorías desde el componente padre o las carga directamente
  @Input() categorias: any[] = [];

  // Emisor de eventos para que el componente de lista reaccione al cambio
  @Output() cambioFiltros = new EventEmitter<any>();

  // Modelos de datos para los filtros
  busqueda: string = '';
  filtroCategoria: string = '';
  filtroPresupuesto: string = '';

  constructor(private categoriaService: CategoriaService) {}

  ngOnInit(): void {
    // Si no se pasan categorías por Input, se pueden cargar aquí
    if (this.categorias.length === 0) {
      this.cargarCategorias();
    }
  }

  private cargarCategorias(): void {
    this.categoriaService.listarActivas().subscribe({
      next: (cats: any[]) => this.categorias = cats,
      error: (err: any) => console.error('Error al cargar categorías en filtros', err)
    });
  }

  filtrar(): void {
    this.emitirFiltros();
  }

  /**
   * Método que se dispara en cada cambio de input o select
   * Notifica al padre los nuevos valores para filtrar la lista global
   */
  emitirFiltros(): void {
    this.cambioFiltros.emit({
      busqueda: this.busqueda,
      categoria: this.filtroCategoria,
      presupuesto: this.filtroPresupuesto
    });
  }

  /**
   * Limpia todos los filtros y resetea la búsqueda
   */
  limpiarFiltros(): void {
    this.busqueda = '';
    this.filtroCategoria = '';
    this.filtroPresupuesto = '';
    this.emitirFiltros();
  }
}
