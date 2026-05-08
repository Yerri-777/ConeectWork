import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
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
  styleUrls: ['./lista-categorias.component.css'] // Reutiliza los estilos del modal definidos en el CSS principal
})
export class FormularioCategoriaComponent implements OnInit {
  @Input() categoria: Categoria | null = null;
  @Output() guardado = new EventEmitter<void>();
  @Output() cancelado = new EventEmitter<void>();

  categoriaTemp: Partial<Categoria> = {};

  constructor(
    private categoriaService: CategoriaService,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    if (this.categoria) {
      this.categoriaTemp = { ...this.categoria };
    }
  }

  guardar(): void {
    if (!this.categoriaTemp.nombre) {
      this.notificationService.mostrarAdvertencia('El nombre es requerido');
      return;
    }

    const accion = this.categoria
      ? this.categoriaService.actualizar(this.categoria.id!, this.categoriaTemp as Categoria)
      : this.categoriaService.crear(this.categoriaTemp as Categoria);

    accion.subscribe({
      next: () => {
        this.notificationService.mostrarExito('Categoría guardada');
        this.guardado.emit();
      },
      error: (error) => {
        console.error('Error:', error);
        this.notificationService.mostrarError('Error al guardar categoría');
      }
    });
  }

  cancelar(): void {
    this.cancelado.emit();
  }
}
