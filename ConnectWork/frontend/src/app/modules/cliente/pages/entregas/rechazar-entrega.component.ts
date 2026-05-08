import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { EntregaService } from '../../../../core/services/entrega.service';

@Component({
  selector: 'app-rechazar-entrega',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './rechazar-entrega.component.html',
  styleUrls: ['./entregas.component.css']
})
export class RechazarEntregaComponent {
  entregaId: string;
  motivo = '';

  constructor(
    private route: ActivatedRoute,
    private entregaService: EntregaService,
    private router: Router
  ) {
    this.entregaId = this.route.snapshot.paramMap.get('id')!;
  }

  enviarRechazo() {
    this.entregaService.rechazar(this.entregaId, this.motivo).subscribe(() => {
      this.router.navigate(['/cliente/entregas']);
    });
  }

  cancelar() { this.router.navigate(['/cliente/entregas']); }
}
