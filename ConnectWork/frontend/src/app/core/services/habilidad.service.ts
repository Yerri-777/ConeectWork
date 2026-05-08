import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { Habilidad } from '../models/habilidad.model';

@Injectable({
  providedIn: 'root'
})
export class HabilidadService {
  private endpoint = '/api/habilidades';

  constructor(private apiService: ApiService) {}

  /**
   * Listar todas las habilidades
   */
  listar(): Observable<Habilidad[]> {
    return this.apiService.get<Habilidad[]>(this.endpoint);
  }

  /**
   * Obtener habilidad por ID
   */
  obtenerPorId(id: string | number): Observable<Habilidad> {
    return this.apiService.get<Habilidad>(`${this.endpoint}/${id}`);
  }

  /**
   * Listar habilidades por categoría
   */
  listarPorCategoria(categoriaId: number): Observable<Habilidad[]> {
    return this.apiService.get<Habilidad[]>(this.endpoint, { categoriaId });
  }

  /**
   * Listar habilidades de un freelancer
   */
  listarPorFreelancer(freelancerId: number): Observable<Habilidad[]> {
    return this.apiService.get<Habilidad[]>(this.endpoint, { freelancerId });
  }

  /**
   * Crear nueva habilidad (admin)
   */
  crear(habilidad: Habilidad): Observable<Habilidad> {
    return this.apiService.post<Habilidad>(this.endpoint, habilidad);
  }

  /**
   * Actualizar habilidad (admin)
   */
  actualizar(id: number, habilidad: Habilidad): Observable<Habilidad> {
    return this.apiService.put<Habilidad>(`${this.endpoint}/${id}`, habilidad);
  }

  /**
   * Desactivar habilidad (admin)
   */
  desactivar(id: number): Observable<any> {
    return this.apiService.put<any>(`${this.endpoint}/${id}/desactivar`, {});
  }

  /**
   * Activar habilidad (admin)
   */
  activar(id: number): Observable<any> {
    return this.apiService.put<any>(`${this.endpoint}/${id}/activar`, {});
  }

  /**
   * Eliminar habilidad (admin)
   */
  eliminar(id: number): Observable<any> {
    return this.apiService.delete<any>(`${this.endpoint}/${id}`);
  }

  /**
   * Listar habilidades activas
   */
  listarActivas(): Observable<Habilidad[]> {
    return this.apiService.get<Habilidad[]>(this.endpoint, { activo: true });
  }

  /**
   * Búsqueda de habilidades
   */
  buscar(termino: string): Observable<Habilidad[]> {
    return this.apiService.get<Habilidad[]>(this.endpoint, { buscar: termino });
  }
}
