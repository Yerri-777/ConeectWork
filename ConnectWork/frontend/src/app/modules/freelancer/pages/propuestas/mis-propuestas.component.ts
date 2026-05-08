import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
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
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.cargarPropuestas();
  }

  private cargarPropuestas(): void {
    this.propuestaService.listarMias().subscribe({
      next: (data: any[]) => {
        this.propuestas = data;
        this.filtrar();
      }
    });
  }

  filtrar(): void {
    this.propuestasFiltradas = this.propuestas.filter(p =>
      this.filtroEstado === '' || p.estado === this.filtroEstado
    );
  }

  retirarPropuesta(propuesta: any): void {
    this.propuestaSeleccionada = propuesta;
    this.modalAbierto = true;
  }

  cerrarModal(): void {
    this.modalAbierto = false;
  }

  confirmarRetiro(): void {
    if (!this.propuestaSeleccionada) return;
    this.propuestaService.retirar(this.propuestaSeleccionada.id).subscribe({
      next: () => {
        this.notificationService.mostrarExito('Propuesta retirada');
        this.cerrarModal();
        this.cargarPropuestas();
      }
    });
  }
}
