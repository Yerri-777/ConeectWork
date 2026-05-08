/**
 * CATEGORIA - Modelo para categorías de proyectos
 */
export interface Categoria {
  id?: number;
  nombre: string;
  descripcion?: string;
  activo?: boolean;
  createdAt?: string;
}

/**
 * Datos adicionales para listar categorías
 */
export interface CategoriaListado extends Categoria {
  habilidadesCount?: number;
  proyectosCount?: number;
}
