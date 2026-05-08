import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EntregaService } from '../../../../core/services/entrega.service';

@Component({
  selector: 'app-historial-entregas',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './historial-entregas.component.html',
  styleUrls: ['./entregas.component.css']
})
export class HistorialEntregasComponent implements OnInit {
  entregas: any[] = [];

  constructor(private entregaService: EntregaService) {}

  ngOnInit(): void {
    this.entregaService.listarMias().subscribe(data => {
      this.entregas = data;
    });
  }
}
