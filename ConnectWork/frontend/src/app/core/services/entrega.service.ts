import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class EntregaService {

  private KEY = 'connectwork_entregas';

  private CONTRATOS_KEY = 'connectwork_contratos';

  private USUARIOS_KEY = 'connectwork_usuarios';

  private PROYECTOS_KEY = 'connectwork_proyectos';

  constructor() {}

  /**
   * OBTENER ENTREGAS
   */
  private getEntregas(): any[] {

    try {

      const data = localStorage.getItem(
        this.KEY
      );

      return data
        ? JSON.parse(data)
        : [];

    } catch (error) {

      console.error(
        '[EntregaService] Error obteniendo entregas:',
        error
      );

      return [];
    }
  }

  /**
   * GUARDAR ENTREGAS
   */
  private saveEntregas(
    entregas: any[]
  ): void {

    localStorage.setItem(
      this.KEY,
      JSON.stringify(entregas)
    );
  }

  /**
   * SINCRONIZAR USUARIO EN SESIÓN
   */
  private sincronizarSesion(
    usuario: any
  ): void {

    if (!usuario) {
      return;
    }

    localStorage.setItem(
      'usuario',
      JSON.stringify(usuario)
    );

    localStorage.setItem(
      'connectwork_user',
      JSON.stringify(usuario)
    );

    console.log(
      '[EntregaService] ✓ Sesión sincronizada'
    );
  }

  /**
   * SUBIR ENTREGA
   */
  subir(entrega: any): Observable<any> {

    const entregas =
      this.getEntregas();

    let nuevaEntrega: any;

    /**
     * FORM DATA
     */
    if (entrega instanceof FormData) {

      const contratoId =
        entrega.get('contratoId');

      const contratos = JSON.parse(

        localStorage.getItem(
          this.CONTRATOS_KEY
        ) || '[]'
      );

      const contrato =
        contratos.find(

          (c: any) =>

            String(c.id) ===
            String(contratoId)
        );

      console.log(
        '[EntregaService.subir] Contrato encontrado:',
        contrato
      );

      /**
       * 🛡️ REFUERZO TOTAL
       * Buscar freelancerId
       * en cualquier estructura posible
       */
      const fId =

        contrato?.freelancerId ||

        contrato?.freelancer?.id ||

        contrato?.usuarioFreelancerId ||

        contrato?.freelancer_id ||

        null;

      console.log(
        '[EntregaService.subir] Freelancer ID detectado:',
        fId
      );

      nuevaEntrega = {

        id:
          Date.now(),

        contratoId:
          contratoId,

        proyectoId:
          contrato?.proyectoId,

        /**
         * ID ASEGURADO
         */
        freelancerId:
          fId,

        proyectoTitulo:

          contrato?.proyectoTitulo ||

          contrato?.proyecto?.titulo ||

          'Proyecto Desconocido',

        freelancerNombre:

          contrato?.freelancerNombre ||

          contrato?.freelancer?.nombreCompleto ||

          'Freelancer Demo',

        mensaje:
          entrega.get('mensaje'),

        monto:

          contrato?.montoAcordado ||

          contrato?.monto ||

          0,

        archivoUrl:
          'assets/docs/entrega_simulada.pdf',

        nombreArchivo:

          entrega.get('nombreArchivo') ||

          'archivo.pdf',

        fecha:
          new Date(),

        estado:
          'PENDIENTE'
      };

      console.log(
        '[EntregaService.subir] ✓ Nueva entrega creada:',
        nuevaEntrega
      );

    } else {

      /**
       * ENTREGA SIMPLE
       */
      nuevaEntrega = {

        ...entrega,

        id:
          Date.now(),

        fecha:
          new Date(),

        estado:
          'PENDIENTE'
      };

      console.log(
        '[EntregaService.subir] ✓ Entrega simple creada:',
        nuevaEntrega
      );
    }

    /**
     * GUARDAR ENTREGA
     */
    entregas.unshift(nuevaEntrega);

    this.saveEntregas(entregas);

    console.log(
      '[EntregaService.subir] ✓ Entrega guardada correctamente'
    );

    return of(nuevaEntrega);
  }

  /**
   * APROBAR Y FINALIZAR
   */
  aprobarYFinalizar(
    id: string | number
  ): Observable<any> {

    const entregas =
      this.getEntregas();

    const contratos = JSON.parse(

      localStorage.getItem(
        this.CONTRATOS_KEY
      ) || '[]'
    );

    let usuarios = JSON.parse(

      localStorage.getItem(
        this.USUARIOS_KEY
      ) || '[]'
    );

    const proyectos = JSON.parse(

      localStorage.getItem(
        this.PROYECTOS_KEY
      ) || '[]'
    );

    const sesionActual = JSON.parse(

      localStorage.getItem(
        'usuario'
      ) || '{}'
    );

    const entregaIndex =
      entregas.findIndex(

        e =>
          String(e.id) === String(id)
      );

    if (entregaIndex === -1) {

      return throwError(
        () =>
          new Error(
            'Entrega no encontrada'
          )
      );
    }

    const entrega =
      entregas[entregaIndex];

    const monto =
      Number(entrega.monto) || 0;

    console.log(
      '[EntregaService.aprobarYFinalizar] Procesando:',
      entrega
    );

    /**
     * VALIDAR FREELANCER ID
     */
    if (!entrega.freelancerId) {

      console.error(
        '[EntregaService] ✗ freelancerId no encontrado'
      );

      return throwError(
        () =>
          new Error(
            'No se encontró el freelancer asociado.'
          )
      );
    }

    let freelancerActualizado: any = null;

    let clienteActualizado: any = null;

    /**
     * ACTUALIZAR SALDOS
     * + MOVIMIENTOS
     */
    usuarios = usuarios.map(
      (u: any) => {

        /**
         * PAGAR FREELANCER
         */
        if (
          String(u.id) ===
          String(entrega.freelancerId)
        ) {

          const saldoAnterior =
            Number(u.saldo) || 0;

          const nuevoMovimiento = {

            id:
              Date.now(),

            descripcion:
              `Pago recibido: ${entrega.proyectoTitulo}`,

            tipo:
              'INGRESO',

            monto:
              Number(monto),

            fecha:
              new Date(),

            contratoId:
              entrega.contratoId,

            proyectoId:
              entrega.proyectoId
          };

          freelancerActualizado = {

            ...u,

            saldo:
              saldoAnterior + monto,

            movimientos: [

              nuevoMovimiento,

              ...(u.movimientos || [])
            ]
          };

          console.log(
            '[EntregaService] ✓ Pago freelancer aplicado:',
            freelancerActualizado
          );

          return freelancerActualizado;
        }

        /**
         * DESCONTAR CLIENTE
         */
        if (
          String(u.id) ===
          String(sesionActual.id)
        ) {

          const saldoAnterior =
            Number(u.saldo) || 0;

          const nuevoMovimiento = {

            id:
              Date.now() + 1,

            descripcion:
              `Pago de proyecto: ${entrega.proyectoTitulo}`,

            tipo:
              'EGRESO',

            monto:
              Number(monto),

            fecha:
              new Date(),

            contratoId:
              entrega.contratoId,

            proyectoId:
              entrega.proyectoId
          };

          clienteActualizado = {

            ...u,

            saldo:
              saldoAnterior - monto,

            movimientos: [

              nuevoMovimiento,

              ...(u.movimientos || [])
            ]
          };

          console.log(
            '[EntregaService] ✓ Pago cliente descontado:',
            clienteActualizado
          );

          return clienteActualizado;
        }

        return u;
      }
    );

    /**
     * APROBAR ENTREGA
     */
    entregas[
      entregaIndex
    ].estado =
      'APROBADA';

    entregas[
      entregaIndex
    ].fechaAprobacion =
      new Date();

    /**
     * ACTUALIZAR CONTRATO
     */
    const contratoIndex =
      contratos.findIndex(

        (c: any) =>

          String(c.id) ===
          String(entrega.contratoId)
      );

    if (contratoIndex !== -1) {

      contratos[
        contratoIndex
      ].estado =
        'COMPLETADO';

      contratos[
        contratoIndex
      ].fechaFinalizacion =
        new Date();

      console.log(
        '[EntregaService] ✓ Contrato completado'
      );
    }

    /**
     * ACTUALIZAR PROYECTO
     */
    const proyectoIndex =
      proyectos.findIndex(

        (p: any) =>

          String(p.id) ===
          String(entrega.proyectoId)
      );

    if (proyectoIndex !== -1) {

      proyectos[
        proyectoIndex
      ].estado =
        'COMPLETADO';

      proyectos[
        proyectoIndex
      ].fechaFinalizacion =
        new Date();

      console.log(
        '[EntregaService] ✓ Proyecto completado'
      );
    }

    /**
     * GUARDAR CAMBIOS
     */
    this.saveEntregas(entregas);

    localStorage.setItem(
      this.CONTRATOS_KEY,
      JSON.stringify(contratos)
    );

    localStorage.setItem(
      this.USUARIOS_KEY,
      JSON.stringify(usuarios)
    );

    localStorage.setItem(
      this.PROYECTOS_KEY,
      JSON.stringify(proyectos)
    );

    /**
     * SINCRONIZAR SESIÓN
     */
    if (
      String(sesionActual.id) ===
      String(freelancerActualizado?.id)
    ) {

      this.sincronizarSesion(
        freelancerActualizado
      );
    }

    if (
      String(sesionActual.id) ===
      String(clienteActualizado?.id)
    ) {

      this.sincronizarSesion(
        clienteActualizado
      );
    }

    console.log(
      '[EntregaService.aprobarYFinalizar] ✓ Finalizado correctamente'
    );

    console.log(
      '[EntregaService] ✓ Freelancer pagado:',
      freelancerActualizado?.saldo
    );

    return of({

      success: true,

      freelancerId:
        entrega.freelancerId,

      saldoFreelancer:
        freelancerActualizado?.saldo || 0
    });
  }

  /**
   * APROBAR SOLO
   */
  aprobarSolo(
    id: string | number
  ): Observable<any> {

    return this.aprobarYFinalizar(id);
  }

  /**
   * RECHAZAR ENTREGA
   */
  rechazar(
    id: string | number,
    motivo: string
  ): Observable<any> {

    const entregas =
      this.getEntregas();

    const actualizadas =
      entregas.map(e =>

        String(e.id) === String(id)

          ? {
              ...e,
              estado: 'RECHAZADA',
              feedback: motivo
            }

          : e
      );

    this.saveEntregas(actualizadas);

    console.log(
      '[EntregaService.rechazar] ✓ Entrega rechazada'
    );

    return of({
      success: true
    });
  }

  /**
   * OBTENER POR ID
   */
  obtenerPorId(
    id: string | number
  ): Observable<any> {

    const entrega =
      this.getEntregas().find(

        e =>
          String(e.id) === String(id)
      );

    return of(entrega);
  }

  /**
   * LISTAR PENDIENTES
   */
  listarPendientesCliente():
    Observable<any[]> {

    return of(

      this.getEntregas().filter(

        e =>
          e.estado === 'PENDIENTE'
      )
    );
  }

  /**
   * LISTAR TODAS
   */
  listarMias():
    Observable<any[]> {

    return of(
      this.getEntregas()
    );
  }

  /**
   * CONTAR POR ESTADO
   */
  contarPorEstado(
    estado: string
  ): Observable<{ total: number }> {

    const total =
      this.getEntregas().filter(

        e =>
          e.estado === estado
      ).length;

    return of({ total });
  }

  /**
   * LISTAR POR CONTRATO
   */
  listarPorContrato(
    contratoId: string | number
  ): Observable<any[]> {

    return of(

      this.getEntregas().filter(

        e =>

          String(e.contratoId) ===
          String(contratoId)
      )
    );
  }
}
