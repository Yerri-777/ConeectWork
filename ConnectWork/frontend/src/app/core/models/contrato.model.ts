/**
 * CONTRATO - Modelo para contratos
 */
export interface Contrato {
  id?: number;
  propuestaId: number;
  proyectoId: number;
  clienteId: number;
  freelancerId: number;
  fechaInicio?: string;
  monto: number;
  comisionPct: number;
  comisionMonto: number;
  estado?: 'ACTIVO' | 'COMPLETADO' | 'CANCELADO';
  motivoCancelacion?: string;
  createdAt?: string;
  fechaCompletado?: string;
  tituloProyecto?: string;
  nombreCliente?: string;
  nombreFreelancer?: string;
}

/**
 * Datos adicionales para ver contrato
 */
export interface ContratoDetalle extends Contrato {
  entregas?: any[];
  ultimaEntrega?: any;
  calificaciones?: any;
  diasActivos?: number;
}

/**
 * Filtros para buscar contratos
 */
export interface FiltrosContrato {
  estado?: string;
  desde?: string;
  hasta?: string;
  clienteId?: number;
  freelancerId?: number;
}

/**
 * Payload para cancelar contrato
 */
export interface CancelarContratoPayload {
  motivo: string;
}
