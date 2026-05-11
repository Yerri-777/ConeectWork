import { Injectable } from '@angular/core';
import {
  Observable,
  of,
  throwError
} from 'rxjs';

export interface Calificacion {

  id?: number;

  entregaId: number;

  clienteId: number;

  freelancerId: number;

  puntuacion: number;

  comentario: string;

  createdAt?: Date;
}

@Injectable({
  providedIn: 'root'
})
export class CalificacionService {

  private KEY =
    'connectwork_calificaciones';

  private USER_KEY =
    'connectwork_usuarios';

  constructor() {}

  /**
   * CREAR CALIFICACIÓN
   */
  crear(
    calificacion: Calificacion
  ): Observable<Calificacion> {

    try {

      console.log(
        '[CalificacionService.crear] Iniciando...',
        calificacion
      );

      /**
       * VALIDAR freelancerId
       */
      if (
        !calificacion.freelancerId ||
        calificacion.freelancerId <= 0
      ) {

        console.error(
          '[CalificacionService.crear] freelancerId inválido:',
          calificacion.freelancerId
        );

        return throwError(
          () => new Error(
            'Freelancer ID inválido'
          )
        );
      }

      /**
       * VALIDAR puntuación
       */
      if (
        !this.esValida(
          calificacion.puntuacion
        )
      ) {

        console.error(
          '[CalificacionService.crear] Puntuación inválida'
        );

        return throwError(
          () => new Error(
            'Puntuación inválida'
          )
        );
      }

      /**
       * OBTENER STORAGE
       */
      const calificaciones = JSON.parse(

        localStorage.getItem(
          this.KEY
        ) || '[]'
      );

      const usuarios = JSON.parse(

        localStorage.getItem(
          this.USER_KEY
        ) || '[]'
      );

      /**
       * VALIDAR SI YA EXISTE
       */
      const yaExiste =
        calificaciones.some(

          (c: any) =>

            Number(c.entregaId) ===
            Number(calificacion.entregaId)
        );

      if (yaExiste) {

        console.warn(
          '[CalificacionService.crear] Ya existe una calificación para esta entrega'
        );

        return throwError(
          () => new Error(
            'La entrega ya fue calificada'
          )
        );
      }

      /**
       * CREAR OBJETO
       */
      const nuevaCalificacion:
        Calificacion = {

        ...calificacion,

        id:
          Date.now(),

        createdAt:
          new Date()
      };

      /**
       * GUARDAR
       */
      calificaciones.push(
        nuevaCalificacion
      );

      localStorage.setItem(

        this.KEY,

        JSON.stringify(
          calificaciones
        )
      );

      console.log(
        '[CalificacionService.crear] ✓ Calificación guardada'
      );

      /**
       * RECALCULAR PROMEDIO
       */
      const misCalificaciones =
        calificaciones.filter(

          (c: any) =>

            Number(c.freelancerId) ===
            Number(calificacion.freelancerId)
        );

      const suma =
        misCalificaciones.reduce(

          (
            acc: number,
            curr: any
          ) =>

            acc + Number(curr.puntuacion),

          0
        );

      const promedio =

        misCalificaciones.length > 0

          ? suma / misCalificaciones.length

          : 0;

      console.log(
        '[CalificacionService.crear] Nuevo promedio:',
        promedio
      );

      /**
       * ACTUALIZAR FREELANCER
       */
      const userIndex =
        usuarios.findIndex(

          (u: any) =>

            Number(u.id) ===
            Number(calificacion.freelancerId)
        );

      if (userIndex !== -1) {

        usuarios[userIndex].rating =
          promedio;

        usuarios[userIndex].totalReseñas =
          misCalificaciones.length;

        usuarios[userIndex].ultimaCalificacion =
          new Date();

        localStorage.setItem(

          this.USER_KEY,

          JSON.stringify(
            usuarios
          )
        );

        console.log(
          '[CalificacionService.crear] ✓ Freelancer actualizado'
        );

      } else {

        console.warn(
          '[CalificacionService.crear] Freelancer no encontrado en usuarios'
        );
      }

      /**
       * ACTUALIZAR USUARIO SESIÓN
       * SI EL FREELANCER LOGUEADO
       * ES EL MISMO
       */
      const usuarioSesion = JSON.parse(

        localStorage.getItem(
          'usuario'
        ) || '{}'
      );

      if (
        Number(usuarioSesion.id) ===
        Number(calificacion.freelancerId)
      ) {

        usuarioSesion.rating =
          promedio;

        usuarioSesion.totalReseñas =
          misCalificaciones.length;

        localStorage.setItem(
          'usuario',
          JSON.stringify(usuarioSesion)
        );

        console.log(
          '[CalificacionService.crear] ✓ Usuario sesión sincronizado'
        );
      }

      return of(
        nuevaCalificacion
      );

    } catch (error) {

      console.error(
        '[CalificacionService.crear] ✗ Error:',
        error
      );

      return throwError(
        () => error
      );
    }
  }

  /**
   * MÉTODO ALIAS
   */
  calificar(
    calificacion: Calificacion
  ): Observable<Calificacion> {

    console.log(
      '[CalificacionService.calificar] Redireccionando a crear()'
    );

    return this.crear(
      calificacion
    );
  }

  /**
   * OBTENER POR FREELANCER
   */
  obtenerPorFreelancer(
    freelancerId: number
  ): Observable<Calificacion[]> {

    const calificaciones = JSON.parse(

      localStorage.getItem(
        this.KEY
      ) || '[]'
    );

    const filtradas =
      calificaciones.filter(

        (c: any) =>

          Number(c.freelancerId) ===
          Number(freelancerId)
      );

    console.log(
      '[CalificacionService.obtenerPorFreelancer]',
      filtradas
    );

    return of(filtradas);
  }

  /**
   * OBTENER PROMEDIO
   */
  obtenerPromedio(
    freelancerId: number
  ): Observable<{
    promedio: number;
    total: number;
  }> {

    const calificaciones = JSON.parse(

      localStorage.getItem(
        this.KEY
      ) || '[]'
    );

    const filtradas =
      calificaciones.filter(

        (c: any) =>

          Number(c.freelancerId) ===
          Number(freelancerId)
      );

    if (
      filtradas.length === 0
    ) {

      return of({
        promedio: 0,
        total: 0
      });
    }

    const suma =
      filtradas.reduce(

        (
          acc: number,
          curr: any
        ) =>

          acc + Number(curr.puntuacion),

        0
      );

    const promedio =
      suma / filtradas.length;

    console.log(
      '[CalificacionService.obtenerPromedio]',
      promedio
    );

    return of({

      promedio,

      total:
        filtradas.length
    });
  }

  /**
   * VERIFICAR SI YA EXISTE
   */
  verificarCalificacionExistente(
    entregaId: number
  ): Observable<boolean> {

    const calificaciones = JSON.parse(

      localStorage.getItem(
        this.KEY
      ) || '[]'
    );

    const existe =
      calificaciones.some(

        (c: any) =>

          Number(c.entregaId) ===
          Number(entregaId)
      );

    console.log(
      '[CalificacionService.verificar]',
      existe
    );

    return of(existe);
  }

  /**
   * GENERAR ESTRELLAS
   */
  generarEstrellas(
    puntuacion: number
  ): string {

    const estrellas =
      Math.round(puntuacion);

    return (

      '⭐'.repeat(
        Math.min(estrellas, 5)
      )

      +

      '☆'.repeat(
        Math.max(0, 5 - estrellas)
      )
    );
  }

  /**
   * TEXTO CALIFICACIÓN
   */
  obtenerTextoCalificacion(
    puntuacion: number
  ): string {

    switch (
      Math.round(puntuacion)
    ) {

      case 5:
        return 'Excelente';

      case 4:
        return 'Muy bueno';

      case 3:
        return 'Bueno';

      case 2:
        return 'Aceptable';

      case 1:
        return 'Necesita mejora';

      default:
        return 'Sin calificación';
    }
  }

  /**
   * VALIDAR PUNTUACIÓN
   */
  esValida(
    puntuacion: number
  ): boolean {

    return (
      puntuacion >= 1 &&
      puntuacion <= 5
    );
  }
}
