import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { ApiService } from './api.service';
import { Usuario } from '../models/usuario.model';

@Injectable({
  providedIn: 'root'
})
export class UsuarioService {
  private endpoint = '/api/usuarios';

  constructor(private apiService: ApiService) {}


  listar(): Observable<Usuario[]> {
    console.log('[UsuarioService.listar] Listando todos los usuarios...');
    return this.apiService.get<Usuario[]>(this.endpoint).pipe(
      tap(usuarios => {
        console.log('[UsuarioService.listar]  Usuarios listados:', usuarios.length);
      }),
      catchError(error => {
        console.error('[UsuarioService.listar]  Error:', error);
        return throwError(() => error);
      })
    );
  }

  listarTodos(): Observable<Usuario[]> {
    console.log('[UsuarioService.listarTodos] Listando usuarios (sin ADMIN)...');
    return this.apiService.get<Usuario[]>(this.endpoint).pipe(
      tap(usuarios => {
        console.log('[UsuarioService.listarTodos] ✓ Usuarios listados:', usuarios.length);
      }),
      catchError(error => {
        console.error('[UsuarioService.listarTodos] ✗ Error:', error);
        return throwError(() => error);
      })
    );
  }

  listarPorRol(rol: string): Observable<Usuario[]> {
    console.log('[UsuarioService.listarPorRol] Listando usuarios con rol:', rol);
    return this.apiService.get<Usuario[]>(this.endpoint, { rol }).pipe(
      tap(usuarios => {
        console.log('[UsuarioService.listarPorRol] ✓ Usuarios listados:', usuarios.length);
      }),
      catchError(error => {
        console.error('[UsuarioService.listarPorRol] ✗ Error:', error);
        return throwError(() => error);
      })
    );
  }


  obtenerPorId(id: string | number): Observable<Usuario> {
    console.log('[UsuarioService.obtenerPorId] Obteniendo usuario ID:', id);
    return this.apiService.get<Usuario>(`${this.endpoint}/${id}`).pipe(
      tap(usuario => {
        console.log('[UsuarioService.obtenerPorId] ✓ Usuario obtenido:', usuario.username);
      }),
      catchError(error => {
        console.error('[UsuarioService.obtenerPorId] ✗ Error:', error);
        return throwError(() => error);
      })
    );
  }


  crear(usuario: any): Observable<any> {
    console.log('[UsuarioService.crear] Creando usuario:', usuario.username);
    return this.apiService.post<any>(this.endpoint, usuario).pipe(
      tap(response => {
        console.log('[UsuarioService.crear] ✓ Usuario creado - ID:', response.id);
      }),
      catchError(error => {
        console.error('[UsuarioService.crear] ✗ Error:', error);
        return throwError(() => error);
      })
    );
  }


  actualizar(usuario: any): Observable<any> {
    console.log('[UsuarioService.actualizar] Actualizando usuario ID:', usuario.id);
    return this.apiService.put<any>(`${this.endpoint}/${usuario.id}`, usuario).pipe(
      tap(response => {
        console.log('[UsuarioService.actualizar] ✓ Usuario actualizado');
      }),
      catchError(error => {
        console.error('[UsuarioService.actualizar] ✗ Error:', error);
        return throwError(() => error);
      })
    );
  }


  cambiarEstado(id: number, activo: boolean): Observable<any> {
    console.log('[UsuarioService.cambiarEstado] Cambiando estado ID:', id, 'Activo:', activo);
    return this.apiService.put<any>(`${this.endpoint}/${id}/estado`, { activo }).pipe(
      tap(response => {
        console.log('[UsuarioService.cambiarEstado] ✓ Estado actualizado');
      }),
      catchError(error => {
        console.error('[UsuarioService.cambiarEstado] ✗ Error:', error);
        return throwError(() => error);
      })
    );
  }


  activar(id: number): Observable<any> {
    console.log('[UsuarioService.activar] Activando usuario ID:', id);
    return this.cambiarEstado(id, true);
  }


  desactivar(id: number): Observable<any> {
    console.log('[UsuarioService.desactivar] Desactivando usuario ID:', id);
    return this.cambiarEstado(id, false);
  }

  eliminar(id: number): Observable<any> {
    console.log('[UsuarioService.eliminar] Eliminando usuario ID:', id);
    return this.apiService.delete<any>(`${this.endpoint}/${id}`).pipe(
      tap(response => {
        console.log('[UsuarioService.eliminar] ✓ Usuario eliminado');
      }),
      catchError(error => {
        console.error('[UsuarioService.eliminar] ✗ Error:', error);
        return throwError(() => error);
      })
    );
  }

  obtenerSaldo(id: number): Observable<{ saldo: number }> {
    console.log('[UsuarioService.obtenerSaldo] Obteniendo saldo usuario ID:', id);
    return this.apiService.get<{ saldo: number }>(`${this.endpoint}/${id}/saldo`).pipe(
      tap(response => {
        console.log('[UsuarioService.obtenerSaldo] ✓ Saldo obtenido:', response.saldo);
      }),
      catchError(error => {
        console.error('[UsuarioService.obtenerSaldo] ✗ Error:', error);
        return throwError(() => error);
      })
    );
  }


  buscar(termino: string): Observable<Usuario[]> {
    console.log('[UsuarioService.buscar] Buscando usuarios:', termino);
    return this.apiService.get<Usuario[]>(this.endpoint, { buscar: termino }).pipe(
      tap(usuarios => {
        console.log('[UsuarioService.buscar] ✓ Usuarios encontrados:', usuarios.length);
      }),
      catchError(error => {
        console.error('[UsuarioService.buscar] ✗ Error:', error);
        return throwError(() => error);
      })
    );
  }


  crearAdmin(datos: any): Observable<any> {
    console.log('[UsuarioService.crearAdmin] Creando admin:', datos.username);
    return this.apiService.post<any>(this.endpoint, datos).pipe(
      tap(response => {
        console.log('[UsuarioService.crearAdmin] ✓ Admin creado - ID:', response.id);
      }),
      catchError(error => {
        console.error('[UsuarioService.crearAdmin] ✗ Error:', error);
        return throwError(() => error);
      })
    );
  }
}
