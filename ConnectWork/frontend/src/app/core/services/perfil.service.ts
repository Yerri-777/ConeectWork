import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { PerfilCliente, PerfilFreelancer } from '../models/usuario.model';

@Injectable({
  providedIn: 'root'
})
export class PerfilService {
  private endpoint = '/api/perfil';

  constructor(private apiService: ApiService) {}

  /**
   * Obtener perfil del usuario actual
   */
  obtenerPerfil(): Observable<any> {
    return this.apiService.get<any>(this.endpoint);
  }

  /**
   * Guardar/completar perfil de cliente
   */
  guardarPerfilCliente(perfil: PerfilCliente): Observable<any> {
    return this.apiService.post<any>(`${this.endpoint}/cliente`, perfil);
  }

  /**
   * Actualizar perfil de cliente
   */
  actualizarPerfilCliente(perfil: PerfilCliente): Observable<any> {
    return this.apiService.put<any>(`${this.endpoint}/cliente`, perfil);
  }

  /**
   * Guardar/completar perfil de freelancer
   */
  guardarPerfilFreelancer(perfil: PerfilFreelancer): Observable<any> {
    return this.apiService.post<any>(`${this.endpoint}/freelancer`, perfil);
  }

  /**
   * Actualizar perfil de freelancer
   */
  actualizarPerfilFreelancer(perfil: PerfilFreelancer): Observable<any> {
    return this.apiService.put<any>(`${this.endpoint}/freelancer`, perfil);
  }

  /**
   * Obtener perfil cliente del usuario actual
   */
  obtenerPerfilCliente(): Observable<PerfilCliente> {
    return this.apiService.get<PerfilCliente>(`${this.endpoint}/cliente`);
  }

  /**
   * Obtener perfil freelancer del usuario actual
   */
  obtenerPerfilFreelancer(): Observable<PerfilFreelancer> {
    return this.apiService.get<PerfilFreelancer>(`${this.endpoint}/freelancer`);
  }

  /**
   * Obtener perfil freelancer por ID de usuario
   */
  obtenerPerfilFreelancerPorId(usuarioId: number): Observable<PerfilFreelancer> {
    return this.apiService.get<PerfilFreelancer>(`${this.endpoint}/freelancer/${usuarioId}`);
  }
}
