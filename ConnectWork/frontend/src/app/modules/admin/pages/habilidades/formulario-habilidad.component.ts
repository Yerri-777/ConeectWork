import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnInit,
  OnDestroy
} from '@angular/core';

import {
  CommonModule
} from '@angular/common';

import {
  FormsModule
} from '@angular/forms';

import {
  Subject
} from 'rxjs';

import {
  takeUntil
} from 'rxjs/operators';

import {
  HabilidadService
} from '../../../../core/services/habilidad.service';

import {
  CategoriaService
} from '../../../../core/services/categoria.service';

import {
  NotificationService
} from '../../../../core/services/notification.service';

import {
  Habilidad
} from '../../../../core/models/habilidad.model';

import {
  Categoria
} from '../../../../core/models/categoria.model';

@Component({
  selector: 'app-formulario-habilidad',

  standalone: true,

  imports: [
    CommonModule,
    FormsModule
  ],

  templateUrl:
    './formulario-habilidad.component.html',

  styleUrls: [
    './lista-habilidades.component.css'
  ]
})
export class FormularioHabilidadComponent
implements OnInit, OnDestroy {

  @Input()
  habilidad: Habilidad | null = null;

  @Output()
  guardado =
    new EventEmitter<void>();

  @Output()
  cancelado =
    new EventEmitter<void>();

  categorias: Categoria[] = [];

  cargando = false;

  private destroy$ =
    new Subject<void>();

  // =====================================================
  // MODELO TEMPORAL
  // =====================================================

  habTemp: Habilidad = {

    id: 0,

    categoriaId: 0,

    nombre: '',

    descripcion: '',

    activo: true
  };

  constructor(

    private habilidadService:
      HabilidadService,

    private categoriaService:
      CategoriaService,

    private notificationService:
      NotificationService

  ) {}

  // =====================================================
  // INIT
  // =====================================================

  ngOnInit(): void {

    console.log(
      '[FormularioHabilidad] Inicializando...'
    );

    this.cargarCategorias();

    // =================================================
    // EDIT MODE
    // =================================================

    if (this.habilidad) {

      console.log(
        '[FormularioHabilidad] Editando habilidad:',
        this.habilidad
      );

      this.habTemp = {

        id:
          this.habilidad.id || 0,

        categoriaId:
          Number(this.habilidad.categoriaId) || 0,

        nombre:
          this.habilidad.nombre || '',

        descripcion:
          this.habilidad.descripcion || '',

        activo:
          this.habilidad.activo ?? true
      };
    }
  }

  // =====================================================
  // DESTROY
  // =====================================================

  ngOnDestroy(): void {

    this.destroy$.next();

    this.destroy$.complete();
  }

  // =====================================================
  // CARGAR CATEGORIAS
  // =====================================================

  cargarCategorias(): void {

    console.log(
      '[FormularioHabilidad] Cargando categorías...'
    );

    this.categoriaService
      .listar()

      .pipe(
        takeUntil(this.destroy$)
      )

      .subscribe({

        next: (data: Categoria[]) => {

          console.log(
            '[FormularioHabilidad] ✓ Categorías:',
            data
          );

          this.categorias = data || [];
        },

        error: (error) => {

          console.error(
            '[FormularioHabilidad] Error categorías:',
            error
          );

          this.notificationService
            .mostrarError(
              'Error al cargar categorías'
            );
        }
      });
  }

  // =====================================================
  // GUARDAR
  // =====================================================

  guardar(): void {

    // ===============================================
    // VALIDACIONES
    // ===============================================

    const nombre =
      this.habTemp.nombre?.trim();

    if (!nombre) {

      this.notificationService
        .mostrarAdvertencia(
          'El nombre es requerido'
        );

      return;
    }

    if (nombre.length < 2) {

      this.notificationService
        .mostrarAdvertencia(
          'El nombre es demasiado corto'
        );

      return;
    }

    if (!this.habTemp.categoriaId ||
        this.habTemp.categoriaId <= 0) {

      this.notificationService
        .mostrarAdvertencia(
          'La categoría es requerida'
        );

      return;
    }

    // ===============================================
    // PAYLOAD
    // ===============================================

    const payload: Habilidad = {

      id:
        this.habTemp.id || 0,

      categoriaId:
        Number(this.habTemp.categoriaId),

      nombre:
        nombre,

      descripcion:
        this.habTemp.descripcion?.trim() || '',

      activo:
        this.habTemp.activo ?? true
    };

    console.log(
      '[FormularioHabilidad] Payload:',
      payload
    );

    this.cargando = true;

    // ===============================================
    // CREATE / UPDATE
    // ===============================================

    const request$ = this.habilidad?.id

      ? this.habilidadService.actualizar(
          this.habilidad.id,
          payload
        )

      : this.habilidadService.crear(
          payload
        );

    request$
      .pipe(
        takeUntil(this.destroy$)
      )

      .subscribe({

        next: () => {

          this.cargando = false;

          const mensaje =
            this.habilidad?.id
              ? 'Habilidad actualizada correctamente'
              : 'Habilidad creada correctamente';

          console.log(
            '[FormularioHabilidad] ✓',
            mensaje
          );

          this.notificationService
            .mostrarExito(mensaje);

          this.guardado.emit();
        },

        error: (error) => {

          this.cargando = false;

          console.error(
            '[FormularioHabilidad] Error:',
            error
          );

          // =========================================
          // MENSAJES BACKEND
          // =========================================

          if (error.status === 400) {

            this.notificationService
              .mostrarError(
                error.error?.error ||
                'Datos inválidos'
              );

            return;
          }

          if (error.status === 401) {

            this.notificationService
              .mostrarError(
                'Sesión expirada'
              );

            return;
          }

          if (error.status === 403) {

            this.notificationService
              .mostrarError(
                'No tienes permisos'
              );

            return;
          }

          if (error.status === 404) {

            this.notificationService
              .mostrarError(
                'Habilidad no encontrada'
              );

            return;
          }

          this.notificationService
            .mostrarError(
              'Error interno del servidor'
            );
        }
      });
  }

  // =====================================================
  // CANCELAR
  // =====================================================

  cancelar(): void {

    console.log(
      '[FormularioHabilidad] Cancelado'
    );

    this.cancelado.emit();
  }
}
