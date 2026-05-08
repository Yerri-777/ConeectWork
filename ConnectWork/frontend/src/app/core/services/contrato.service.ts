import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { Contrato } from '../models/contrato.model';

@Injectable({
  providedIn: 'root'
})
export class ContratoService {
  private endpoint = '/api/contratos';

  constructor(private apiService: ApiService) {}

  /**
   * Listar contratos del usuario actual (cliente o freelancer)
   */
  listar(): Observable<Contrato[]> {
    return this.apiService.get<Contrato[]>(this.endpoint);
  }

  /**
   * Listar contratos activos
   */
  listarActivos(): Observable<Contrato[]> {
    return this.apiService.get<Contrato[]>(this.endpoint, { estado: 'ACTIVO' });
  }

  /**
   * Listar contratos completados
   */
  listarCompletados(): Observable<Contrato[]> {
    return this.apiService.get<Contrato[]>(this.endpoint, { estado: 'COMPLETADO' });
  }

  /**
   * Listar contratos cancelados
   */
  listarCancelados(): Observable<Contrato[]> {
    return this.apiService.get<Contrato[]>(this.endpoint, { estado: 'CANCELADO' });
  }

  /**
   * Obtener contrato por ID
   */
  obtenerPorId(id: string | number): Observable<Contrato> {
    return this.apiService.get<Contrato>(`${this.endpoint}/${id}`);
  }

  /**
   * Cancelar contrato (cliente)
   */
  cancelar(id: string | number, motivo?: string): Observable<any> {
    return this.apiService.put<any>(`${this.endpoint}/${id}/cancelar`, { motivo });
  }

  /**
   * Obtener entregas de un contrato
   */
  obtenerEntregas(id: string | number): Observable<any[]> {
    return this.apiService.get<any[]>(`${this.endpoint}/${id}/entregas`);
  }

  /**
   * Filtrar contratos por estado
   */
  filtrarPorEstado(estado: string): Observable<Contrato[]> {
    return this.apiService.get<Contrato[]>(this.endpoint, { estado });
  }

  /**
   * Filtrar contratos por fechas
   */
  filtrarPorFechas(desde: string, hasta: string): Observable<Contrato[]> {
    return this.apiService.get<Contrato[]>(this.endpoint, { desde, hasta });
  }

  /**
   * Obtener estadísticas de contratos
   */
  obtenerEstadisticas(): Observable<any> {
    return this.apiService.get<any>(`${this.endpoint}/estadisticas`);
  }

  /**
   * Contar contratos por estado
   */
  contarPorEstado(estado: string): Observable<{ total: number }> {
    return this.apiService.get<{ total: number }>(`${this.endpoint}/count`, { estado });
  }
}
