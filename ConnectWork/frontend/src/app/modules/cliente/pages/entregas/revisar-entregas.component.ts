import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { EntregaService } from '../../../../core/services/entrega.service';

@Component({
  selector: 'app-revisar-entregas',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './revisar-entregas.component.html',
  styleUrls: ['./entregas.component.css']
})
export class RevisarEntregasComponent implements OnInit {
  entregas: any[] = [];

  constructor(private entregaService: EntregaService, private router: Router) {}

  ngOnInit(): void {
    this.entregaService.listarPendientesCliente().subscribe(data => this.entregas = data);
  }

  abrirAprobar(entrega: any) {
    this.router.navigate(['/cliente/entregas/aprobar', entrega.id]);
  }

  abrirRechazar(entrega: any) {
    this.router.navigate(['/cliente/entregas/rechazar', entrega.id]);
  }
}
