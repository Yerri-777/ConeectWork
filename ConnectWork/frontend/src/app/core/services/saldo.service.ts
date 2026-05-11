import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SaldoService {

  private USER_KEY =
    'connectwork_usuarios';

  private COMISION_KEY =
    'connectwork_comision_config';

  private PLATAFORMA_KEY =
    'connectwork_saldo_plataforma';

  constructor() {

    console.log(
      '[SaldoService] Inicializando servicio...'
    );

    this.inicializarConfiguracionAdmin();
  }

  /**
   * CONFIGURACIÓN INICIAL
   */
  private inicializarConfiguracionAdmin(): void {

    /**
     * CONFIG COMISIÓN
     */
    if (
      !localStorage.getItem(
        this.COMISION_KEY
      )
    ) {

      localStorage.setItem(

        this.COMISION_KEY,

        JSON.stringify({
          porcentaje: 10
        })
      );

      console.log(
        '[SaldoService] ✓ Comisión inicial creada'
      );
    }

    /**
     * SALDO PLATAFORMA
     */
    if (
      !localStorage.getItem(
        this.PLATAFORMA_KEY
      )
    ) {

      localStorage.setItem(

        this.PLATAFORMA_KEY,

        JSON.stringify({

          total: 250000,

          historial: []
        })
      );

      console.log(
        '[SaldoService] ✓ Saldo plataforma creado'
      );
    }
  }

  /**
   * OBTENER USER ID
   */
  private getUserId(): number {

    const userJson =

      localStorage.getItem('usuario')

      ||

      localStorage.getItem(
        'connectwork_user'
      );

    if (!userJson) {

      console.warn(
        '[SaldoService] ⚠ No existe sesión activa'
      );

      return 0;
    }

    try {

      const user =
        JSON.parse(userJson);

      return Number(user.id) || 0;

    } catch (error) {

      console.error(
        '[SaldoService] ✗ Error parseando sesión',
        error
      );

      return 0;
    }
  }

  /**
   * SINCRONIZAR SESIÓN
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
      '[SaldoService] ✓ Sesión sincronizada'
    );
  }

  /**
   * ASEGURAR USUARIO
   * EN STORAGE
   */
  private asegurarUsuarioEnStorage(
    userId: number
  ): any {

    let usuarios = JSON.parse(

      localStorage.getItem(
        this.USER_KEY
      ) || '[]'
    );

    let usuario =
      usuarios.find(
        (u: any) => u.id == userId
      );

    /**
     * RESTAURAR
     * DESDE SESIÓN
     */
    if (!usuario) {

      const sessionUser = JSON.parse(

        localStorage.getItem('usuario')

        ||

        localStorage.getItem(
          'connectwork_user'
        )

        ||

        '{}'
      );

      if (sessionUser?.id) {

        usuario = {

          ...sessionUser,

          saldo:
            Number(sessionUser.saldo) || 0,

          movimientos:
            sessionUser.movimientos || [],

          bloqueado:
            sessionUser.bloqueado || []
        };

        usuarios.push(usuario);

        localStorage.setItem(

          this.USER_KEY,

          JSON.stringify(usuarios)
        );

        console.log(
          '[SaldoService] ✓ Usuario restaurado automáticamente'
        );
      }
    }

    return usuario;
  }

  /**
   * CONSULTAR SALDO
   */
  consultarSaldo():
    Observable<any> {

    const userId =
      this.getUserId();

    const usuario =
      this.asegurarUsuarioEnStorage(
        userId
      );

    console.log(
      '[SaldoService] Buscando ID:',
      userId
    );

    console.log(
      '[SaldoService] Usuario encontrado:',
      usuario
    );

    return of({

      disponible:
        Number(usuario?.saldo) || 0,

      historial:
        usuario?.movimientos || [],

      bloqueado:
        usuario?.bloqueado || []
    });
  }

  /**
   * RECARGAR SALDO
   */
  recargar(
    monto: number
  ): Observable<any> {

    console.log(
      '[SaldoService] Recargando saldo:',
      monto
    );

    const userId =
      this.getUserId();

    /**
     * VALIDAR
     */
    if (
      !monto ||
      Number(monto) <= 0
    ) {

      return throwError(
        () =>
          new Error(
            'Monto inválido.'
          )
      );
    }

    /**
     * ASEGURAR USUARIO
     */
    this.asegurarUsuarioEnStorage(
      userId
    );

    let usuarios = JSON.parse(

      localStorage.getItem(
        this.USER_KEY
      ) || '[]'
    );

    let usuarioActualizado:
      any = null;

    usuarios = usuarios.map(

      (u: any) => {

        if (u.id == userId) {

          const nuevoSaldo =

            (Number(u.saldo) || 0)

            +

            Number(monto);

          const nuevoMovimiento = {

            id: Date.now(),

            descripcion:
              'Recarga de saldo',

            tipo: 'INGRESO',

            monto:
              Number(monto),

            fecha:
              new Date()
          };

          usuarioActualizado = {

            ...u,

            saldo:
              nuevoSaldo,

            movimientos: [

              nuevoMovimiento,

              ...(u.movimientos || [])
            ]
          };

          return usuarioActualizado;
        }

        return u;
      }
    );

    /**
     * VALIDAR
     */
    if (!usuarioActualizado) {

      console.error(
        '[SaldoService] ✗ Usuario no encontrado'
      );

      return throwError(
        () =>
          new Error(
            'Usuario no encontrado en la base de datos local.'
          )
      );
    }

    /**
     * GUARDAR
     */
    localStorage.setItem(

      this.USER_KEY,

      JSON.stringify(usuarios)
    );

    this.sincronizarSesion(
      usuarioActualizado
    );

    console.log(
      '[SaldoService] ✓ Base de datos y sesión sincronizadas'
    );

    return of({
      success: true
    });
  }

  /**
   * DEBITAR PAGO
   */
  debitarPago(
    monto: number,
    proyectoTitulo: string
  ): Observable<any> {

    console.log(
      '[SaldoService] Debitando pago:',
      monto
    );

    const userId =
      this.getUserId();

    /**
     * ASEGURAR CLIENTE
     */
    const cliente =
      this.asegurarUsuarioEnStorage(
        userId
      );

    /**
     * VALIDAR SALDO
     */
    if (
      !cliente ||
      Number(cliente.saldo) <
      Number(monto)
    ) {

      console.error(
        '[SaldoService] ✗ Saldo insuficiente'
      );

      return throwError(
        () =>
          new Error(
            'Saldo insuficiente.'
          )
      );
    }

    let usuarios = JSON.parse(

      localStorage.getItem(
        this.USER_KEY
      ) || '[]'
    );

    let usuarioActualizado:
      any = null;

    usuarios = usuarios.map(

      (u: any) => {

        if (u.id == userId) {

          usuarioActualizado = {

            ...u,

            saldo:
              Number(u.saldo)
              - Number(monto),

            movimientos: [

              {
                id: Date.now(),

                descripcion:
                  `Pago de proyecto: ${proyectoTitulo}`,

                tipo: 'EGRESO',

                monto:
                  Number(monto),

                fecha:
                  new Date()
              },

              ...(u.movimientos || [])
            ]
          };

          return usuarioActualizado;
        }

        return u;
      }
    );

    /**
     * GUARDAR
     */
    localStorage.setItem(

      this.USER_KEY,

      JSON.stringify(usuarios)
    );

    this.sincronizarSesion(
      usuarioActualizado
    );

    console.log(
      '[SaldoService] ✓ Pago debitado'
    );

    return of(true);
  }

  /**
   * PAGAR FREELANCER
   */
  pagarFreelancer(
    freelancerId: number,
    monto: number,
    proyectoTitulo: string
  ): Observable<any> {

    console.log(
      '[SaldoService] Pagando freelancer:',
      freelancerId
    );

    let usuarios = JSON.parse(

      localStorage.getItem(
        this.USER_KEY
      ) || '[]'
    );

    let freelancerActualizado:
      any = null;

    usuarios = usuarios.map(

      (u: any) => {

        if (u.id == freelancerId) {

          const nuevoSaldo =

            (Number(u.saldo) || 0)

            +

            Number(monto);

          const nuevoMovimiento = {

            id: Date.now(),

            descripcion:
              `Pago recibido: ${proyectoTitulo}`,

            tipo: 'INGRESO',

            monto:
              Number(monto),

            fecha:
              new Date()
          };

          freelancerActualizado = {

            ...u,

            saldo:
              nuevoSaldo,

            movimientos: [

              nuevoMovimiento,

              ...(u.movimientos || [])
            ]
          };

          return freelancerActualizado;
        }

        return u;
      }
    );

    /**
     * VALIDAR
     */
    if (!freelancerActualizado) {

      console.error(
        '[SaldoService] ✗ Freelancer no encontrado'
      );

      return throwError(
        () =>
          new Error(
            'Freelancer no encontrado.'
          )
      );
    }

    /**
     * GUARDAR DB
     */
    localStorage.setItem(

      this.USER_KEY,

      JSON.stringify(usuarios)
    );

    /**
     * 🔥 SINCRONIZAR SI
     * EL FREELANCER
     * ES EL ACTUAL
     */
    const currentUserId =
      this.getUserId();

    if (
      currentUserId ==
      freelancerId
    ) {

      this.sincronizarSesion(
        freelancerActualizado
      );

      console.log(
        '[SaldoService] ✓ Sesión freelancer sincronizada'
      );
    }

    console.log(
      '[SaldoService] ✓ Freelancer pagado correctamente'
    );

    console.log(
      '[SaldoService] Nuevo saldo freelancer:',
      freelancerActualizado.saldo
    );

    return of({
      success: true,
      saldo:
        freelancerActualizado.saldo
    });
  }

  /**
   * SALDO PLATAFORMA
   */
  obtenerSaldoPlataforma():
    Observable<any> {

    const data = JSON.parse(

      localStorage.getItem(
        this.PLATAFORMA_KEY
      )

      ||

      '{"total":250000}'
    );

    return of(data);
  }

  /**
   * HISTORIAL COMISIONES
   */
  obtenerHistorialComisiones():
    Observable<any[]> {

    const historial = JSON.parse(

      localStorage.getItem(
        'historial_comisiones'
      ) || '[]'
    );

    return of(historial);
  }

  /**
   * CAMBIAR COMISIÓN
   */
  cambiarComision(
    porcentaje: number
  ): Observable<any> {

    localStorage.setItem(

      this.COMISION_KEY,

      JSON.stringify({

        porcentaje,

        fecha: new Date()
      })
    );

    console.log(
      '[SaldoService] ✓ Comisión actualizada:',
      porcentaje
    );

    return of({

      success: true,

      porcentaje
    });
  }

  /**
   * OBTENER COMISIÓN
   */
  obtenerComisionActual():
    Observable<any> {

    const config = JSON.parse(

      localStorage.getItem(
        this.COMISION_KEY
      )

      ||

      '{"porcentaje":10}'
    );

    return of(config);
  }
}
