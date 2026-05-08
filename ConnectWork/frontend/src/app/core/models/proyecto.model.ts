
export type EstadoProyecto =
  | 'ABIERTO'
  | 'EN_REVISION'
  | 'EN_PROGRESO'
  | 'ENTREGA_PENDIENTE'
  | 'COMPLETADO'
  | 'CANCELADO';

export interface Proyecto {
  id?: number;
  clienteId: number;
  categoriaId: number;
  titulo: string;
  descripcion: string;
  presupuestoMin: number;
  presupuestoMax: number;
  plazo: number;
  fechaLimite: string;
  estado?: EstadoProyecto;
  habilidadesIds?: number[];
  propuestasCount?: number;
  categoria?: any;
  cliente?: any;
  nombreCliente?: string;
  nombreCategoria?: string;
  createdAt?: string;
}

export interface ProyectoListado extends Proyecto {
  propuestasActivas?: number;
  contratosActivos?: number;
}

export interface FiltrosProyecto {
  estado?: EstadoProyecto | string;
  categoriaId?: number;
  habilidadId?: number;
  presupuestoMin?: number;
  presupuestoMax?: number;
  desde?: string;
  hasta?: string;
  buscar?: string;
}

export class ProyectoModel implements Proyecto {
  id?: number;
  clienteId: number;
  categoriaId: number;
  titulo: string;
  descripcion: string;
  presupuestoMin: number;
  presupuestoMax: number;
  plazo: number;
  fechaLimite: string;
  estado?: EstadoProyecto;
  habilidadesIds?: number[];
  propuestasCount?: number;
  categoria?: any;
  cliente?: any;
  nombreCliente?: string;
  nombreCategoria?: string;
  createdAt?: string;

  constructor(data: Proyecto) {
    this.id = data.id;
    this.clienteId = data.clienteId;
    this.categoriaId = data.categoriaId;
    this.titulo = data.titulo;
    this.descripcion = data.descripcion;
    this.presupuestoMin = data.presupuestoMin || 0;
    this.presupuestoMax = data.presupuestoMax || 0;
    this.plazo = data.plazo || 0;
    this.fechaLimite = data.fechaLimite || '';
    this.estado = data.estado;
    this.habilidadesIds = data.habilidadesIds || [];
    this.propuestasCount = data.propuestasCount || 0;
    this.categoria = data.categoria;
    this.cliente = data.cliente;
    this.nombreCliente = data.nombreCliente;
    this.nombreCategoria = data.nombreCategoria;
    this.createdAt = data.createdAt;
  }

  static fromJSON(raw: Partial<Proyecto>): ProyectoModel {
    const data: Proyecto = {
      id: raw.id,
      clienteId: raw.clienteId || 0,
      categoriaId: raw.categoriaId || 0,
      titulo: raw.titulo || '',
      descripcion: raw.descripcion || '',
      presupuestoMin: raw.presupuestoMin || 0,
      presupuestoMax: raw.presupuestoMax || 0,
      plazo: raw.plazo || 0,
      fechaLimite: raw.fechaLimite || '',
      estado: raw.estado,
      habilidadesIds: raw.habilidadesIds || [],
      propuestasCount: raw.propuestasCount || 0,
      categoria: raw.categoria,
      cliente: raw.cliente,
      nombreCliente: raw.nombreCliente,
      nombreCategoria: raw.nombreCategoria,
      createdAt: raw.createdAt
    };
    return new ProyectoModel(data);
  }

  toDTO(): Proyecto {
    return {
      id: this.id,
      clienteId: this.clienteId,
      categoriaId: this.categoriaId,
      titulo: this.titulo,
      descripcion: this.descripcion,
      presupuestoMin: this.presupuestoMin,
      presupuestoMax: this.presupuestoMax,
      plazo: this.plazo,
      fechaLimite: this.fechaLimite,
      estado: this.estado,
      habilidadesIds: this.habilidadesIds,
      propuestasCount: this.propuestasCount,
      categoria: this.categoria,
      cliente: this.cliente,
      nombreCliente: this.nombreCliente,
      nombreCategoria: this.nombreCategoria,
      createdAt: this.createdAt
    };
  }

  getPresupuestoTexto(currency: string = 'Q'): string {
    try {
      if (!this.presupuestoMin || !this.presupuestoMax) {
        return 'Q0.00 - Q0.00';
      }

      const min = this.presupuestoMin.toLocaleString('es-GT', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      });

      const max = this.presupuestoMax.toLocaleString('es-GT', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      });

      return `${currency}${min} - ${currency}${max}`;
    } catch (error) {
      return 'Q0.00 - Q0.00';
    }
  }

  isAbierto(): boolean {
    return this.estado === 'ABIERTO';
  }

  getClienteInicial(): string {
    try {
      const name = this.nombreCliente || '';
      if (!name) return 'U';

      const parts = name.trim().split(/\s+/);
      const initials = parts
        .map(p => p[0]?.toUpperCase() || '')
        .slice(0, 2)
        .join('');

      return initials || 'U';
    } catch (error) {
      return 'U';
    }
  }

  getDiasRestantes(): number {
    try {
      if (!this.fechaLimite) {
        return this.plazo || 0;
      }

      const hoy = new Date();
      hoy.setHours(0, 0, 0, 0);

      const fecha = new Date(this.fechaLimite);
      fecha.setHours(0, 0, 0, 0);

      const diferencia = fecha.getTime() - hoy.getTime();
      const dias = Math.ceil(diferencia / (1000 * 3600 * 24));

      return dias > 0 ? dias : 0;
    } catch (error) {
      return 0;
    }
  }

  getEstadoColor(): string {
    switch (this.estado) {
      case 'ABIERTO':
        return 'green';
      case 'EN_PROGRESO':
        return 'blue';
      case 'ENTREGA_PENDIENTE':
        return 'orange';
      case 'COMPLETADO':
        return 'gray';
      case 'CANCELADO':
        return 'red';
      default:
        return 'gray';
    }
  }

  getEstadoTexto(): string {
    switch (this.estado) {
      case 'ABIERTO':
        return 'Abierto';
      case 'EN_REVISION':
        return 'En revision';
      case 'EN_PROGRESO':
        return 'En progreso';
      case 'ENTREGA_PENDIENTE':
        return 'Entrega pendiente';
      case 'COMPLETADO':
        return 'Completado';
      case 'CANCELADO':
        return 'Cancelado';
      default:
        return 'Desconocido';
    }
  }
}
