import {
  Component,
  Output,
  EventEmitter,
  Input,
  OnInit
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { CategoriaService } from '../../../../core/services/categoria.service';

@Component({
  selector: 'app-filtros-busqueda',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './filtros-busqueda.component.html',
  styleUrls: ['./proyectos-abiertos.component.css']
})
export class FiltrosBusquedaComponent
implements OnInit {

  @Input()
  categorias: any[] = [];

  @Output()
  cambioFiltros =
    new EventEmitter<any>();

  busqueda: string = '';

  filtroCategoria: string = '';

  filtroPresupuesto: string = '';

  constructor(
    private categoriaService: CategoriaService
  ) {}

  ngOnInit(): void {

    if (this.categorias.length === 0) {

      this.cargarCategorias();
    }
  }


  cargarCategorias(): void {

    this.categoriaService
      .listarActivas()
      .subscribe({

      next: (cats: any[]) => {

        console.log(
          '[Filtros] Categorías:',
          cats
        );

        this.categorias = cats || [];
      },

      error: (err) => {

        console.error(
          '[Filtros] Error categorías:',
          err
        );


        this.categorias = [
          {
            id: 1,
            nombre: 'Desarrollo Web'
          },
          {
            id: 2,
            nombre: 'Diseño UI/UX'
          },
          {
            id: 3,
            nombre: 'Mobile Apps'
          }
        ];
      }
    });
  }


  emitirFiltros(): void {

    this.cambioFiltros.emit({

      busqueda: this.busqueda,

      categoria: this.filtroCategoria,

      presupuesto: this.filtroPresupuesto
    });

    console.log(
      '[Filtros] Emitidos:',
      {
        busqueda: this.busqueda,
        categoria: this.filtroCategoria,
        presupuesto: this.filtroPresupuesto
      }
    );
  }

  limpiarFiltros(): void {

    this.busqueda = '';

    this.filtroCategoria = '';

    this.filtroPresupuesto = '';

    this.emitirFiltros();
  }
}
