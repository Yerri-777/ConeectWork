import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HabilidadService } from '../../../../core/services/habilidad.service';
import { CategoriaService } from '../../../../core/services/categoria.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { Habilidad } from '../../../../core/models/habilidad.model';
import { Categoria } from '../../../../core/models/categoria.model';

@Component({
  selector: 'app-formulario-habilidad',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './formulario-habilidad.component.html',
  styleUrls: ['./lista-habilidades.component.css']
})
export class FormularioHabilidadComponent implements OnInit {
  @Input() habilidad: Habilidad | null = null;
  @Output() guardado = new EventEmitter<void>();
  @Output() cancelado = new EventEmitter<void>();

  habTemp: any = { idCategoria: '' };
  categorias: Categoria[] = [];

  constructor(
    private habilidadService: HabilidadService,
    private categoriaService: CategoriaService,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.cargarCategorias();
    if (this.habilidad) {
      this.habTemp = { ...this.habilidad };
    }
  }

  cargarCategorias(): void {
    this.categoriaService.listar().subscribe(data => this.categorias = data);
  }

  guardar(): void {
    if (!this.habTemp.nombre || !this.habTemp.idCategoria) {
      this.notificationService.mostrarAdvertencia('Nombre y Categoría son requeridos');
      return;
    }

    const accion = this.habilidad
      ? this.habilidadService.actualizar(this.habilidad.id!, this.habTemp)
      : this.habilidadService.crear(this.habTemp);

    accion.subscribe({
      next: () => {
        this.notificationService.mostrarExito('Habilidad guardada');
        this.guardado.emit();
      },
      error: () => this.notificationService.mostrarError('Error al guardar habilidad')
    });
  }

  cancelar(): void {
    this.cancelado.emit();
  }
}
