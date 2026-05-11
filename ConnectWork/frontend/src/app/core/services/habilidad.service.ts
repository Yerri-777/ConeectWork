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

  listar(): Observable<Habilidad[]> {
    return this.apiService.get<Habilidad[]>(this.endpoint);
  }

  obtenerPorId(id: string | number): Observable<Habilidad> {
    return this.apiService.get<Habilidad>(`${this.endpoint}/${id}`);
  }


  listarPorCategoria(categoriaId: number): Observable<Habilidad[]> {
    return this.apiService.get<Habilidad[]>(this.endpoint, { categoriaId });
  }


  listarPorFreelancer(freelancerId: number): Observable<Habilidad[]> {
    return this.apiService.get<Habilidad[]>(this.endpoint, { freelancerId });
  }


  crear(habilidad: Habilidad): Observable<Habilidad> {
    return this.apiService.post<Habilidad>(this.endpoint, habilidad);
  }


  actualizar(id: number, habilidad: Habilidad): Observable<Habilidad> {
    return this.apiService.put<Habilidad>(`${this.endpoint}/${id}`, habilidad);
  }

  desactivar(id: number): Observable<any> {
    return this.apiService.put<any>(`${this.endpoint}/${id}/desactivar`, {});
  }


  activar(id: number): Observable<any> {
    return this.apiService.put<any>(`${this.endpoint}/${id}/activar`, {});
  }


  eliminar(id: number): Observable<any> {
    return this.apiService.delete<any>(`${this.endpoint}/${id}`);
  }


  listarActivas(): Observable<Habilidad[]> {
    return this.apiService.get<Habilidad[]>(this.endpoint, { activo: true });
  }


  buscar(termino: string): Observable<Habilidad[]> {
    return this.apiService.get<Habilidad[]>(this.endpoint, { buscar: termino });
  }
}
