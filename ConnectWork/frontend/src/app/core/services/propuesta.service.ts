import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { Propuesta } from '../models/propuesta.model';

@Injectable({
  providedIn: 'root'
})
export class PropuestaService {
  listarRecibidas(): Observable<Propuesta[]> {
    return this.apiService.get<Propuesta[]>(`${this.endpoint}/recibidas`);
  }
  private endpoint = '/api/propuestas';

  constructor(private apiService: ApiService) {}

  /**
   * Listar propuestas de un proyecto (cliente)
   */
  listarPorProyecto(proyectoId: number): Observable<Propuesta[]> {
    return this.apiService.get<Propuesta[]>(this.endpoint, { proyectoId });
  }

  /**
   * Listar mis propuestas (freelancer)
   */
  listarMias(): Observable<Propuesta[]> {
    return this.apiService.get<Propuesta[]>(`${this.endpoint}/mias`);
  }

  /**
   * Obtener propuesta por ID
   */
  obtenerPorId(id: string | number): Observable<Propuesta> {
    return this.apiService.get<Propuesta>(`${this.endpoint}/${id}`);
  }

  /**
   * Enviar propuesta (freelancer)
   */
  enviar(propuesta: Propuesta): Observable<Propuesta> {
    return this.apiService.post<Propuesta>(this.endpoint, propuesta);
  }

  /**
   * Aceptar propuesta y generar contrato (cliente)
   */
  aceptar(id: string | number): Observable<any> {
    return this.apiService.put<any>(`${this.endpoint}/${id}/aceptar`, {});
  }

  /**
   * Rechazar propuesta (cliente)
   */
  rechazar(id: string | number): Observable<any> {
    return this.apiService.put<any>(`${this.endpoint}/${id}/rechazar`, {});
  }

  /**
   * Retirar propuesta (freelancer, solo si está PENDIENTE)
   */
  retirar(id: string | number): Observable<any> {
    return this.apiService.put<any>(`${this.endpoint}/${id}/retirar`, {});
  }

  /**
   * Filtrar propuestas por estado
   */
  filtrarPorEstado(estado: string): Observable<Propuesta[]> {
    return this.apiService.get<Propuesta[]>(this.endpoint, { estado });
  }

  /**
   * Obtener propuestas de un freelancer en un proyecto
   */
  obtenerPorProyectoYFreelancer(proyectoId: number, freelancerId: number): Observable<Propuesta> {
    return this.apiService.get<Propuesta>(`${this.endpoint}`, { proyectoId, freelancerId });
  }

  /**
   * Contar propuestas para un proyecto
   */
  contarPorProyecto(proyectoId: number): Observable<{ total: number }> {
    return this.apiService.get<{ total: number }>(`${this.endpoint}/count`, { proyectoId });
  }

  /**
   * Obtener propuestas activas del freelancer
   */
  obtenerActivas(): Observable<Propuesta[]> {
    return this.apiService.get<Propuesta[]>(`${this.endpoint}/activas`);
  }

  /**
   * Compatibility aliases for older component names
   */
  obtenerMias(): Observable<Propuesta[]> {
    return this.listarMias();
  }

  actualizar(id: string | number, body: any): Observable<any> {
    return this.apiService.put<any>(`${this.endpoint}/${id}`, body);
  }
}
