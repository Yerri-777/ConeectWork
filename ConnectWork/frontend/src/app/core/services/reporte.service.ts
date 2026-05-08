import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root'
})
export class ReporteService {
  private endpoint = '/api/reportes';

  constructor(private apiService: ApiService) {}

  // ==================== REPORTES ADMIN ====================

  /**
   * Obtener top 5 freelancers (admin)
   */
  obtenerTopFreelancers(desde?: string, hasta?: string): Observable<any[]> {
    const params: any = {};
    if (desde) params.desde = desde;
    if (hasta) params.hasta = hasta;
    return this.apiService.get<any[]>(`${this.endpoint}/admin/top-freelancers`, params);
  }

  /**
   * Obtener top 5 categorías (admin)
   */
  obtenerTopCategorias(desde?: string, hasta?: string): Observable<any[]> {
    const params: any = {};
    if (desde) params.desde = desde;
    if (hasta) params.hasta = hasta;
    return this.apiService.get<any[]>(`${this.endpoint}/admin/top-categorias`, params);
  }

  /**
   * Obtener ingresos totales de la plataforma (admin)
   */
  obtenerIngresos(desde?: string, hasta?: string): Observable<any> {
    const params: any = {};
    if (desde) params.desde = desde;
    if (hasta) params.hasta = hasta;
    return this.apiService.get<any>(`${this.endpoint}/admin/ingresos`, params);
  }

  /**
   * Obtener historial de comisiones (admin)
   */
  obtenerHistorialComisiones(): Observable<any[]> {
    return this.apiService.get<any[]>(`${this.endpoint}/admin/historial-comisiones`);
  }

  // ==================== REPORTES CLIENTE ====================

  /**
   * Obtener historial de proyectos (cliente)
   */
  obtenerHistorialProyectos(desde?: string, hasta?: string): Observable<any[]> {
    const params: any = {};
    if (desde) params.desde = desde;
    if (hasta) params.hasta = hasta;
    return this.apiService.get<any[]>(`${this.endpoint}/cliente/proyectos`, params);
  }

  /**
   * Obtener historial de recargas (cliente)
   */
  obtenerHistorialRecargas(desde?: string, hasta?: string): Observable<any[]> {
    const params: any = {};
    if (desde) params.desde = desde;
    if (hasta) params.hasta = hasta;
    return this.apiService.get<any[]>(`${this.endpoint}/cliente/recargas`, params);
  }

  /**
   * Obtener gasto por categoría (cliente)
   */
  obtenerGastoCategoria(desde?: string, hasta?: string): Observable<any[]> {
    const params: any = {};
    if (desde) params.desde = desde;
    if (hasta) params.hasta = hasta;
    return this.apiService.get<any[]>(`${this.endpoint}/cliente/gasto-categorias`, params);
  }

  /**
   * Exportar reporte de proyectos a CSV (cliente)
   */
  exportarProyectosCSV(desde?: string, hasta?: string): Observable<any> {
    const params: any = {};
    if (desde) params.desde = desde;
    if (hasta) params.hasta = hasta;
    return this.apiService.get<any>(`${this.endpoint}/cliente/proyectos/export`, params);
  }

  // ==================== REPORTES FREELANCER ====================

  /**
   * Obtener historial de contratos completados (freelancer)
   */
  obtenerHistorialContratos(desde?: string, hasta?: string): Observable<any[]> {
    const params: any = {};
    if (desde) params.desde = desde;
    if (hasta) params.hasta = hasta;
    return this.apiService.get<any[]>(`${this.endpoint}/freelancer/contratos`, params);
  }

  /**
   * Obtener top 5 categorías donde ha trabajado (freelancer)
   */
  obtenerTopCategoriasFreelancer(): Observable<any[]> {
    return this.apiService.get<any[]>(`${this.endpoint}/freelancer/top-categorias`);
  }

  /**
   * Obtener reporte de propuestas enviadas (freelancer)
   */
  obtenerReportePropuestas(desde?: string, hasta?: string): Observable<any[]> {
    const params: any = {};
    if (desde) params.desde = desde;
    if (hasta) params.hasta = hasta;
    return this.apiService.get<any[]>(`${this.endpoint}/freelancer/propuestas`, params);
  }

  /**
   * Obtener estadísticas generales del freelancer
   */
  obtenerEstadisticasFreelancer(): Observable<any> {
    return this.apiService.get<any>(`${this.endpoint}/freelancer/estadisticas`);
  }

  /**
   * Exportar reporte de contratos a CSV (freelancer)
   */
  exportarContratosCSV(desde?: string, hasta?: string): Observable<any> {
    const params: any = {};
    if (desde) params.desde = desde;
    if (hasta) params.hasta = hasta;
    return this.apiService.get<any>(`${this.endpoint}/freelancer/contratos/export`, params);
  }

  // ==================== REPORTES GENERALES ====================

  /**
   * Obtener estadísticas globales de la plataforma (admin)
   */
  obtenerEstadisticasGlobales(): Observable<any> {
    return this.apiService.get<any>(`${this.endpoint}/admin/estadisticas`);
  }

  /**
   * Generar reporte personalizado (admin)
   */
  generarReportePersonalizado(filtros: any): Observable<any> {
    return this.apiService.post<any>(`${this.endpoint}/personalizado`, filtros);
  }
}
