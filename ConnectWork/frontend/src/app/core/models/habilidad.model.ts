/**
 * HABILIDAD - Modelo para habilidades
 */
export interface Habilidad {
  id?: number;
  categoriaId: number;
  nombre: string;
  descripcion?: string;
  activo?: boolean;
  nombreCategoria?: string;
  createdAt?: string;
}

/**
 * Datos adicionales para listar habilidades
 */
export interface HabilidadListado extends Habilidad {
  freelancersCount?: number;
  proyectosCount?: number;
}
