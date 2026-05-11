import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnInit,
  ChangeDetectionStrategy
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { CategoriaService } from '../../../../core/services/categoria.service';
import { NotificationService } from '../../../../core/services/notification.service';

import { Categoria } from '../../../../core/models/categoria.model';

@Component({
  selector: 'app-formulario-categoria',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './formulario-categoria.component.html',
  styleUrls: ['./lista-categorias.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FormularioCategoriaComponent implements OnInit {

  // =====================================================
  // INPUTS / OUTPUTS
  // =====================================================

  @Input() categoria: Categoria | null = null;

  @Output() guardado = new EventEmitter<Categoria>();

  @Output() cancelado = new EventEmitter<void>();

  // =====================================================
  // STATE
  // =====================================================

  cargando = false;

  enviando = false;

  categoriaTemp: Categoria = this.obtenerCategoriaVacia();

  // =====================================================
  // CONSTRUCTOR
  // =====================================================

  constructor(
    private categoriaService: CategoriaService,
    private notificationService: NotificationService
  ) {}

  // =====================================================
  // INIT
  // =====================================================

  ngOnInit(): void {

    console.log('[FormularioCategoria] Inicializando...');

    if (this.categoria) {

      console.log('[FormularioCategoria] Editando categoría:', this.categoria);

      this.categoriaTemp = {
        ...this.categoria
      };

    } else {

      this.categoriaTemp = this.obtenerCategoriaVacia();
    }
  }

  // =====================================================
  // GUARDAR
  // =====================================================

  guardar(): void {

    if (this.enviando) {
      return;
    }

    // =========================
    // VALIDACIONES
    // =========================

    const nombre = this.categoriaTemp.nombre?.trim();

    if (!nombre) {

      this.notificationService.mostrarAdvertencia(
        'El nombre de la categoría es obligatorio'
      );

      return;
    }

    if (nombre.length < 3) {

      this.notificationService.mostrarAdvertencia(
        'El nombre debe tener al menos 3 caracteres'
      );

      return;
    }

    // =========================
    // NORMALIZAR
    // =========================

    this.categoriaTemp.nombre = nombre;

    this.categoriaTemp.descripcion =
      this.categoriaTemp.descripcion?.trim() || '';

    this.enviando = true;

    const esEdicion = !!this.categoria?.id;

    console.log(
      `[FormularioCategoria] ${esEdicion ? 'Actualizando' : 'Creando'} categoría...`
    );

    // =====================================================
    // SIMULACIÓN API LOCAL
    // =====================================================

    const request$ = esEdicion
      ? this.categoriaService.actualizar(
          this.categoria!.id!,
          this.categoriaTemp
        )
      : this.categoriaService.crear(this.categoriaTemp);

    request$.subscribe({

      next: (response: Categoria) => {

        console.log('[FormularioCategoria] ✓ Operación exitosa:', response);

        this.notificationService.mostrarExito(
          esEdicion
            ? 'Categoría actualizada correctamente'
            : 'Categoría creada correctamente'
        );

        this.guardado.emit(response);
      },

      error: (error) => {

        console.error('[FormularioCategoria] ERROR:', error);

        this.notificationService.mostrarError(
          'No se pudo guardar la categoría'
        );
      },

      complete: () => {
        this.enviando = false;
      }
    });
  }

  // =====================================================
  // CANCELAR
  // =====================================================

  cancelar(): void {

    console.log('[FormularioCategoria] Cancelando formulario');

    this.cancelado.emit();
  }

  // =====================================================
  // HELPERS
  // =====================================================

  private obtenerCategoriaVacia(): Categoria {

    return {
      id: 0,
      nombre: '',
      descripcion: '',
      activo: true
    };
  }
}
