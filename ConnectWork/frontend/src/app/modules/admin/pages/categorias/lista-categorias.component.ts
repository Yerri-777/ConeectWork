import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CategoriaService } from '../../../../core/services/categoria.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { ModalConfirmarComponent } from '../../../../shared/componentes/modal-confirmar/modal-confirmar.component';
import { FormularioCategoriaComponent } from './formulario-categoria.component';
import { Categoria } from '../../../../core/models/categoria.model';

@Component({
  selector: 'app-lista-categorias',
  standalone: true,
  imports: [CommonModule, ModalConfirmarComponent, FormularioCategoriaComponent],
  templateUrl: './lista-categorias.component.html',
  styleUrls: ['./lista-categorias.component.css']
})
export class ListaCategoriasComponent implements OnInit {
  categorias: Categoria[] = [];
  mostrarFormulario = false;
  categoriaEditando: Categoria | null = null;
  categoriaSeleccionada: Categoria | null = null;
  modalEliminarAbierto = false;

  constructor(
    private categoriaService: CategoriaService,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.cargarCategorias();
  }

  private cargarCategorias(): void {
    this.categoriaService.listar().subscribe({
      next: (categorias) => {
        this.categorias = categorias;
      },
      error: (error) => {
        console.error('Error:', error);
        this.notificationService.mostrarError('Error al cargar categorías');
      }
    });
  }

  abrirFormulario(): void {
    this.categoriaEditando = null;
    this.mostrarFormulario = true;
  }

  editarCategoria(categoria: Categoria): void {
    this.categoriaEditando = categoria;
    this.mostrarFormulario = true;
  }

  cerrarFormulario(): void {
    this.mostrarFormulario = false;
    this.categoriaEditando = null;
  }

  onCategoriaGuardada(): void {
    this.cerrarFormulario();
    this.cargarCategorias();
  }

  abrirModalEliminar(categoria: Categoria): void {
    this.categoriaSeleccionada = categoria;
    this.modalEliminarAbierto = true;
  }

  cerrarModalEliminar(): void {
    this.modalEliminarAbierto = false;
  }

  confirmarAccion(): void {
    if (!this.categoriaSeleccionada) return;

    const accion = this.categoriaSeleccionada.activo
      ? this.categoriaService.desactivar(this.categoriaSeleccionada.id!)
      : this.categoriaService.activar(this.categoriaSeleccionada.id!);

    accion.subscribe({
      next: () => {
        this.notificationService.mostrarExito('Categoría actualizada');
        this.cerrarModalEliminar();
        this.cargarCategorias();
      },
      error: (error) => {
        console.error('Error:', error);
        this.notificationService.mostrarError('Error al actualizar categoría');
      }
    });
  }
}
