/**
 * USUARIO - Modelo base del usuario
 */
export interface Usuario {
  id: number;
  nombreCompleto: string;
  username: string;
  correo: string;
  telefono?: string;
  direccion?: string;
  cui?: string;
  fechaNacimiento?: string;
  rol: 'CLIENTE' | 'FREELANCER' | 'ADMIN';
  saldo: number;
  activo: boolean;
  perfilCompleto: boolean;
  createdAt?: string;
}

/**
 * PERFIL CLIENTE - Extensión del perfil para clientes
 */
export interface PerfilCliente {
  id?: number;
  usuarioId?: number;
  descripcion: string;
  sector: string;
  sitioWeb?: string;
}

/**
 * PERFIL FREELANCER - Extensión del perfil para freelancers
 */
export interface PerfilFreelancer {
  id?: number;
  usuarioId?: number;
  biografia: string;
  nivelExperiencia: 'JUNIOR' | 'SEMI_SENIOR' | 'SENIOR';
  tarifaHora: number;
  calificacionPromedio?: number;
  totalCalificaciones?: number;
  habilidadesIds?: number[];
}

/**
 * Payload de login
 */
export interface LoginPayload {
  username: string;
  password: string;
}

/**
 * Response de login/registro
 */
export interface AuthResponse {
  token: string;
  id: number;
  nombreCompleto: string;
  username: string;
  correo: string;
  rol: 'CLIENTE' | 'FREELANCER' | 'ADMIN';
  saldo: number;
  perfilCompleto: boolean;
}

/**
 * Payload de registro
 */
export interface RegistroPayload {
  nombreCompleto: string;
  username: string;
  password: string;
  correo: string;
  telefono: string;
  direccion: string;
  cui: string;
  fechaNacimiento: string;
  rol: 'CLIENTE' | 'FREELANCER' | 'ADMIN';
}
