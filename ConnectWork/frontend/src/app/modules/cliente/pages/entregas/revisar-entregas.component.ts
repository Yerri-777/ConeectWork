import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { EntregaService } from '../../../../core/services/entrega.service';
import { NotificationService } from '../../../../core/services/notification.service';

@Component({
  selector: 'app-revisar-entregas',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './revisar-entregas.component.html',
  styleUrls: ['./entregas.component.css']
})
export class RevisarEntregasComponent implements OnInit {
  entregas: any[] = [];
  cargando = false;

  constructor(
    private entregaService: EntregaService,
    private notification: NotificationService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.cargarEntregas();
  }

  cargarEntregas(): void {
    this.cargando = true;
    this.entregaService.listarPendientesCliente().subscribe({
      next: (data) => {
        this.entregas = data || [];
        console.log('[RevisarEntregas] Datos cargados:', this.entregas);
        this.cargando = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.cargando = false;
        this.notification.mostrarError('No se pudieron cargar las entregas');
        this.cdr.detectChanges();
      }
    });
  }

  abrirAprobar(entrega: any): void {
    this.router.navigate(['/cliente/entregas/aprobar', entrega.id]);
  }

  abrirRechazar(entrega: any): void {
    this.router.navigate(['/cliente/entregas/rechazar', entrega.id]);
  }

  trackByEntrega(index: number, entrega: any): number {
    return entrega.id;
  }
}
