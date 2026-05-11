import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SaldoService } from '../../../../core/services/saldo.service';
import { NotificationService } from '../../../../core/services/notification.service';

// Importaciones para PDF
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface Transaccion {
  id: number;
  fecha: string;
  tipo: string;
  proyectoId: number;
  montoBruto: number;
  montoComision: number;
  estado: string;
}

interface SaldoData {
  totalAcumulado: number;
  comisionesPendientes: number;
}

@Component({
  selector: 'app-saldo-plataforma',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './saldo-plataforma.component.html',
  styleUrls: ['./saldo-plataforma.component.css']
})
export class SaldoPlataformaComponent implements OnInit {
  saldoData: SaldoData = {
    totalAcumulado: 0,
    comisionesPendientes: 0
  };

  transacciones: Transaccion[] = [];
  comisionActual: number = 0;
  cargando: boolean = false;

  constructor(
    private saldoService: SaldoService,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.cargarSaldo();
    this.cargarComisionActual();
  }

  cargarSaldo(): void {
    this.cargando = true;
    this.saldoService.obtenerSaldoPlataforma().subscribe({
      next: (data) => {
        this.saldoData = {
          totalAcumulado: data.totalAcumulado || 0,
          comisionesPendientes: data.comisionesPendientes || 0
        };
        this.transacciones = data.transacciones || [];
        this.cargando = false;
      },
      error: (error) => {
        console.error('Error:', error);
        this.notificationService.mostrarError('Error al cargar datos financieros');
        this.cargando = false;
      }
    });
  }

  private cargarComisionActual(): void {
    this.saldoService.obtenerComisionActual().subscribe({
      next: (data) => {
        this.comisionActual = data.porcentaje;
      },
      error: (err) => console.error('Error al cargar comisión:', err)
    });
  }

  actualizarComision(nuevaComision: number): void {
    if (nuevaComision >= 0 && nuevaComision <= 100) {
      this.comisionActual = nuevaComision;
      this.recalcularComisionesLocalmente();
    }
  }

  private recalcularComisionesLocalmente(): void {
    this.transacciones = this.transacciones.map(trans => ({
      ...trans,
      montoComision: (trans.montoBruto * this.comisionActual) / 100
    }));

    this.saldoData.comisionesPendientes = this.transacciones
      .filter(t => t.estado === 'PENDIENTE')
      .reduce((suma, t) => suma + t.montoComision, 0);
  }

  descargarReporte(): void {
    try {
      const doc = new jsPDF();
      const fechaCorte = new Date().toLocaleDateString();

      doc.setFontSize(18);
      doc.text('Reporte de Saldo - Plataforma', 14, 20);

      doc.setFontSize(11);
      doc.setTextColor(100);
      doc.text(`Fecha de reporte: ${fechaCorte}`, 14, 30);
      doc.text(`Comisión aplicada: ${this.comisionActual}%`, 14, 37);

      doc.setDrawColor(200);
      doc.line(14, 42, 196, 42);

      doc.setTextColor(0);
      doc.text(`Total Bruto: Q${this.getTotalBruto().toFixed(2)}`, 14, 50);
      doc.text(`Total Comisiones: Q${this.getTotalComisiones().toFixed(2)}`, 80, 50);
      doc.text(`Pendiente: Q${this.saldoData.comisionesPendientes.toFixed(2)}`, 140, 50);

      autoTable(doc, {
        startY: 60,
        head: [['Fecha', 'Concepto', 'Monto Bruto', 'Comisión', 'Estado']],
        body: this.transacciones.map(t => [
          new Date(t.fecha).toLocaleDateString(),
          t.tipo,
          `Q${t.montoBruto.toFixed(2)}`,
          `Q${t.montoComision.toFixed(2)}`,
          t.estado
        ]),
        headStyles: { fillColor: [41, 128, 185], textColor: 255 },
        alternateRowStyles: { fillColor: [245, 245, 245] },
        margin: { top: 60 }
      });

      const nombreArchivo = `reporte-saldo-${new Date().toISOString().split('T')[0]}.pdf`;
      doc.save(nombreArchivo);

      this.notificationService.mostrarExito('Reporte PDF generado exitosamente');
    } catch (error) {
      console.error('Error al generar PDF:', error);
      this.notificationService.mostrarError('No se pudo generar el reporte PDF');
    }
  }

  getTotalComisiones(): number {
    return this.transacciones.reduce((suma, t) => suma + t.montoComision, 0);
  }

  getTotalBruto(): number {
    return this.transacciones.reduce((suma, t) => suma + t.montoBruto, 0);
  }
}
