import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { SaldoService } from '../../../../core/services/saldo.service';

@Component({
  selector: 'app-saldo-cliente',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './saldo-cliente.component.html',
  styleUrls: ['./saldo.component.css']
})
export class SaldoClienteComponent implements OnInit {
  saldoActual = 0;
  movimientos: any[] = [];
  retenciones: any[] = [];

  constructor(private saldoService: SaldoService) {}

  ngOnInit(): void {
    this.cargarDatos();
  }

  cargarDatos(): void {
    this.saldoService.consultarSaldo().subscribe(res => {
      this.saldoActual = res.disponible;
      this.movimientos = res.historial;
      this.retenciones = res.bloqueado;
    });
  }
}
