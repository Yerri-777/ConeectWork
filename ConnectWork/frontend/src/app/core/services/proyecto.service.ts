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


  listar(params?: any): Observable<Proyecto[]> {
    return this.apiService.get<Proyecto[]>(this.endpoint, params);
  }

  listarAbiertos(params?: any): Observable<Proyecto[]> {
    return this.apiService.get<Proyecto[]>(this.endpoint, { estado: 'ABIERTO', ...params });
  }


  listarDelCliente(): Observable<Proyecto[]> {
    return this.apiService.get<Proyecto[]>(this.endpoint);
  }


  obtenerPorId(id: string | number): Observable<Proyecto> {
    return this.apiService.get<Proyecto>(`${this.endpoint}/${id}`);
  }


  crear(proyecto: Proyecto): Observable<Proyecto> {
    return this.apiService.post<Proyecto>(this.endpoint, proyecto);
  }


  actualizar(id: string | number, proyecto: Proyecto): Observable<Proyecto> {
    return this.apiService.put<Proyecto>(`${this.endpoint}/${id}`, proyecto);
  }


  cancelar(id: number, motivo?: string): Observable<any> {
    return this.apiService.put<any>(`${this.endpoint}/${id}/cancelar`, { motivo });
  }

  filtrarPorCategoria(categoriaId: number): Observable<Proyecto[]> {
    return this.apiService.get<Proyecto[]>(this.endpoint, { categoriaId });
  }

  filtrarPorHabilidad(habilidadId: number): Observable<Proyecto[]> {
    return this.apiService.get<Proyecto[]>(this.endpoint, { habilidadId });
  }


  filtrarPorPresupuesto(minPresupuesto: number, maxPresupuesto: number): Observable<Proyecto[]> {
    return this.apiService.get<Proyecto[]>(this.endpoint, {
      presupuestoMin: minPresupuesto,
      presupuestoMax: maxPresupuesto
    });
  }


  filtrarAvanzado(filtros: any): Observable<Proyecto[]> {
    return this.apiService.get<Proyecto[]>(this.endpoint, filtros);
  }

  obtenerEstadisticas(): Observable<any> {
    return this.apiService.get<any>(`${this.endpoint}/estadisticas`);
  }
}
