import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { Proyecto } from '../models/proyecto.model';

@Injectable({
  providedIn: 'root'
})
export class ProyectoService {
  private endpoint = '/api/proyectos';

  constructor(private apiService: ApiService) {}

  /**
   * Listar todos los proyectos (según contexto: cliente ve suyos, freelancer ve abiertos)
   */
  listar(params?: any): Observable<Proyecto[]> {
    return this.apiService.get<Proyecto[]>(this.endpoint, params);
  }

  /**
   * Listar proyectos abiertos (para freelancers)
   */
  listarAbiertos(params?: any): Observable<Proyecto[]> {
    return this.apiService.get<Proyecto[]>(this.endpoint, { estado: 'ABIERTO', ...params });
  }

  /**
   * Listar proyectos del cliente actual
   */
  listarDelCliente(): Observable<Proyecto[]> {
    return this.apiService.get<Proyecto[]>(this.endpoint);
  }

  /**
   * Obtener proyecto por ID
   */
  obtenerPorId(id: string | number): Observable<Proyecto> {
    return this.apiService.get<Proyecto>(`${this.endpoint}/${id}`);
  }

  /**
   * Crear nuevo proyecto (cliente)
   */
  crear(proyecto: Proyecto): Observable<Proyecto> {
    return this.apiService.post<Proyecto>(this.endpoint, proyecto);
  }

  /**
   * Actualizar proyecto (cliente, solo si está ABIERTO)
   */
  actualizar(id: string | number, proyecto: Proyecto): Observable<Proyecto> {
    return this.apiService.put<Proyecto>(`${this.endpoint}/${id}`, proyecto);
  }

  /**
   * Cancelar proyecto (cliente)
   */
  cancelar(id: number, motivo?: string): Observable<any> {
    return this.apiService.put<any>(`${this.endpoint}/${id}/cancelar`, { motivo });
  }

  /**
   * Filtrar proyectos por categoría
   */
  filtrarPorCategoria(categoriaId: number): Observable<Proyecto[]> {
    return this.apiService.get<Proyecto[]>(this.endpoint, { categoriaId });
  }

  /**
   * Filtrar proyectos por habilidad
   */
  filtrarPorHabilidad(habilidadId: number): Observable<Proyecto[]> {
    return this.apiService.get<Proyecto[]>(this.endpoint, { habilidadId });
  }

  /**
   * Filtrar proyectos por rango de presupuesto
   */
  filtrarPorPresupuesto(minPresupuesto: number, maxPresupuesto: number): Observable<Proyecto[]> {
    return this.apiService.get<Proyecto[]>(this.endpoint, {
      presupuestoMin: minPresupuesto,
      presupuestoMax: maxPresupuesto
    });
  }

  /**
   * Filtrar proyectos por múltiples criterios
   */
  filtrarAvanzado(filtros: any): Observable<Proyecto[]> {
    return this.apiService.get<Proyecto[]>(this.endpoint, filtros);
  }

  /**
   * Obtener estadísticas de proyectos del cliente
   */
  obtenerEstadisticas(): Observable<any> {
    return this.apiService.get<any>(`${this.endpoint}/estadisticas`);
  }
}
