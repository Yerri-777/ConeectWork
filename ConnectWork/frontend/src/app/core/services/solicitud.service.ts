import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { SolicitudHabilidad, SolicitudCategoria } from '../models/solicitud.model';

@Injectable({
  providedIn: 'root'
})
export class SolicitudService {
  private endpointHabilidad = '/api/solicitudes/habilidades';
  private endpointCategoria = '/api/solicitudes/categorias';

  constructor(private apiService: ApiService) {}

  // ==================== SOLICITUDES DE HABILIDAD ====================

  /**
   * Solicitar nueva habilidad (freelancer)
   */
  solicitarHabilidad(solicitud: SolicitudHabilidad): Observable<SolicitudHabilidad> {
    return this.apiService.post<SolicitudHabilidad>(this.endpointHabilidad, solicitud);
  }

  /**
   * Listar solicitudes de habilidad (admin)
   */
  listarSolicitudesHabilidad(estado?: string): Observable<SolicitudHabilidad[]> {
    const params = estado ? { estado } : {};
    return this.apiService.get<SolicitudHabilidad[]>(this.endpointHabilidad, params);
  }

  /**
   * Obtener solicitud de habilidad por ID
   */
  obtenerSolicitudHabilidad(id: number): Observable<SolicitudHabilidad> {
    return this.apiService.get<SolicitudHabilidad>(`${this.endpointHabilidad}/${id}`);
  }

  /**
   * Aceptar solicitud de habilidad (admin)
   */
  aceptarSolicitudHabilidad(id: number): Observable<any> {
    return this.apiService.put<any>(`${this.endpointHabilidad}/${id}/aceptar`, {});
  }

  /**
   * Rechazar solicitud de habilidad (admin)
   */
  rechazarSolicitudHabilidad(id: number): Observable<any> {
    return this.apiService.put<any>(`${this.endpointHabilidad}/${id}/rechazar`, {});
  }

  /**
   * Listar mis solicitudes de habilidad (freelancer)
   */
  misSolicitudesHabilidad(): Observable<SolicitudHabilidad[]> {
    return this.apiService.get<SolicitudHabilidad[]>(`${this.endpointHabilidad}/mias`);
  }

  /**
   * Filtrar solicitudes de habilidad por estado
   */
  filtrarSolicitudesHabilidad(estado: string): Observable<SolicitudHabilidad[]> {
    return this.apiService.get<SolicitudHabilidad[]>(this.endpointHabilidad, { estado });
  }

  // ==================== SOLICITUDES DE CATEGORÍA ====================

  /**
   * Solicitar nueva categoría (cliente)
   */
  solicitarCategoria(solicitud: SolicitudCategoria): Observable<SolicitudCategoria> {
    return this.apiService.post<SolicitudCategoria>(this.endpointCategoria, solicitud);
  }

  /**
   * Alias de compatibilidad: crearSolicitudCategoria
   * Algunos componentes llaman a crearSolicitudCategoria() en lugar de solicitarCategoria()
   */
  crearSolicitudCategoria(solicitud: SolicitudCategoria): Observable<SolicitudCategoria> {
    return this.solicitarCategoria(solicitud);
  }

  /**
   * Listar solicitudes de categoría (admin)
   */
  listarSolicitudesCategoria(estado?: string): Observable<SolicitudCategoria[]> {
    const params = estado ? { estado } : {};
    return this.apiService.get<SolicitudCategoria[]>(this.endpointCategoria, params);
  }

  /**
   * Obtener solicitud de categoría por ID
   */
  obtenerSolicitudCategoria(id: number): Observable<SolicitudCategoria> {
    return this.apiService.get<SolicitudCategoria>(`${this.endpointCategoria}/${id}`);
  }

  /**
   * Aceptar solicitud de categoría (admin)
   */
  aceptarSolicitudCategoria(id: number): Observable<any> {
    return this.apiService.put<any>(`${this.endpointCategoria}/${id}/aceptar`, {});
  }

  /**
   * Rechazar solicitud de categoría (admin)
   */
  rechazarSolicitudCategoria(id: number): Observable<any> {
    return this.apiService.put<any>(`${this.endpointCategoria}/${id}/rechazar`, {});
  }

  /**
   * Listar mis solicitudes de categoría (cliente)
   */
  misSolicitudesCategoria(): Observable<SolicitudCategoria[]> {
    return this.apiService.get<SolicitudCategoria[]>(`${this.endpointCategoria}/mias`);
  }

  /**
   * Filtrar solicitudes de categoría por estado
   */
  filtrarSolicitudesCategoria(estado: string): Observable<SolicitudCategoria[]> {
    return this.apiService.get<SolicitudCategoria[]>(this.endpointCategoria, { estado });
  }

  // ==================== LISTADOS GENERALES ====================

  /**
   * Contar solicitudes de habilidad por estado
   */
  contarSolicitudesHabilidad(estado: string): Observable<{ total: number }> {
    return this.apiService.get<{ total: number }>(`${this.endpointHabilidad}/count`, { estado });
  }

  /**
   * Contar solicitudes de categoría por estado
   */
  contarSolicitudesCategoria(estado: string): Observable<{ total: number }> {
    return this.apiService.get<{ total: number }>(`${this.endpointCategoria}/count`, { estado });
  }

  /**
   * Obtener todas las solicitudes pendientes (admin)
   */
  obtenerSolicitudesPendientes(): Observable<any> {
    return this.apiService.get<any>('/api/solicitudes/pendientes');
  }
}
