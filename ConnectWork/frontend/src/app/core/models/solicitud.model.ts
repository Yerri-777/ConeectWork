
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


export interface FiltrosSolicitud {
  estado?: string;
  desde?: string;
  hasta?: string;
  solicitanteId?: number;
}

export interface SolicitudesPendientes {
  habilidadesPendientes: number;
  categoriasPendientes: number;
  totalPendientes: number;
}
