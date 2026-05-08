/**
 * PROPUESTA - Modelo para propuestas
 */
export interface Propuesta {
  id?: number;
  proyectoId: number;
  freelancerId: number;
  montoOfertado: number;
  plazoDias: number;
  cartaPresentacion: string;
  estado?: 'PENDIENTE' | 'ACEPTADA' | 'rechazada' | 'RETIRADA';
  nombreFreelancer?: string;
  calificacionPromedio?: number;
  createdAt?: string;
}

/**
 * Datos adicionales para listar propuestas
 */
export interface PropuestaListado extends Propuesta {
  tituloProyecto?: string;
  presupuestoMax?: number;
  diasTranscurridos?: number;
}

/**
 * Filtros para buscar propuestas
 */
export interface FiltrosPropuesta {
  estado?: string;
  proyectoId?: number;
  freelancerId?: number;
  desde?: string;
  hasta?: string;
}
