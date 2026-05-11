

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';
import { environment } from 'src/environments/environment';

const API_URL = environment.apiUrl;
const buildUrl = (path: string) => `${API_URL}${path}`;


@Injectable({
  providedIn: 'root'
})
export class FreelancerService {

  /**

   * @param httpClient - Cliente HTTP de Angular para requests personalizados
   * @param apiService - Servicio wrapper que maneja requests genéricos
   */
  constructor(
    private httpClient: HttpClient,
    private apiService: ApiService
  ) {}

  /**
   * stadísticas del dashboard del freelancer
   *
   * BACKEND ENDPOINT:
   * GET /api/freelancer/dashboard/stats


   * @return Observable<any> - Estadísticas del dashboard
   */
  obtenerDashboardStats(): Observable<any> {
    return this.apiService.get('/freelancer/dashboard/stats');
  }

  /**
   * Obtener estadísticas completas del freelancer
   *
   * BACKEND ENDPOINT:
   * GET /api/freelancer/estadisticas

   *
   * @return Observable<any> - Estadísticas generales completas
   */
  obtenerEstadisticas(): Observable<any> {
    return this.apiService.get('/freelancer/estadisticas');
  }

  /**
   * Obtener historial de contratos del freelancer
   *
   * BACKEND ENDPOINT:
   * GET /api/freelancer/historial-contratos

   *
   * @return Observable<any[]> - Array de contratos
   */
  obtenerHistorialContratos(): Observable<any[]> {
    return this.apiService.get('/freelancer/historial-contratos');
  }

  /**
   * Obtener top 5 categorías en las que el freelancer ha trabajado
   *
   * BACKEND ENDPOINT:
   * GET /api/freelancer/top-categorias

   *
   * @return Observable<any[]> - Array de top 5 categorías
   */
  obtenerTopCategorias(): Observable<any[]> {
    return this.apiService.get('/freelancer/top-categorias');
  }

  /**
   * Obtener reporte de propuestas enviadas
   *
   * BACKEND ENDPOINT:
   * GET /api/freelancer/reporte-propuestas

   *
   * USADO EN:
   * reporte-freelancer.component.ts
   *
   * @return Observable<any> - Reporte de propuestas
   */
  obtenerReportePropuestas(): Observable<any> {
    return this.apiService.get('/freelancer/reporte-propuestas');
  }


  descargarReportePDF(): Observable<Blob> {

    return this.httpClient.get(
      `${environment.apiUrl}/freelancer/reportes/pdf`,
      { responseType: 'blob' }
    );
  }

  /**
   *
   * BACKEND ENDPOINT:
   * GET /api/freelancer/reportes/excel

   * @return Observable<Blob> - Archivo Excel binario
   */
  descargarReporteExcel(): Observable<Blob> {
    return this.httpClient.get(
      `${environment.apiUrl}/freelancer/reportes/excel`,
      { responseType: 'blob' }
    );
  }

  /**
   *
   *
   * @return Observable<Blob>
   */
  descargarReportePropuestasCSV(): Observable<Blob> {
    return this.httpClient.get(
      `${environment.apiUrl}/freelancer/reportes/propuestas/csv`,
      { responseType: 'blob' }
    );
  }


  /**
   * Obtener resumen rápido de ingresos del mes actual
   * BACKEND ENDPOINT:
   * GET /api/freelancer/ingresos/mes-actual
   * @return Observable<any> - Ingresos del mes actual
   */
  obtenerIngresosActuales(): Observable<any> {
    return this.apiService.get('/freelancer/ingresos/mes-actual');
  }

  /**
   * Obtener calificación promedio del freelancer
   * BACKEND ENDPOINT:
   * GET /api/freelancer/calificacion-promedi
   * @return Observable<any> - Calificación y estadísticas
   */
  obtenerCalificacionPromedio(): Observable<any> {
    return this.apiService.get('/freelancer/calificacion-promedio');
  }

  /**
   * Obtener lista de propuestas activas del freelancer
   * BACKEND ENDPOINT:
   * GET /api/freelancer/propuestas/activas
   * @return Observable<any[]> - Array de propuestas activas
   */
  obtenerPropuestasActivas(): Observable<any[]> {
    return this.apiService.get('/freelancer/propuestas/activas');
  }

  /**
   * Obtener próximas entregas pendientes
   * BACKEND ENDPOINT:
   * GET /api/freelancer/entregas/pendientes
   * @return Observable<any[]> - Array de entregas pendientes
   */
  obtenerEntregasPendientes(): Observable<any[]> {
    return this.apiService.get('/freelancer/entregas/pendientes');
  }

  /**
   * Obtener disponibilidad/estado del freelancer
   * BACKEND ENDPOINT:
   * GET /api/freelancer/disponibilidad
   * @return Observable<any> - Estado de disponibilidad
   */
  obtenerDisponibilidad(): Observable<any> {
    return this.apiService.get('/freelancer/disponibilidad');
  }

  /**
   * Actualizar estado de disponibilidad del freelancer
   * BACKEND ENDPOINT:
   * PUT /api/freelancer/disponibilidad
   * @param estado - 'DISPONIBLE' | 'OCUPADO' | 'EN_DESCANSO'
   * @return Observable<any> - Estado actualizado
   */
  actualizarDisponibilidad(estado: string): Observable<any> {
    return this.apiService.put('/freelancer/disponibilidad', { estado });
  }
}

