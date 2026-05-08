import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface Notificacion {
  id: string;
  mensaje: string;
  tipo: 'exito' | 'error' | 'info' | 'advertencia';
  duracion?: number;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private notificacionesSubject = new BehaviorSubject<Notificacion[]>([]);
  public notificaciones$ = this.notificacionesSubject.asObservable();

  constructor() {}

  /**
   * Mostrar notificación de éxito
   */
  mostrarExito(mensaje: string, duracion: number = 3000): void {
    this.agregarNotificacion(mensaje, 'exito', duracion);
  }

  /**
   * Mostrar notificación de error
   */
  mostrarError(mensaje: string, duracion: number = 5000): void {
    this.agregarNotificacion(mensaje, 'error', duracion);
  }

  /**
   * Mostrar notificación de información
   */
  mostrarInfo(mensaje: string, duracion: number = 3000): void {
    this.agregarNotificacion(mensaje, 'info', duracion);
  }

  /**
   * Mostrar notificación de advertencia
   */
  mostrarAdvertencia(mensaje: string, duracion: number = 4000): void {
    this.agregarNotificacion(mensaje, 'advertencia', duracion);
  }

  /**
   * Agregar notificación y auto-remover después de duracion
   */
  private agregarNotificacion(mensaje: string, tipo: 'exito' | 'error' | 'info' | 'advertencia', duracion: number): void {
    const id = Date.now().toString();
    const notificacion: Notificacion = { id, mensaje, tipo, duracion };

    const notificacionesActuales = this.notificacionesSubject.value;
    this.notificacionesSubject.next([...notificacionesActuales, notificacion]);

    // Auto-remover después de la duración
    if (duracion > 0) {
      setTimeout(() => {
        this.removerNotificacion(id);
      }, duracion);
    }
  }

  /**
   * Remover notificación
   */
  removerNotificacion(id: string): void {
    const notificacionesActuales = this.notificacionesSubject.value;
    this.notificacionesSubject.next(notificacionesActuales.filter(n => n.id !== id));
  }

  /**
   * Limpiar todas las notificaciones
   */
  limpiarTodas(): void {
    this.notificacionesSubject.next([]);
  }
}
