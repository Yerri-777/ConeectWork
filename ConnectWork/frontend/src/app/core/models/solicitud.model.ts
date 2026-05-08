/**
 * SOLICITUD_HABILIDAD - Modelo para solicitudes de nuevas habilidades
 */
export interface SolicitudHabilidad {
  id?: number;
  freelancerId: number;
  nombre: string;
  descripcion?: string;
  estado?: 'PENDIENTE' | 'ACEPTADA' | 'RECHAZADA';
  adminRevisorId?: number;
  nombreFreelancer?: string;
  createdAt?: string;
}

/**
 * SOLICITUD_CATEGORIA - Modelo para solicitudes de nuevas categorías
 */
export interface SolicitudCategoria {
  id?: number;
  clienteId: number;
  nombre: string;
  descripcion?: string;
  estado?: 'PENDIENTE' | 'ACEPTADA' | 'RECHAZADA';
  adminRevisorId?: number;
  nombreCliente?: string;
  createdAt?: string;
}

/**
 * Datos adicionales para solicitudes
 */
export interface SolicitudDetalle {
  id: number;
  nombre: string;
  descripcion?: string;
  estado: 'PENDIENTE' | 'ACEPTADA' | 'RECHAZADA';
  solicitanteName?: string;
  adminReviewerName?: string;
  createdAt: string;
  reviewedAt?: string;
}

/**
 * Filtros para buscar solicitudes
 */
export interface FiltrosSolicitud {
  estado?: string;
  desde?: string;
  hasta?: string;
  solicitanteId?: number;
}

/**
 * Resumen de solicitudes pendientes
 */
export interface SolicitudesPendientes {
  habilidadesPendientes: number;
  categoriasPendientes: number;
  totalPendientes: number;
}
