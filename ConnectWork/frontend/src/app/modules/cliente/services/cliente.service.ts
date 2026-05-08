import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ClienteService {
  private apiUrl = `${environment.apiUrl}/clientes`;

  constructor(private http: HttpClient) {}

  getEstadisticas(periodo: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/reportes?periodo=${periodo}`);
  }

  getPerfil(): Observable<any> {
    return this.http.get(`${this.apiUrl}/perfil`);
  }

  actualizarNotificaciones(settings: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/notificaciones`, settings);
  }
}
