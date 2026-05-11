import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef
} from '@angular/core';

import { CommonModule } from '@angular/common';

import { CategoriaService } from '../../../../core/services/categoria.service';
import { NotificationService } from '../../../../core/services/notification.service';

import { ModalConfirmarComponent } from '../../../../shared/componentes/modal-confirmar/modal-confirmar.component';

import { FormularioCategoriaComponent } from './formulario-categoria.component';

import { Categoria } from '../../../../core/models/categoria.model';

@Component({
  selector: 'app-lista-categorias',

  standalone: true,

  imports: [
    CommonModule,
    ModalConfirmarComponent,
    FormularioCategoriaComponent
  ],

  templateUrl: './lista-categorias.component.html',

  styleUrls: ['./lista-categorias.component.css'],

  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ListaCategoriasComponent implements OnInit {

  // =====================================================
  // DATA
  // =====================================================

  categorias: Categoria[] = [];

  categoriaEditando: Categoria | null = null;

  categoriaSeleccionada: Categoria | null = null;

  // =====================================================
  // UI STATE
  // =====================================================

  mostrarFormulario = false;

  modalEliminarAbierto = false;

  cargando = false;

  // =====================================================
  // CONSTRUCTOR
  // =====================================================

  constructor(
    private categoriaService: CategoriaService,
    private notificationService: NotificationService,
    private cdr: ChangeDetectorRef
  ) {}

  // =====================================================
  // INIT
  // =====================================================

  ngOnInit(): void {

    console.log('[ListaCategorias] Inicializando módulo');

    this.cargarCategorias();
  }

  // =====================================================
  // CARGAR CATEGORIAS
  // =====================================================

  cargarCategorias(): void {

    console.log('[ListaCategorias] Cargando categorías...');

    this.cargando = true;

    this.categoriaService.listar().subscribe({

      next: (response: Categoria[]) => {

        console.log(
          '[ListaCategorias] ✓ Categorías cargadas:',
          response
        );

        this.categorias = response || [];

        this.cdr.markForCheck();
      },

      error: (error) => {

        console.error(
          '[ListaCategorias] ERROR:',
          error
        );

        this.notificationService.mostrarError(
          'Error al cargar categorías'
        );

        this.categorias = [];

        this.cdr.markForCheck();
      },

      complete: () => {

        this.cargando = false;

        this.cdr.markForCheck();
      }
    });
  }

  // =====================================================
  // FORMULARIO
  // =====================================================

  abrirFormulario(): void {

    console.log('[ListaCategorias] Abriendo formulario');

    this.categoriaEditando = null;

    this.mostrarFormulario = true;

    this.cdr.markForCheck();
  }

  editarCategoria(categoria: Categoria): void {

    console.log(
      '[ListaCategorias] Editando categoría:',
      categoria
    );

    this.categoriaEditando = {
      ...categoria
    };

    this.mostrarFormulario = true;

    this.cdr.markForCheck();
  }

  cerrarFormulario(): void {

    this.mostrarFormulario = false;

    this.categoriaEditando = null;

    this.cdr.markForCheck();
  }

  onCategoriaGuardada(): void {

    console.log('[ListaCategorias] Categoría guardada');

    this.cerrarFormulario();

    this.cargarCategorias();
  }

  // =====================================================
  // MODAL
  // =====================================================

  abrirModalEliminar(categoria: Categoria): void {

    console.log(
      '[ListaCategorias] Confirmar cambio estado:',
      categoria
    );

    this.categoriaSeleccionada = categoria;

    this.modalEliminarAbierto = true;

    this.cdr.markForCheck();
  }

  cerrarModalEliminar(): void {

    this.modalEliminarAbierto = false;

    this.categoriaSeleccionada = null;

    this.cdr.markForCheck();
  }

  // =====================================================
  // ACTIVAR / DESACTIVAR
  // =====================================================

  confirmarAccion(): void {

    if (!this.categoriaSeleccionada?.id) {

      this.notificationService.mostrarError(
        'Categoría inválida'
      );

      return;
    }

    const categoria = this.categoriaSeleccionada;

    const accion$ = categoria.activo
      ? this.categoriaService.desactivar(Number(categoria.id))
      : this.categoriaService.activar(Number(categoria.id));

    this.cargando = true;

    accion$.subscribe({

      next: () => {

        const mensaje = categoria.activo
          ? 'Categoría desactivada correctamente'
          : 'Categoría activada correctamente';

        console.log(
          '[ListaCategorias] ✓ Estado actualizado'
        );

        this.notificationService.mostrarExito(mensaje);

        // cerrar modal
        this.cerrarModalEliminar();

        // refrescar listado
        this.cargarCategorias();
      },

      error: (error) => {

        console.error(
          '[ListaCategorias] ERROR toggle estado:',
          error
        );

        this.notificationService.mostrarError(
          'No se pudo actualizar el estado de la categoría'
        );

        this.cargando = false;

        this.cdr.markForCheck();
      }
    });
  }

  // =====================================================
  // TOGGLE
  // =====================================================

  toggleEstado(categoria: Categoria): void {

    this.abrirModalEliminar(categoria);
  }

  // =====================================================
  // HELPERS
  // =====================================================

  trackByCategoria(
    index: number,
    categoria: Categoria
  ): number {

    return categoria.id || index;
  }
}
