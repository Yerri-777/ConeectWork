import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { ApiService } from './api.service';
import { PerfilCliente, PerfilFreelancer } from '../models/usuario.model';

@Injectable({
  providedIn: 'root'
})
export class PerfilService {
  private endpoint = '/api/perfil';

  constructor(private apiService: ApiService) {}

  /**
   * Obtener perfil del usuario actual
   */
  obtenerPerfil(): Observable<any> {
    console.log('[PerfilService.obtenerPerfil] Obteniendo perfil...');
    return this.apiService.get<any>(this.endpoint).pipe(
      tap(perfil => {
        console.log('[PerfilService.obtenerPerfil] ✓ Perfil obtenido');
      }),
      catchError(error => {
        console.error('[PerfilService.obtenerPerfil] ✗ Error:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Guardar/completar perfil de cliente
   */
  guardarPerfilCliente(perfil: PerfilCliente): Observable<any> {
    console.log('[PerfilService.guardarPerfilCliente] Guardando perfil cliente...');
    return this.apiService.post<any>(`${this.endpoint}/cliente`, perfil).pipe(
      tap(response => {
        console.log('[PerfilService.guardarPerfilCliente] ✓ Perfil cliente guardado');
      }),
      catchError(error => {
        console.error('[PerfilService.guardarPerfilCliente] ✗ Error:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Actualizar perfil de cliente
   */
  actualizarPerfilCliente(perfil: PerfilCliente): Observable<any> {
    console.log('[PerfilService.actualizarPerfilCliente] Actualizando perfil cliente...');
    return this.apiService.put<any>(`${this.endpoint}/cliente`, perfil).pipe(
      tap(response => {
        console.log('[PerfilService.actualizarPerfilCliente] ✓ Perfil cliente actualizado');
      }),
      catchError(error => {
        console.error('[PerfilService.actualizarPerfilCliente] ✗ Error:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Guardar/completar perfil de freelancer
   */
  guardarPerfilFreelancer(perfil: PerfilFreelancer): Observable<any> {
    console.log('[PerfilService.guardarPerfilFreelancer] Guardando perfil freelancer...');
    return this.apiService.post<any>(`${this.endpoint}/freelancer`, perfil).pipe(
      tap(response => {
        console.log('[PerfilService.guardarPerfilFreelancer] ✓ Perfil freelancer guardado');
      }),
      catchError(error => {
        console.error('[PerfilService.guardarPerfilFreelancer] ✗ Error:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Actualizar perfil de freelancer
   */
  actualizarPerfilFreelancer(perfil: PerfilFreelancer): Observable<any> {
    console.log('[PerfilService.actualizarPerfilFreelancer] Actualizando perfil freelancer...');
    return this.apiService.put<any>(`${this.endpoint}/freelancer`, perfil).pipe(
      tap(response => {
        console.log('[PerfilService.actualizarPerfilFreelancer] ✓ Perfil freelancer actualizado');
      }),
      catchError(error => {
        console.error('[PerfilService.actualizarPerfilFreelancer] ✗ Error:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Obtener perfil cliente del usuario actual
   */
  obtenerPerfilCliente(): Observable<PerfilCliente> {
    console.log('[PerfilService.obtenerPerfilCliente] Obteniendo perfil cliente...');
    return this.apiService.get<PerfilCliente>(`${this.endpoint}/cliente`).pipe(
      tap(perfil => {
        console.log('[PerfilService.obtenerPerfilCliente] ✓ Perfil cliente obtenido');
      }),
      catchError(error => {
        console.error('[PerfilService.obtenerPerfilCliente] ✗ Error:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Obtener perfil freelancer del usuario actual
   */
  obtenerPerfilFreelancer(): Observable<PerfilFreelancer> {
    console.log('[PerfilService.obtenerPerfilFreelancer] Obteniendo perfil freelancer...');
    return this.apiService.get<PerfilFreelancer>(`${this.endpoint}/freelancer`).pipe(
      tap(perfil => {
        console.log('[PerfilService.obtenerPerfilFreelancer] ✓ Perfil freelancer obtenido');
      }),
      catchError(error => {
        console.error('[PerfilService.obtenerPerfilFreelancer] ✗ Error:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Obtener perfil freelancer por ID de usuario
   */
  obtenerPerfilFreelancerPorId(usuarioId: number): Observable<PerfilFreelancer> {
    console.log('[PerfilService.obtenerPerfilFreelancerPorId] Obteniendo perfil freelancer ID:', usuarioId);
    return this.apiService.get<PerfilFreelancer>(`${this.endpoint}/freelancer/${usuarioId}`).pipe(
      tap(perfil => {
        console.log('[PerfilService.obtenerPerfilFreelancerPorId] ✓ Perfil obtenido');
      }),
      catchError(error => {
        console.error('[PerfilService.obtenerPerfilFreelancerPorId] ✗ Error:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Marcar perfil como completo - NUEVO MÉTODO
   */
  marcarCompleto(usuarioId: number): Observable<any> {
    console.log('[PerfilService.marcarCompleto] Marcando perfil como completo - ID:', usuarioId);
    return this.apiService.put<any>(`${this.endpoint}/${usuarioId}/completar`, {}).pipe(
      tap(response => {
        console.log('[PerfilService.marcarCompleto] ✓ Perfil marcado como completo');
      }),
      catchError(error => {
        console.error('[PerfilService.marcarCompleto] ✗ Error:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Guardar datos y marcar como completo - NUEVO MÉTODO
   */
  completarPerfil(usuarioId: number, datos: any): Observable<any> {
    console.log('[PerfilService.completarPerfil] Completando perfil - ID:', usuarioId);

    // Primero guardar datos
    return this.apiService.post<any>(`${this.endpoint}/guardar`, { usuarioId, ...datos }).pipe(
      tap(response => {
        console.log('[PerfilService.completarPerfil] ✓ Datos guardados');
      }),
      catchError(error => {
        console.error('[PerfilService.completarPerfil] ✗ Error guardando datos:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Guardar datos del perfil - NUEVO MÉTODO
   */
  guardarDatos(usuarioId: number, datos: any): Observable<any> {
    console.log('[PerfilService.guardarDatos] Guardando datos - ID:', usuarioId);
    return this.apiService.post<any>(`${this.endpoint}/guardar`, { usuarioId, ...datos }).pipe(
      tap(response => {
        console.log('[PerfilService.guardarDatos] ✓ Datos guardados');
      }),
      catchError(error => {
        console.error('[PerfilService.guardarDatos] ✗ Error:', error);
        return throwError(() => error);
      })
    );
  }
}
