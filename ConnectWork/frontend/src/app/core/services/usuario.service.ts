import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { Usuario } from '../models/usuario.model';

@Injectable({
  providedIn: 'root'
})
export class UsuarioService {
  private endpoint = '/api/usuarios';

  constructor(private apiService: ApiService) {}

  /**
   * Listar usuarios por rol
   */
  listarPorRol(rol: string): Observable<Usuario[]> {
    return this.apiService.get<Usuario[]>(this.endpoint, { rol });
  }

  /**
   * Obtener usuario por ID
   */
  obtenerPorId(id: string | number): Observable<Usuario> {
    return this.apiService.get<Usuario>(`${this.endpoint}/${id}`);
  }

  /**
   * Listar todos los usuarios (admin)
   */
  listarTodos(): Observable<Usuario[]> {
    return this.apiService.get<Usuario[]>(this.endpoint);
  }

  /**
   * Activar usuario
   */
  activar(id: number): Observable<any> {
    return this.apiService.put<any>(`${this.endpoint}/${id}/activar`, {});
  }

  /**
   * Desactivar usuario
   */
  desactivar(id: number): Observable<any> {
    return this.apiService.put<any>(`${this.endpoint}/${id}/desactivar`, {});
  }

  /**
   * Obtener saldo de usuario
   */
  obtenerSaldo(id: number): Observable<{ saldo: number }> {
    return this.apiService.get<{ saldo: number }>(`${this.endpoint}/${id}/saldo`);
  }

  /**
   * Búsqueda de usuario por username o correo
   */
  buscar(termino: string): Observable<Usuario[]> {
    return this.apiService.get<Usuario[]>(this.endpoint, { buscar: termino });
  }
}
