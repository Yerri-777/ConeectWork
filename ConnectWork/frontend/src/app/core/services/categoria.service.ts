import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { Categoria } from '../models/categoria.model';

@Injectable({
  providedIn: 'root'
})
export class CategoriaService {
  private endpoint = '/api/categorias';

  constructor(private apiService: ApiService) {}

  /**
   * Listar todas las categorías
   */
  listar(): Observable<Categoria[]> {
    return this.apiService.get<Categoria[]>(this.endpoint);
  }

  /**
   * Obtener categoría por ID
   */
  obtenerPorId(id: string | number): Observable<Categoria> {
    return this.apiService.get<Categoria>(`${this.endpoint}/${id}`);
  }


  crear(categoria: Categoria): Observable<Categoria> {
    return this.apiService.post<Categoria>(this.endpoint, categoria);
  }


  actualizar(id: number, categoria: Categoria): Observable<Categoria> {
    return this.apiService.put<Categoria>(`${this.endpoint}/${id}`, categoria);
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


  listarActivas(): Observable<Categoria[]> {
    return this.apiService.get<Categoria[]>(this.endpoint, { activo: true });
  }
}
