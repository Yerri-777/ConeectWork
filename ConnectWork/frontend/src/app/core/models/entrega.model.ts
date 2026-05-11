
export interface Entrega {
  id?: number;
  contratoId: number;
  descripcion: string;
  archivosUrl: string;
  estado?: 'PENDIENTE' | 'APROBADA' | 'RECHAZADA';
  motivoRechazo?: string;
  createdAt?: string;
}


export interface EntregaDetalle extends Entrega {
  contratoDetalles?: any;
  freelancer?: any;
  cliente?: any;
  calificacion?: any;
}

/**
 * Filtros para buscar entregas
 */
export interface FiltrosEntrega {
  estado?: string;
  contratoId?: number;
  desde?: string;
  hasta?: string;
}


export interface RechazarEntregaPayload {
  motivo: string;
}

/**
 * Payload para calificar freelancer
 */
export interface CalificacionPayload {
  contratoId: number;
  estrellas: number; // 1-5
  comentario?: string;
}
