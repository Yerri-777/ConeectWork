import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class PropuestaService {

  private KEY = 'connectwork_proyectos';


  private getProyectos(): any[] {
    try {
      return JSON.parse(localStorage.getItem(this.KEY) || '[]');
    } catch (error) {
      console.error('Error al leer LocalStorage', error);
      return [];
    }
  }

  private saveProyectos(proyectos: any[]): void {
    localStorage.setItem(this.KEY, JSON.stringify(proyectos));
  }


  enviar(propuesta: any, proyectoId: number): Observable<any> {
    const proyectos = this.getProyectos();
    const proyecto = proyectos.find(
      (p: any) => p.id === Number(proyectoId)
    );

    if (!proyecto) {
      return of(null);
    }


    const yaExiste = (proyecto.propuestas || []).some(
      (p: any) => p.freelancer?.nombre === 'Freelancer Demo'
    );

    if (yaExiste) {

      return throwError(() => new Error('Ya has enviado una propuesta a este proyecto.'));
    }

    const nueva = {
      id: Date.now(),
      contenido: propuesta.contenido,
      monto: Number(propuesta.monto),
      plazo: Number(propuesta.plazo),
      estado: 'PENDIENTE',
      freelancer: {
        nombre: 'Freelancer Demo'
      },
      fecha: new Date()
    };

    if (!proyecto.propuestas) {
      proyecto.propuestas = [];
    }

    proyecto.propuestas.push(nueva);
    proyecto.totalPropuestas = proyecto.propuestas.length;

    this.saveProyectos(proyectos);
    return of(nueva);
  }


  listarMias(): Observable<any[]> {
    const proyectos = this.getProyectos();

    const propuestas = proyectos.flatMap((p: any) =>
      (p.propuestas || []).map((pr: any) => ({
        ...pr,
        proyecto: {
          id: p.id,
          titulo: p.titulo,
          cliente: p.cliente || {
            nombreCompleto: p.clienteNombre || 'Cliente Demo'
          }
        }
      }))
    );

    return of(propuestas);
  }


  actualizar(id: number, data: any): Observable<boolean> {
    const proyectos = this.getProyectos();

    proyectos.forEach((p: any) => {
      const propuesta = (p.propuestas || []).find(
        (x: any) => Number(x.id) === Number(id)
      );

      if (propuesta) {
        propuesta.contenido = data.contenido;
        propuesta.monto = Number(data.monto);
        propuesta.plazo = Number(data.plazo);
      }
    });

    this.saveProyectos(proyectos);
    return of(true);
  }

  retirar(id: number): Observable<boolean> {
    const proyectos = this.getProyectos();

    proyectos.forEach((p: any) => {
      p.propuestas = (p.propuestas || []).filter(
        (x: any) => Number(x.id) !== Number(id)
      );
      p.totalPropuestas = p.propuestas.length;
    });

    this.saveProyectos(proyectos);
    return of(true);
  }
}
