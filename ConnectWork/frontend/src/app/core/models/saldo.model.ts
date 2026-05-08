/**
 * RECARGA_SALDO - Modelo para recargas de saldo
 */
export interface RecargaSaldo {
  id?: number;
  clienteId: number;
  monto: number;
  createdAt?: string;
}

/**
 * COMISION_CONFIG - Modelo para configuración de comisión
 */
export interface ComisionConfig {
  id?: number;
  porcentaje: number;
  fechaInicio?: string;
  fechaFin?: string;
  adminId?: number;
}

/**
 * Datos adicionales de saldo
 */
export interface ResumenSaldo {
  saldoActual: number;
  totalRecargas: number;
  totalGastado: number;
  totalProyectos: number;
  saldoDisponible: number;
}

/**
 * Historial de recargas
 */
export interface HistorialRecarga extends RecargaSaldo {
  clienteNombre?: string;
  saldoAnterior?: number;
  saldoNuevo?: number;
}

/**
 * Resumen de la plataforma
 */
export interface ResumenPlataforma {
  totalIngresos: number;
  totalContratos: number;
  totalComisiones: number;
  comisionActual: number;
}

/**
 * Payload para recargar saldo
 */
export interface RecargarSaldoPayload {
  monto: number;
}

/**
 * Payload para cambiar comisión
 */
export interface CambiarComisionPayload {
  porcentaje: number;
}
