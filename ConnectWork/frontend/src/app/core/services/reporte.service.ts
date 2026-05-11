import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root'
})
export class ReporteService {


  private endpoint = '/api/reportes';


  private baseUrl = 'http://localhost:8080/connectwork';

  constructor(
    private apiService: ApiService,
    private http: HttpClient
  ) {}

  private getParams(desde?: string, hasta?: string): any {

    const params: any = {};

    if (desde) {
      params.desde = desde;
    }

    if (hasta) {
      params.hasta = hasta;
    }

    return params;
  }


  descargarReportePDF(
    fechaInicio: string,
    fechaFin: string
  ): Observable<Blob> {

    return this.http.get(
      `${this.baseUrl}${this.endpoint}/admin/export-pdf`,
      {
        params: {
          fechaInicio,
          fechaFin
        },
        responseType: 'blob'
      }
    );
  }


  obtenerTopFreelancers(
    desde?: string,
    hasta?: string
  ): Observable<any[]> {

    return this.apiService.get<any[]>(
      `${this.endpoint}/admin/top-freelancers`,
      this.getParams(desde, hasta)
    );
  }


  obtenerTopCategorias(
    desde?: string,
    hasta?: string
  ): Observable<any[]> {

    return this.apiService.get<any[]>(
      `${this.endpoint}/admin/top-categorias`,
      this.getParams(desde, hasta)
    );
  }

  obtenerIngresos(
    desde?: string,
    hasta?: string
  ): Observable<any> {

    return this.apiService.get<any>(
      `${this.endpoint}/admin/ingresos`,
      this.getParams(desde, hasta)
    );
  }


  obtenerHistorialComisiones(): Observable<any[]> {

    return this.apiService.get<any[]>(
      `${this.endpoint}/admin/historial-comisiones`
    );
  }

  obtenerEstadisticasGlobales(): Observable<any> {

    return this.apiService.get<any>(
      `${this.endpoint}/admin/estadisticas`
    );
  }



  obtenerHistorialProyectos(
    desde?: string,
    hasta?: string
  ): Observable<any[]> {

    return this.apiService.get<any[]>(
      `${this.endpoint}/cliente/proyectos`,
      this.getParams(desde, hasta)
    );
  }


  obtenerHistorialRecargas(
    desde?: string,
    hasta?: string
  ): Observable<any[]> {

    return this.apiService.get<any[]>(
      `${this.endpoint}/cliente/recargas`,
      this.getParams(desde, hasta)
    );
  }

  obtenerGastoCategoria(
    desde?: string,
    hasta?: string
  ): Observable<any[]> {

    return this.apiService.get<any[]>(
      `${this.endpoint}/cliente/gasto-categorias`,
      this.getParams(desde, hasta)
    );
  }

  exportarProyectosCSV(
    desde?: string,
    hasta?: string
  ): Observable<Blob> {

    return this.http.get(
      `${this.baseUrl}${this.endpoint}/cliente/proyectos/export`,
      {
        params: this.getParams(desde, hasta),
        responseType: 'blob'
      }
    );
  }

  obtenerHistorialContratos(
    desde?: string,
    hasta?: string
  ): Observable<any[]> {

    return this.apiService.get<any[]>(
      `${this.endpoint}/freelancer/contratos`,
      this.getParams(desde, hasta)
    );
  }

  obtenerTopCategoriasFreelancer(): Observable<any[]> {

    return this.apiService.get<any[]>(
      `${this.endpoint}/freelancer/top-categorias`
    );
  }

  obtenerReportePropuestas(
    desde?: string,
    hasta?: string
  ): Observable<any[]> {

    return this.apiService.get<any[]>(
      `${this.endpoint}/freelancer/propuestas`,
      this.getParams(desde, hasta)
    );
  }


  obtenerEstadisticasFreelancer(): Observable<any> {

    return this.apiService.get<any>(
      `${this.endpoint}/freelancer/estadisticas`
    );
  }

  exportarContratosCSV(
    desde?: string,
    hasta?: string
  ): Observable<Blob> {

    return this.http.get(
      `${this.baseUrl}${this.endpoint}/freelancer/contratos/export`,
      {
        params: this.getParams(desde, hasta),
        responseType: 'blob'
      }
    );
  }


  generarReportePersonalizado(
    filtros: any
  ): Observable<any> {

    return this.apiService.post<any>(
      `${this.endpoint}/personalizado`,
      filtros
    );
  }
}
