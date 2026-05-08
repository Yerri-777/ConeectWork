import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';

export interface Calificacion {
  id?: number;
  entregaId: number;
  clienteId: number;
  freelancerId: number;
  puntuacion: number;
  comentario: string;
  createdAt?: Date;
}

@Injectable({
  providedIn: 'root'
})
export class CalificacionService {

  constructor(private apiService: ApiService) {}

  crear(calificacion: Calificacion): Observable<Calificacion> {
    return this.apiService.post<Calificacion>('/calificaciones', calificacion);
  }

  calificar(calificacion: Calificacion): Observable<Calificacion> {
    return this.crear(calificacion);
  }

  obtener(id: number): Observable<Calificacion> {
    return this.apiService.get<Calificacion>(`/calificaciones/${id}`);
  }

  actualizar(id: number, calificacion: Calificacion): Observable<Calificacion> {
    return this.apiService.put<Calificacion>(`/calificaciones/${id}`, calificacion);
  }

  obtenerPorFreelancer(freelancerId: number): Observable<Calificacion[]> {
    return this.apiService.get<Calificacion[]>(`/freelancers/${freelancerId}/calificaciones`);
  }

  obtenerPromedio(freelancerId: number): Observable<{ promedio: number; total: number }> {
    return this.apiService.get<{ promedio: number; total: number }>(
      `/freelancers/${freelancerId}/calificacion-promedio`
    );
  }

  obtenerDadasPorCliente(clienteId: number): Observable<Calificacion[]> {
    return this.apiService.get<Calificacion[]>(
      `/clientes/${clienteId}/calificaciones-dadas`
    );
  }

  verificarCalificacionExistente(entregaId: number): Observable<boolean> {
    return this.apiService.get<boolean>(
      `/calificaciones/verificar/${entregaId}`
    );
  }

  eliminar(id: number): Observable<void> {
    return this.apiService.delete<void>(`/calificaciones/${id}`);
  }

  generarEstrellas(puntuacion: number): string {
    const estrellas = Math.round(puntuacion);
    return '⭐'.repeat(Math.min(estrellas, 5)) + '☆'.repeat(Math.max(0, 5 - estrellas));
  }

  esValida(puntuacion: number): boolean {
    return puntuacion >= 1 && puntuacion <= 5;
  }

  obtenerTextoCalificacion(puntuacion: number): string {
    switch (Math.round(puntuacion)) {
      case 5:
        return 'Excelente';
      case 4:
        return 'Muy bueno';
      case 3:
        return 'Bueno';
      case 2:
        return 'Aceptable';
      case 1:
        return 'Necesita mejora';
      default:
        return 'Sin calificación';
    }
  }
}
