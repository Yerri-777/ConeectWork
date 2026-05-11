
export enum RolUsuario {
  CLIENTE = 'CLIENTE',
  FREELANCER = 'FREELANCER',
  ADMIN = 'ADMIN'
}


export enum EstadoProyecto {
  ABIERTO = 'ABIERTO',
  EN_REVISION = 'EN_REVISION',
  EN_PROGRESO = 'EN_PROGRESO',
  ENTREGA_PENDIENTE = 'ENTREGA_PENDIENTE',
  COMPLETADO = 'COMPLETADO',
  CANCELADO = 'CANCELADO'
}

export enum EstadoPropuesta {
  PENDIENTE = 'PENDIENTE',
  ACEPTADA = 'ACEPTADA',
  RECHAZADA = 'RECHAZADA',
  RETIRADA = 'RETIRADA'
}


export enum EstadoContrato {
  ACTIVO = 'ACTIVO',
  COMPLETADO = 'COMPLETADO',
  CANCELADO = 'CANCELADO'
}


export enum EstadoEntrega {
  PENDIENTE = 'PENDIENTE',
  APROBADA = 'APROBADA',
  RECHAZADA = 'RECHAZADA'
}


export enum EstadoSolicitud {
  PENDIENTE = 'PENDIENTE',
  ACEPTADA = 'ACEPTADA',
  RECHAZADA = 'RECHAZADA'
}


export enum NivelExperiencia {
  JUNIOR = 'JUNIOR',
  SEMI_SENIOR = 'SEMI_SENIOR',
  SENIOR = 'SENIOR'
}


export enum TipoNotificacion {
  EXITO = 'exito',
  ERROR = 'error',
  INFO = 'info',
  ADVERTENCIA = 'advertencia'
}

export const MENSAJES = {
  // Éxito
  EXITO_LOGIN: 'Sesión iniciada correctamente',
  EXITO_REGISTRO: 'Registro completado. Por favor inicia sesión',
  EXITO_PERFIL_GUARDADO: 'Perfil guardado correctamente',
  EXITO_PROYECTO_CREADO: 'Proyecto publicado correctamente',
  EXITO_PROPUESTA_ENVIADA: 'Propuesta enviada correctamente',
  EXITO_PROPUESTA_ACEPTADA: 'Propuesta aceptada. Contrato generado',
  EXITO_ENTREGA_SUBIDA: 'Entrega subida correctamente',
  EXITO_ENTREGA_APROBADA: 'Entrega aprobada. Pago realizado',
  EXITO_CALIFICACION_GUARDADA: 'Calificación guardada correctamente',
  EXITO_SALDO_RECARGADO: 'Saldo recargado correctamente',
  EXITO_SOLICITUD_ENVIADA: 'Solicitud enviada correctamente',

  // Errores
  ERROR_LOGIN: 'Usuario o contraseña incorrectos',
  ERROR_USUARIO_EXISTE: 'El nombre de usuario ya existe',
  ERROR_CORREO_EXISTE: 'El correo ya está registrado',
  ERROR_SALDO_INSUFICIENTE: 'Saldo insuficiente para esta acción',
  ERROR_PERFIL_INCOMPLETO: 'Debes completar tu perfil primero',
  ERROR_PROPUESTA_EXISTENTE: 'Ya has enviado una propuesta para este proyecto',
  ERROR_HABILIDAD_REQUERIDA: 'No tienes las habilidades requeridas',
  ERROR_ACCESO_DENEGADO: 'No tienes permiso para acceder a este recurso',

  // Info
  INFO_CARGANDO: 'Cargando...',
  INFO_PERFIL_REQUERIDO: 'Debes completar tu perfil para continuar',
};

/**
 * Patrones de validación
 */
export const PATRONES = {
  CORREO: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  USERNAME: /^[a-zA-Z0-9_-]{3,20}$/,
  CONTRASEÑA: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/,
  TELEFONO: /^[0-9]{7,15}$/,
  CUI: /^[0-9]{13}$/,
  URL: /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/
};


export const LIMITES = {
  MIN_PRESUPUESTO: 10,
  MAX_PRESUPUESTO: 100000,
  MIN_PLAZO_DIAS: 1,
  MAX_PLAZO_DIAS: 365,
  MIN_TARIFA_HORA: 1,
  MAX_TARIFA_HORA: 1000,
  MIN_COMISION: 0,
  MAX_COMISION: 50,
  MAX_CARACTERES_DESCRIPCION: 2000,
  MAX_CARACTERES_PRESENTACION: 500
};
