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

  solicitarHabilidad(solicitud: SolicitudHabilidad): Observable<SolicitudHabilidad> {
    return this.apiService.post<SolicitudHabilidad>(this.endpointHabilidad, solicitud);
  }


  listarSolicitudesHabilidad(estado?: string): Observable<SolicitudHabilidad[]> {
    const params = estado ? { estado } : {};
    return this.apiService.get<SolicitudHabilidad[]>(this.endpointHabilidad, params);
  }


  obtenerSolicitudHabilidad(id: number): Observable<SolicitudHabilidad> {
    return this.apiService.get<SolicitudHabilidad>(`${this.endpointHabilidad}/${id}`);
  }


  aceptarSolicitudHabilidad(id: number): Observable<any> {
    return this.apiService.put<any>(`${this.endpointHabilidad}/${id}/aceptar`, {});
  }


  rechazarSolicitudHabilidad(id: number): Observable<any> {
    return this.apiService.put<any>(`${this.endpointHabilidad}/${id}/rechazar`, {});
  }


  misSolicitudesHabilidad(): Observable<SolicitudHabilidad[]> {
    return this.apiService.get<SolicitudHabilidad[]>(`${this.endpointHabilidad}/mias`);
  }


  filtrarSolicitudesHabilidad(estado: string): Observable<SolicitudHabilidad[]> {
    return this.apiService.get<SolicitudHabilidad[]>(this.endpointHabilidad, { estado });
  }


  solicitarCategoria(solicitud: SolicitudCategoria): Observable<SolicitudCategoria> {
    return this.apiService.post<SolicitudCategoria>(this.endpointCategoria, solicitud);
  }


  crearSolicitudCategoria(solicitud: SolicitudCategoria): Observable<SolicitudCategoria> {
    return this.solicitarCategoria(solicitud);
  }

  listarSolicitudesCategoria(estado?: string): Observable<SolicitudCategoria[]> {
    const params = estado ? { estado } : {};
    return this.apiService.get<SolicitudCategoria[]>(this.endpointCategoria, params);
  }


  obtenerSolicitudCategoria(id: number): Observable<SolicitudCategoria> {
    return this.apiService.get<SolicitudCategoria>(`${this.endpointCategoria}/${id}`);
  }

  aceptarSolicitudCategoria(id: number): Observable<any> {
    return this.apiService.put<any>(`${this.endpointCategoria}/${id}/aceptar`, {});
  }


  rechazarSolicitudCategoria(id: number): Observable<any> {
    return this.apiService.put<any>(`${this.endpointCategoria}/${id}/rechazar`, {});
  }


  misSolicitudesCategoria(): Observable<SolicitudCategoria[]> {
    return this.apiService.get<SolicitudCategoria[]>(`${this.endpointCategoria}/mias`);
  }


  filtrarSolicitudesCategoria(estado: string): Observable<SolicitudCategoria[]> {
    return this.apiService.get<SolicitudCategoria[]>(this.endpointCategoria, { estado });
  }


  contarSolicitudesHabilidad(estado: string): Observable<{ total: number }> {
    return this.apiService.get<{ total: number }>(`${this.endpointHabilidad}/count`, { estado });
  }

  contarSolicitudesCategoria(estado: string): Observable<{ total: number }> {
    return this.apiService.get<{ total: number }>(`${this.endpointCategoria}/count`, { estado });
  }


  obtenerSolicitudesPendientes(): Observable<any> {
    return this.apiService.get<any>('/api/solicitudes/pendientes');
  }
}
