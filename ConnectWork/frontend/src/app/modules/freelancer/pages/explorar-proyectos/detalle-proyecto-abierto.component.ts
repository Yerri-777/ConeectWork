import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { ProyectoService } from '../../../../core/services/proyecto.service';

@Component({
  selector: 'app-detalle-proyecto-abierto',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule
  ],
  templateUrl: './detalle-proyecto-abierto.component.html',
  styleUrls: ['./proyectos-abiertos.component.css']
})
export class DetalleProyectoAbiertoComponent implements OnInit {

  proyecto: any = null;
  cargando = true;
  errorCarga = false;

  constructor(
    private route: ActivatedRoute,
    private proyectoService: ProyectoService
  ) {}

  ngOnInit(): void {
    this.cargarProyecto();
  }


  cargarProyecto(): void {
    const id = this.route.snapshot.paramMap.get('id');

    if (!id) {
      console.error('ID del proyecto inválido');
      this.errorCarga = true;
      this.cargando = false;
      return;
    }

    this.cargando = true;


    this.proyectoService.obtenerPorId(id).subscribe({
      next: (data: any) => {
        console.log('[DetalleProyecto] Proyecto desde API:', data);
        if (data) {
          this.proyecto = data;
          this.cargando = false;
        } else {

          this.buscarEnLocalStorage(id);
        }
      },
      error: (err: any) => {
        console.warn('[DetalleProyecto] API falló, buscando en LocalStorage:', err);
        this.buscarEnLocalStorage(id);
      }
    });
  }


  private buscarEnLocalStorage(id: string): void {
    const proyectosRaw = localStorage.getItem('connectwork_proyectos');
    if (proyectosRaw) {
      const proyectos = JSON.parse(proyectosRaw);
      const encontrado = proyectos.find((p: any) => Number(p.id) === Number(id));

      if (encontrado) {
        this.proyecto = encontrado;
        this.errorCarga = false;
      } else {
        this.errorCarga = true;
      }
    } else {
      this.errorCarga = true;
    }
    this.cargando = false;
  }


  getPresupuestoTexto(proyecto: any): string {
    try {
      if (!proyecto) return 'Q0.00 - Q0.00';

      const min = Number(proyecto.presupuestoMin || proyecto.presupuestoMinimo || 0);
      const max = Number(proyecto.presupuestoMax || proyecto.presupuestoMaximo || 0);

      const minTexto = min.toLocaleString('es-GT', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
      const maxTexto = max.toLocaleString('es-GT', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

      return `Q${minTexto} - Q${maxTexto}`;
    } catch (error) {
      console.error('Error presupuesto:', error);
      return 'Q0.00 - Q0.00';
    }
  }


  getCategoriaNombre(proyecto: any): string {
    try {
      if (!proyecto) return 'Sin categoría';

      if (proyecto.categoria && typeof proyecto.categoria === 'object') {
        return (proyecto.categoria.nombre || 'Sin categoría');
      }

      if (typeof proyecto.categoria === 'string') {
        return proyecto.categoria;
      }

      return 'Sin categoría';
    } catch (error) {
      console.error('Error categoría:', error);
      return 'Sin categoría';
    }
  }


  getPropuestasCount(proyecto: any): number {
    try {
      if (!proyecto) return 0;
      const total = proyecto.propuestasCount || proyecto.totalPropuestas || 0;
      return Number(total);
    } catch (error) {
      console.error('Error propuestas:', error);
      return 0;
    }
  }


  getPlazo(proyecto: any): number {
    try {
      if (!proyecto) return 0;

      if (proyecto.plazo) {
        return Number(proyecto.plazo);
      }

      if (proyecto.fechaLimite) {
        const hoy = new Date();
        hoy.setHours(0, 0, 0, 0);
        const fechaLimite = new Date(proyecto.fechaLimite);
        fechaLimite.setHours(0, 0, 0, 0);
        const diferencia = fechaLimite.getTime() - hoy.getTime();
        const dias = Math.ceil(diferencia / (1000 * 60 * 60 * 24));
        return dias > 0 ? dias : 0;
      }
      return 0;
    } catch (error) {
      console.error('Error plazo:', error);
      return 0;
    }
  }


  getClienteNombre(proyecto: any): string {
    try {
      if (!proyecto?.cliente) return 'Cliente desconocido';

      if (typeof proyecto.cliente === 'object') {
        return (proyecto.cliente.nombreCompleto || proyecto.cliente.nombre || 'Cliente desconocido');
      }

      if (typeof proyecto.cliente === 'string') {
        return proyecto.cliente;
      }

      return 'Cliente desconocido';
    } catch (error) {
      console.error('Error cliente:', error);
      return 'Cliente desconocido';
    }
  }


  getClienteCalificacion(proyecto: any): number {
    try {
      if (!proyecto?.cliente) return 0;
      const calificacion = Number(proyecto.cliente.calificacion || 0);
      if (isNaN(calificacion)) return 0;
      return Math.min(Math.max(calificacion, 0), 5);
    } catch (error) {
      console.error('Error calificación:', error);
      return 0;
    }
  }

  tieneProyecto(): boolean {
    return !!this.proyecto;
  }

  tieneCliente(): boolean {
    return !!this.proyecto?.cliente;
  }
}
