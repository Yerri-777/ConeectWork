import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { Entrega } from '../models/entrega.model';

@Injectable({
  providedIn: 'root'
})
export class EntregaService {
  private endpoint = '/api/entregas';

  constructor(private apiService: ApiService) {}

  /**
   * Subir entrega (freelancer)
   */
  subir(entrega: Entrega | FormData): Observable<Entrega> {
    // Accept either a typed Entrega or a FormData payload for file uploads
    if (entrega instanceof FormData) {
      return this.apiService.postFormData<Entrega>(this.endpoint, entrega);
    }
    return this.apiService.post<Entrega>(this.endpoint, entrega);
  }

  /**
   * Obtener entrega por ID
   */
  obtenerPorId(id: string | number): Observable<Entrega> {
    return this.apiService.get<Entrega>(`${this.endpoint}/${id}`);
  }

  /**
   * Listar entregas de un contrato
   */
  listarPorContrato(contratoId: string | number): Observable<Entrega[]> {
    return this.apiService.get<Entrega[]>(this.endpoint, { contratoId });
  }

  /**
   * Aprobar entrega (cliente)
   */
  aprobar(id: string | number): Observable<any> {
    return this.apiService.put<any>(`${this.endpoint}/${id}/aprobar`, {});
  }

  /**
   * Rechazar entrega (cliente)
   */
  rechazar(id: string | number, motivo: string): Observable<any> {
    return this.apiService.put<any>(`${this.endpoint}/${id}/rechazar`, { motivo });
  }

  /** Compatibility aliases used by some components */
  listarMias(): Observable<Entrega[]> {
    return this.obtenerHistorialFreelancer();
  }

  aprobarSolo(id: string | number): Observable<any> {
    return this.aprobar(id);
  }

  /**
   * Calificar freelancer (cliente, después de aprobar entrega)
   */
  calificar(contratoId: number, calificacion: any): Observable<any> {
    return this.apiService.post<any>(`${this.endpoint}/${contratoId}/calificar`, calificacion);
  }

  /**
   * Listar entregas por estado
   */
  listarPorEstado(estado: string): Observable<Entrega[]> {
    return this.apiService.get<Entrega[]>(this.endpoint, { estado });
  }

  /**
   * Obtener entregas pendientes
   */
  obtenerPendientes(): Observable<Entrega[]> {
    return this.apiService.get<Entrega[]>(this.endpoint, { estado: 'PENDIENTE' });
  }

  /**
   * Listar entregas pendientes para el cliente (compatibilidad con componentes antiguos)
   */
  listarPendientesCliente(): Observable<Entrega[]> {
    return this.apiService.get<Entrega[]>(`${this.endpoint}/pendientes/cliente`);
  }

  /**
   * Obtener entregas aprobadas
   */
  obtenerAprobadas(): Observable<Entrega[]> {
    return this.apiService.get<Entrega[]>(this.endpoint, { estado: 'APROBADA' });
  }

  /**
   * Filtrar entregas por fechas
   */
  filtrarPorFechas(desde: string, hasta: string): Observable<Entrega[]> {
    return this.apiService.get<Entrega[]>(this.endpoint, { desde, hasta });
  }

  /**
   * Obtener historial de entregas del freelancer
   */
  obtenerHistorialFreelancer(): Observable<Entrega[]> {
    return this.apiService.get<Entrega[]>(`${this.endpoint}/historial`);
  }

  /**
   * Contar entregas por estado
   */
  contarPorEstado(estado: string): Observable<{ total: number }> {
    return this.apiService.get<{ total: number }>(`${this.endpoint}/count`, { estado });
  }
}
