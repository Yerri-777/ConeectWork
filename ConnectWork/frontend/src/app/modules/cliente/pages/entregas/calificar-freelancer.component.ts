import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CalificacionService } from '../../../../core/services/calificacion.service';
import { NotificationService } from '../../../../core/services/notification.service';

@Component({
  selector: 'app-calificar-freelancer',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './calificar-freelancer.component.html',
  styleUrls: ['./entregas.component.css']
})
export class CalificarFreelancerComponent implements OnInit {
  entregaId: string | null = null;
  freelancerId: number | null = null;
  puntuacion = 0;
  comentario = '';
  guardando = false;

  constructor(
    private route: ActivatedRoute,
    public router: Router,
    private calificacionService: CalificacionService,
    private notification: NotificationService
  ) {}

  ngOnInit(): void {
    this.entregaId = this.route.snapshot.paramMap.get('id');
    const fId = this.route.snapshot.queryParamMap.get('freelancerId');
    if (fId) this.freelancerId = Number(fId);
  }

  setRating(valor: number): void {
    this.puntuacion = valor;
  }

  enviarCalificacion(): void {
    if (this.puntuacion === 0) {
      this.notification.mostrarError('Por favor selecciona una puntuación.');
      return;
    }

    const userJson = localStorage.getItem('usuario');
    if (!userJson) {
      this.notification.mostrarError('No se encontró sesión de usuario o el usuario no está autenticado');
      return;
    }

    const usuarioActual = JSON.parse(userJson);

    if (!this.entregaId) {
      this.notification.mostrarError('ID de entrega no válido.');
      return;
    }

    this.guardando = true;

    const calificacionCompleta = {
      entregaId: Number(this.entregaId) || 0,
      clienteId: usuarioActual.id,
      freelancerId: this.freelancerId || 0,
      puntuacion: this.puntuacion,
      comentario: this.comentario
    };

    this.calificacionService.crear(calificacionCompleta).subscribe({
      next: () => {
        this.notification.mostrarExito('¡Gracias por tu calificación!');
        this.router.navigate(['/cliente/dashboard']);
      },
      error: (err: any) => {
        this.guardando = false;
        console.error('Error al calificar:', err);
        this.notification.mostrarError('No se pudo guardar la calificación.');
      }
    });
  }
}
