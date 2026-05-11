
export interface Categoria {
  id?: number;
  nombre: string;
  descripcion?: string;
  activo?: boolean;
  createdAt?: string;
}

export interface CategoriaListado extends Categoria {
  habilidadesCount?: number;
  proyectosCount?: number;
}
