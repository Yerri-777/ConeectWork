import { Component, OnInit } from '@angular/core';

import { CommonModule } from '@angular/common';

import {
  ActivatedRoute,
  Router,
  RouterModule
} from '@angular/router';

import { ContratoService } from '../../../../core/services/contrato.service';

import { NotificationService } from '../../../../core/services/notification.service';

@Component({
  selector: 'app-detalle-contrato',

  standalone: true,

  imports: [
    CommonModule,
    RouterModule
  ],

  templateUrl: './detalle-contrato.component.html',

  styleUrls: ['./contratos.component.css']
})
export class DetalleContratoComponent implements OnInit {

  contrato: any = null;

  cargando = true;

  procesando = false;

  constructor(
    private route: ActivatedRoute,
    private contratoService: ContratoService,
    private notificationService: NotificationService,
    private router: Router
  ) {}

  ngOnInit(): void {

    const id =
      this.route.snapshot.paramMap.get('id');

    if (!id) {

      this.router.navigate([
        '/cliente/contratos'
      ]);

      return;
    }

    this.cargarContrato(id);
  }

  cargarContrato(
    id: string
  ): void {

    this.cargando = true;

    this.contratoService.obtenerPorId(id).subscribe({

      next: (data: any) => {

        this.contrato = data;

        this.cargando = false;
      },

      error: (error) => {

        console.error(
          '[DetalleContrato] Error:',
          error
        );

        this.cargando = false;

        this.notificationService.mostrarError(
          'No se pudo cargar el contrato'
        );

        this.router.navigate([
          '/cliente/contratos'
        ]);
      }
    });
  }

  cancelarContrato(): void {

    if (
      !this.contrato ||
      this.procesando
    ) {
      return;
    }

    const confirmar = confirm(
      '¿Estás seguro de solicitar la cancelación del contrato?'
    );

    if (!confirmar) {
      return;
    }

    this.procesando = true;

    this.contratoService
      .cancelar(this.contrato.id)
      .subscribe({

        next: () => {

          this.procesando = false;

          this.contrato.estado =
            'CANCELADO';

          this.notificationService.mostrarExito(
            'Contrato cancelado correctamente'
          );
        },

        error: (error) => {

          console.error(
            '[DetalleContrato] Error cancelando:',
            error
          );

          this.procesando = false;

          this.notificationService.mostrarError(
            'No se pudo cancelar el contrato'
          );
        }
      });
  }
}
