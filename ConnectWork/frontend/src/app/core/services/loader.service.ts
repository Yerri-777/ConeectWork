
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class LoaderService {

  show(): void {
    this.mostrar();
  }

  hide(): void {
    this.ocultar();
  }

  private cargando$ = new BehaviorSubject<boolean>(false);

  private contador: number = 0;

  constructor() {}

  mostrar(): void {
    this.contador++;
    this.cargando$.next(true);
  }

  ocultar(): void {
    this.contador--;


    if (this.contador <= 0) {
      this.contador = 0;
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
