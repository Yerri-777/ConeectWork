import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { ContratoService } from '../../../../core/services/contrato.service';

@Component({
  selector: 'app-detalle-contrato',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './detalle-contrato.component.html',
  styleUrls: ['./contratos.component.css']
})
export class DetalleContratoComponent implements OnInit {
  contrato: any = null;

  constructor(
    private route: ActivatedRoute,
    private contratoService: ContratoService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.contratoService.obtenerPorId(id).subscribe({
        next: (data) => this.contrato = data
      });
    }
  }
}
