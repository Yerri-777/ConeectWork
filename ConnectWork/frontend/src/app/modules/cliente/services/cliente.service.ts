import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ClienteService {

  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}


  listarProyectos(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/api/cliente/proyectos`);
  }

  obtenerProyecto(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/api/cliente/proyectos/${id}`);
  }

  crearProyecto(datos: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/api/cliente/proyectos`, datos);
  }

  actualizarProyecto(id: number, datos: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/api/cliente/proyectos/${id}`, datos);
  }

  cerrarProyecto(id: number): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/api/cliente/proyectos/${id}/cerrar`, {});
  }



  listarPropuestasRecibidas(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/api/cliente/propuestas`);
  }

  obtenerPropuesta(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/api/cliente/propuestas/${id}`);
  }

  aceptarPropuesta(id: number): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/api/cliente/propuestas/${id}/aceptar`, {});
  }

  rechazarPropuesta(id: number): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/api/cliente/propuestas/${id}/rechazar`, {});
  }



  getEstadisticas(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/api/cliente/reportes/estadisticas`);
  }

  getGastosCategoria(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/api/cliente/reportes/gastos-categorias`);
  }

  getEstadoProyectos(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/api/cliente/reportes/estado-proyectos`);
  }
}
