import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Contrato } from '../models/contrato.model';

@Injectable({
  providedIn: 'root'
})
export class ContratoService {
  private KEY = 'connectwork_contratos';


  private getContratos(): any[] {
    try {
      const data = localStorage.getItem(this.KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  private saveContratos(contratos: any[]): void {
    localStorage.setItem(this.KEY, JSON.stringify(contratos));
  }

  listar(): Observable<Contrato[]> {
    const contratos = this.getContratos();
    const formateados = contratos.map((c: any) => ({
      ...c,
      montoAcordado: c.monto // Mapeo crítico para tus tablas en el HTML
    }));
    return of(formateados);
  }


  obtenerPorId(id: string | number): Observable<Contrato> {
    const contratos = this.getContratos();
    const contrato = contratos.find((c: any) => String(c.id) === String(id));

    if (contrato) {
      contrato.montoAcordado = contrato.monto;
      contrato.descripcionAcuerdo = contrato.descripcionAcuerdo ||
        'Términos y condiciones aceptados según la propuesta original en ConnectWork.';
    }

    return of(contrato);
  }


  cancelar(id: string | number, motivo?: string): Observable<any> {
    const contratos = this.getContratos();
    const actualizados = contratos.map((c: any) =>
      String(c.id) === String(id)
        ? { ...c, estado: 'CANCELADO', motivoCancelacion: motivo, fechaCancelacion: new Date() }
        : c
    );

    this.saveContratos(actualizados);
    return of({ success: true });
  }


  listarActivos(): Observable<Contrato[]> {
    return this.filtrarPorEstado('ACTIVO');
  }

  listarCompletados(): Observable<Contrato[]> {
    return this.filtrarPorEstado('COMPLETADO');
  }

  listarCancelados(): Observable<Contrato[]> {
    return this.filtrarPorEstado('CANCELADO');
  }

  filtrarPorEstado(estado: string): Observable<Contrato[]> {
    const contratos = this.getContratos();
    const filtrados = contratos
      .filter(c => c.estado === estado)
      .map(c => ({ ...c, montoAcordado: c.monto }));
    return of(filtrados);
  }

  obtenerEntregas(id: string | number): Observable<any[]> {
    const entregas = JSON.parse(localStorage.getItem('connectwork_entregas') || '[]');
    const filtradas = entregas.filter((e: any) => String(e.contratoId) === String(id));
    return of(filtradas);
  }

  /**
   * ESTADÍSTICAS Y CONTEOS (Lógica de Reportes mantenida)
   */
  obtenerEstadisticas(): Observable<any> {
    const contratos = this.getContratos();
    return of({
      total: contratos.length,
      activos: contratos.filter(c => c.estado === 'ACTIVO').length,
      completados: contratos.filter(c => c.estado === 'COMPLETADO').length,
      cancelados: contratos.filter(c => c.estado === 'CANCELADO').length,
      montoTotal: contratos.reduce((acc, c) => acc + (Number(c.monto) || 0), 0)
    });
  }

  contarPorEstado(estado: string): Observable<{ total: number }> {
    const contratos = this.getContratos();
    const total = contratos.filter(c => c.estado === estado).length;
    return of({ total });
  }

  filtrarPorFechas(desde: string, hasta: string): Observable<Contrato[]> {
    const contratos = this.getContratos();
    const fDesde = new Date(desde);
    const fHasta = new Date(hasta);

    const filtrados = contratos.filter(c => {
      const fContrato = new Date(c.fechaInicio);
      return fContrato >= fDesde && fContrato <= fHasta;
    }).map(c => ({ ...c, montoAcordado: c.monto }));

    return of(filtrados);
  }
}
