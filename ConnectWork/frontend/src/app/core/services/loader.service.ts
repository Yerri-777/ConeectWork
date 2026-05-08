
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class LoaderService {
  // Backwards-compatible wrappers expected by interceptors
  show(): void {
    this.mostrar();
  }

  hide(): void {
    this.ocultar();
  }
  // BehaviorSubject que emite el estado de carga
  private cargando$ = new BehaviorSubject<boolean>(false);

  // Contador interno de requests activos
  // Evita que se oculte el loader antes de que todos terminen
  private contador: number = 0;

  constructor() {}

  mostrar(): void {
    this.contador++;
    this.cargando$.next(true);
  }

  ocultar(): void {
    this.contador--;

    // Solo mostrar como no cargando cuando TODOS los requests terminan
    if (this.contador <= 0) {
      this.contador = 0; // Reset a 0 por seguridad
      this.cargando$.next(false);
    }
  }

  get cargandoObs(): Observable<boolean> {
    return this.cargando$.asObservable();
  }

  get cargando(): boolean {
    return this.cargando$.value;
  }

  reset(): void {
    this.contador = 0;
    this.cargando$.next(false);
  }


  getContador(): number {
    return this.contador;
  }
}
