import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { Usuario } from '../models/usuario.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = environment.apiUrl;
  private currentUserSubject = new BehaviorSubject<Usuario | null>(this.getUserFromStorage());
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient) {}

  /**
   * Login del usuario
   */
 login(username: string, password: string): Observable<any> {
    console.log('Frontend: Enviando login para:', username);
    return this.http.post<any>(`${this.apiUrl}/api/auth/login`, { username, password }).pipe(
      tap(response => {
        console.log('Frontend: Respuesta recibida:', response);
        if (response.token) {
          localStorage.setItem('connectwork_token', response.token);
          const usuario: Usuario = {
            id: response.id,
            nombreCompleto: response.nombreCompleto,
            username: response.username,
            correo: response.correo,
            rol: response.rol,
            saldo: response.saldo,
            activo: response.activo ?? true,
            perfilCompleto: response.perfilCompleto
          };
          localStorage.setItem('connectwork_user', JSON.stringify(usuario));
          this.currentUserSubject.next(usuario);
          console.log('Frontend: Usuario guardado en localStorage:', usuario);
        }
      })
    );
  }

  /**
   * Registro de nuevo usuario
   */
  registro(usuario: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/api/auth/registro`, usuario);
  }

  /**
   * Logout del usuario
   */
  logout(): void {
    localStorage.removeItem('connectwork_token');
    localStorage.removeItem('connectwork_user');
    this.currentUserSubject.next(null);
  }

  /**
   * Obtener usuario actual
   */
  getCurrentUser(): Usuario | null {
    return this.currentUserSubject.value;
  }

  /**
   * Verificar si el usuario tiene un rol específico
   */
  hasRole(role: string): boolean {
    const user = this.currentUserSubject.value;
    return user ? user.rol === role : false;
  }

  /**
   * Verificar si está logueado
   */
  isLoggedIn(): boolean {
    return !!localStorage.getItem('connectwork_token');
  }

  /**
   * Obtener el token JWT
   */
  getToken(): string | null {
    return localStorage.getItem('connectwork_token');
  }

  /**
   * Actualizar usuario actual (cuando se completa el perfil)
   */
  updateCurrentUser(usuario: Usuario): void {
    localStorage.setItem('connectwork_user', JSON.stringify(usuario));
    this.currentUserSubject.next(usuario);
  }

  /**
   * Obtener usuario del localStorage
   */
  private getUserFromStorage(): Usuario | null {
    const user = localStorage.getItem('connectwork_user');
    return user ? JSON.parse(user) : null;
  }

  /**
   * Restaurar sesión (útil al recargar la página)
   */
  restoreSession(): void {
    const user = this.getUserFromStorage();
    if (user) {
      this.currentUserSubject.next(user);
    }
  }
}
