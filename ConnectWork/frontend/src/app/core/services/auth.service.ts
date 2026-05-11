import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';

import { environment } from '../../../environments/environment';
import { Usuario } from '../models/usuario.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private apiUrl = environment.apiUrl;

  private currentUserSubject = new BehaviorSubject<Usuario | null>(
    this.getUserFromStorage()
  );

  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient) {}

  login(username: string, password: string): Observable<any> {

    console.log('[AuthService.login] Enviando login para:', username);

    return this.http.post<any>(
      `${this.apiUrl}/api/auth/login`,
      { username, password }
    ).pipe(

      tap(response => {

        console.log(response);

        /**
         * Guardar token JWT
         */
        if (response.token || response.jwt) {

          localStorage.setItem(
            'connectwork_token',
            response.token || response.jwt
          );

          console.log(
            '[AuthService.login] ✓ Token guardado'
          );
        }

        /**
         * Guardar usuario
         */
        if (response.usuario || response.id) {

          const usuario: Usuario = {

            id:
              response.usuario?.id ||
              response.id,

            nombreCompleto:
              response.usuario?.nombreCompleto ||
              response.usuario?.nombre ||
              response.nombreCompleto ||
              response.nombre_completo ||
              response.nombre ||
              'Usuario',

            username:
              response.usuario?.username ||
              response.username ||
              '',

            correo:
              response.usuario?.correo ||
              response.correo ||
              '',

            rol:
              response.usuario?.rol ||
              response.rol ||
              'CLIENTE',

            saldo:
              response.usuario?.saldo ||
              response.saldo ||
              0,

            activo:
              (response.usuario?.activo ??
                response.activo) ?? true,

            perfilCompleto:
              response.usuario?.perfilCompleto ||
              response.perfil_completo ||
              response.perfilCompleto ||
              false
          };

          localStorage.setItem(
            'connectwork_user',
            JSON.stringify(usuario)
          );

          localStorage.setItem(
            'connectwork_rol',
            usuario.rol
          );

          /**
           * IMPORTANTE:
           * Mantener sincronizada la clave "usuario"
           */
          localStorage.setItem(
            'usuario',
            JSON.stringify(usuario)
          );

          this.currentUserSubject.next(usuario);

          console.log(
            '[AuthService.login] ✓ Usuario guardado:',
            usuario
          );
        }

      }),

      catchError(error => {

        console.error(
          '[AuthService.login] ✗ Error en login:',
          error
        );

        return throwError(() => error);
      })
    );
  }

  registro(usuario: any): Observable<any> {

    console.log(
      '[AuthService.registro] Registrando usuario:',
      usuario.username
    );

    return this.http.post<any>(
      `${this.apiUrl}/api/auth/registro`,
      usuario
    ).pipe(

      tap(response => {

        console.log(
          '[AuthService.registro] ✓ Registro exitoso'
        );

        /**
         * Guardar token
         */
        if (response.token || response.jwt) {

          localStorage.setItem(
            'connectwork_token',
            response.token || response.jwt
          );

          console.log(
            '[AuthService.registro] ✓ Token guardado'
          );
        }

        /**
         * Obtener usuario raw
         */
        const rawUser =
          response.usuario || response;

        /**
         * Guardar usuario
         */
        if (rawUser.id) {

          const usuarioNuevo: Usuario = {

            id:
              rawUser.id,

            nombreCompleto:
              rawUser.nombreCompleto ||
              rawUser.nombre ||
              response.nombreCompleto ||
              response.nombre_completo ||
              response.nombre ||
              usuario.nombreCompleto ||
              'Usuario',

            username:
              rawUser.username ||
              response.username ||
              usuario.username ||
              '',

            correo:
              rawUser.correo ||
              response.correo ||
              usuario.correo ||
              '',

            rol:
              rawUser.rol ||
              response.rol ||
              usuario.rol ||
              'CLIENTE',

            saldo:
              rawUser.saldo ||
              response.saldo ||
              0,

            activo:
              (rawUser.activo ??
                response.activo) ?? true,

            perfilCompleto:
              rawUser.perfilCompleto ||
              rawUser.perfil_completo ||
              response.perfil_completo ||
              response.perfilCompleto ||
              false
          };

          localStorage.setItem(
            'connectwork_user',
            JSON.stringify(usuarioNuevo)
          );

          localStorage.setItem(
            'connectwork_rol',
            usuarioNuevo.rol
          );

          /**
           * IMPORTANTE:
           * También actualizar la clave
           * "usuario" usada por otros servicios
           */
          localStorage.setItem(
            'usuario',
            JSON.stringify(usuarioNuevo)
          );

          this.currentUserSubject.next(usuarioNuevo);

          console.log(
            '[AuthService.registro] ✓ Usuario registrado:',
            usuarioNuevo
          );
        }

      }),

      catchError(error => {

        console.error(
          '[AuthService.registro] ✗ Error en registro:',
          error
        );

        return throwError(() => error);
      })
    );
  }

  /**
   * LOGOUT
   */
  logout(): void {

    console.log(
      '[AuthService.logout] Cerrando sesión...'
    );

    localStorage.removeItem('connectwork_token');
    localStorage.removeItem('connectwork_user');
    localStorage.removeItem('connectwork_rol');

    /**
     * Limpiar también clave legacy
     */
    localStorage.removeItem('usuario');

    this.currentUserSubject.next(null);

    console.log(
      '[AuthService.logout] ✓ Sesión cerrada'
    );
  }

  /**
   * OBTENER USUARIO ACTUAL
   */
  getCurrentUser(): Usuario | null {
    return this.currentUserSubject.value;
  }

  /**
   * OBSERVABLE USUARIO
   */
  getCurrentUser$(): Observable<Usuario | null> {
    return this.currentUser$;
  }

  /**
   * VALIDAR ROL
   */
  hasRole(role: string): boolean {

    const user = this.currentUserSubject.value;

    return user
      ? user.rol === role
      : false;
  }

  /**
   * VALIDAR LOGIN
   */
  isLoggedIn(): boolean {

    const token = localStorage.getItem(
      'connectwork_token'
    );

    const user = this.currentUserSubject.value;

    return !!(token && user);
  }

  /**
   * OBTENER TOKEN
   */
  getToken(): string | null {
    return localStorage.getItem(
      'connectwork_token'
    );
  }

  /**
   * OBTENER ROL
   */
  getRol(): string | null {

    const rol = localStorage.getItem(
      'connectwork_rol'
    );

    if (rol) {
      return rol;
    }

    const user = this.getCurrentUser();

    return user
      ? user.rol
      : null;
  }

  /**
   * VALIDACIONES ROL
   */
  isAdmin(): boolean {
    return this.getRol() === 'ADMIN';
  }

  isCliente(): boolean {
    return this.getRol() === 'CLIENTE';
  }

  isFreelancer(): boolean {
    return this.getRol() === 'FREELANCER';
  }

  /**
   * ACTUALIZAR USUARIO
   */
  updateCurrentUser(usuario: Usuario): void {

    console.log(
      '[AuthService.updateCurrentUser] Actualizando usuario...'
    );

    localStorage.setItem(
      'connectwork_user',
      JSON.stringify(usuario)
    );

    localStorage.setItem(
      'connectwork_rol',
      usuario.rol
    );

    /**
     * Sincronizar clave legacy
     */
    localStorage.setItem(
      'usuario',
      JSON.stringify(usuario)
    );

    this.currentUserSubject.next(usuario);

    console.log(
      '[AuthService.updateCurrentUser] ✓ Usuario actualizado'
    );
  }

  /**
   * OBTENER ID
   */
  getUserId(): number | null {

    const user = this.getCurrentUser();

    return user
      ? user.id
      : null;
  }

  /**
   * OBTENER USERNAME
   */
  getUsername(): string | null {

    const user = this.getCurrentUser();

    return user
      ? user.username
      : null;
  }

  /**
   * PERFIL COMPLETO
   */
  isPerfilCompleto(): boolean {

    const user = this.getCurrentUser();

    return user
      ? user.perfilCompleto
      : false;
  }

  private getUserFromStorage(): Usuario | null {

    try {

      const user = localStorage.getItem(
        'connectwork_user'
      );

      return user
        ? JSON.parse(user)
        : null;

    } catch (error) {

      console.error(
        '[AuthService] Error parseando usuario:',
        error
      );

      return null;
    }
  }

  restoreSession(): void {

    console.log(
      '[AuthService.restoreSession] Restaurando sesión...'
    );

    const token = localStorage.getItem(
      'connectwork_token'
    );

    const userStorage = localStorage.getItem(
      'connectwork_user'
    );

    if (!token || !userStorage) {

      console.warn(
        '[AuthService.restoreSession] No hay sesión activa'
      );

      return;
    }

    try {

      const user: Usuario = JSON.parse(userStorage);

      /**
       * Validación mínima
       */
      if (!user || !user.id || !user.rol) {

        console.error(
          '[AuthService.restoreSession] Usuario inválido'
        );

        this.logout();

        return;
      }

      /**
       * Restaurar rol
       */
      localStorage.setItem(
        'connectwork_rol',
        user.rol
      );

      /**
       * Restaurar clave legacy
       */
      localStorage.setItem(
        'usuario',
        JSON.stringify(user)
      );

      /**
       * Restaurar sesión
       */
      this.currentUserSubject.next(user);

      console.log(
        '[AuthService.restoreSession] ✓ Sesión restaurada:',
        user
      );

    } catch (error) {

      console.error(
        '[AuthService.restoreSession] Error restaurando sesión:',
        error
      );

      this.logout();
    }
  }

  /**
   * VALIDAR SESIÓN
   */
  hasActiveSession(): boolean {

    return this.isLoggedIn() &&
      this.getCurrentUser() !== null;
  }

  /**
   * OBTENER SALDO
   */
  getSaldo(): number | null {

    const user = this.getCurrentUser();

    return user
      ? (user.saldo || 0)
      : null;
  }

  /**
   * ACTUALIZAR SALDO
   */
  updateSaldo(nuevoSaldo: number): void {

    const user = this.getCurrentUser();

    if (user) {

      user.saldo = nuevoSaldo;

      this.updateCurrentUser(user);

      console.log(
        '[AuthService.updateSaldo] ✓ Saldo actualizado a:',
        nuevoSaldo
      );
    }
  }
}
