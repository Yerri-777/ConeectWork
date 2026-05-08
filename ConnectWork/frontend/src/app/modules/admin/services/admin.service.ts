import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private apiUrl = `${environment.apiUrl}/admin`;

  constructor(private http: HttpClient) {}

  // Estadísticas y Reportes
  obtenerEstadisticasGenerales(): Observable<any> {
    return this.http.get(`${this.apiUrl}/estadisticas`);
  }

  descargarReportePDF(inicio: string, fin: string): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/reportes/pdf?inicio=${inicio}&fin=${fin}`, {
      responseType: 'blob'
    });
  }

  // Logs del sistema
  obtenerLogsActividad(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/logs`);
  }

  // Acciones globales
  limpiarCacheSistema(): Observable<any> {
    return this.http.post(`${this.apiUrl}/mantenimiento/clear-cache`, {});
  }
}
