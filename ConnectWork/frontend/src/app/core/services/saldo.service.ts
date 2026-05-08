import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root'
})
export class SaldoService {
  private endpointSaldo = '/api/saldo';
  private endpointComision = '/api/saldo/comision';
  private endpointPlataforma = '/api/saldo/plataforma';

  constructor(private apiService: ApiService) {}

  /**
   * Consultar saldo del usuario actual
   */
  consultarSaldo(): Observable<any> {
    return this.apiService.get<any>(this.endpointSaldo);
  }

  /**
   * Recargar saldo (cliente)
   */
  recargar(monto: number): Observable<any> {
    return this.apiService.post<any>(`${this.endpointSaldo}/recargar`, { monto });
  }

  /**
   * Obtener configuración de comisión actual (admin)
   */
  obtenerComisionActual(): Observable<any> {
    return this.apiService.get<any>(this.endpointComision);
  }

  /**
   * Cambiar porcentaje de comisión (admin)
   */
  cambiarComision(porcentaje: number): Observable<any> {
    return this.apiService.put<any>(this.endpointComision, { porcentaje });
  }

  /**
   * Obtener historial de cambios de comisión (admin)
   */
  obtenerHistorialComisiones(): Observable<any[]> {
    return this.apiService.get<any[]>(`${this.endpointComision}/historial`);
  }

  /**
   * Obtener saldo total de la plataforma (admin)
   */
  obtenerSaldoPlataforma(): Observable<any> {
    return this.apiService.get<any>(this.endpointPlataforma);
  }

  /**
   * Obtener historial de recargas (cliente)
   */
  obtenerHistorialRecargas(): Observable<any[]> {
    return this.apiService.get<any[]>(`${this.endpointSaldo}/historial-recargas`);
  }

  /**
   * Obtener resumen de saldo del cliente
   */
  obtenerResumenSaldo(): Observable<any> {
    return this.apiService.get<any>(`${this.endpointSaldo}/resumen`);
  }

  /**
   * Validar que el cliente tiene suficiente saldo
   */
  validarSaldo(monto: number): Observable<{ valido: boolean }> {
    return this.apiService.get<{ valido: boolean }>(`${this.endpointSaldo}/validar`, { monto });
  }
}
