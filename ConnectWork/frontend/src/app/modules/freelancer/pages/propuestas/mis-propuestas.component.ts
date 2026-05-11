import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';

import { PropuestaService } from '../../../../core/services/propuesta.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { ModalConfirmarComponent } from '../../../../shared/componentes/modal-confirmar/modal-confirmar.component';

@Component({
  selector: 'app-mis-propuestas',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, ModalConfirmarComponent],
  templateUrl: './mis-propuestas.component.html',
  styleUrls: ['./propuestas.component.css']
})
export class MisPropuestasComponent implements OnInit {

  propuestas: any[] = [];
  propuestasFiltradas: any[] = [];
  filtroEstado = '';
  propuestaSeleccionada: any = null;
  modalAbierto = false;

  constructor(
    private propuestaService: PropuestaService,
    private notificationService: NotificationService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.cargarPropuestas();
  }

  cargarPropuestas(): void {
    this.propuestaService.listarMias().subscribe({
      next: (data: any[]) => {

        this.propuestas = data.map(p => ({
          ...p,
          id: Number(p.id)
        }));
        this.filtrar();
      },
      error: (err) => {
        console.error('Error cargando propuestas:', err);
        this.propuestas = [];
        this.propuestasFiltradas = [];
      }
    });
  }

  filtrar(): void {
    if (!this.filtroEstado) {
      this.propuestasFiltradas = [...this.propuestas];
    } else {
      this.propuestasFiltradas = this.propuestas.filter(
        p => p.estado === this.filtroEstado
      );
    }
  }

  limpiarFiltros(): void {
    this.filtroEstado = '';
    this.router.navigate(['/freelancer/explorar']);
  }

  retirarPropuesta(propuesta: any): void {
    this.propuestaSeleccionada = propuesta;
    this.modalAbierto = true;
  }

  cerrarModal(): void {
    this.modalAbierto = false;
    this.propuestaSeleccionada = null;
  }

  confirmarRetiro(): void {
    if (!this.propuestaSeleccionada) return;

    this.propuestaService.retirar(this.propuestaSeleccionada.id).subscribe({
      next: () => {
        this.notificationService.mostrarExito('Propuesta retirada correctamente');
        this.modalAbierto = false;
        this.cargarPropuestas();
      },
      error: () => {
        this.notificationService.mostrarError('No se pudo retirar la propuesta');
      }
    });
  }
}
