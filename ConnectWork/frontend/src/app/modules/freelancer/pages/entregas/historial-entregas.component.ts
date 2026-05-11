import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

import { EntregaService } from '../../../../core/services/entrega.service';
import { CalificacionService } from '../../../../core/services/calificacion.service';

@Component({
  selector: 'app-historial-entregas',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './historial-entregas.component.html',
  styleUrls: ['./entregas.component.css']
})
export class HistorialEntregasComponent implements OnInit {

  entregas: any[] = [];

  constructor(
    private entregaService: EntregaService,
    private calificacionService: CalificacionService
  ) {}

  ngOnInit(): void {

    console.log(
      '[HistorialEntregas] Inicializando componente...'
    );

    this.cargarEntregas();
  }

  cargarEntregas(): void {

    console.log(
      '[HistorialEntregas] Cargando entregas...'
    );

    this.entregaService
      .listarMias()
      .subscribe({

        next: (entregas) => {

          console.log(
            '[HistorialEntregas] Entregas obtenidas:',
            entregas
          );

          /**
           * OBTENER TODAS LAS CALIFICACIONES
           */
          const todasLasCalificaciones = JSON.parse(

            localStorage.getItem(
              'connectwork_calificaciones'
            ) || '[]'
          );

          console.log(
            '[HistorialEntregas] Calificaciones encontradas:',
            todasLasCalificaciones
          );

          /**
           * MAPEAR ENTREGAS
           * Y ADJUNTAR CALIFICACIONES
           */
          this.entregas = entregas.map((e: any) => {

            /**
             * BUSCAR CALIFICACIÓN
             * POR entregaId
             */
            const calif = todasLasCalificaciones.find(

              (c: any) =>

                Number(c.entregaId) ===
                Number(e.id)
            );

            return {

              ...e,

              /**
               * ESTRELLAS
               */
              estrellas:

                calif

                  ? this.calificacionService
                      .generarEstrellas(
                        calif.puntuacion
                      )

                  : null,

              /**
               * COMENTARIO
               */
              comentarioCalif:

                calif
                  ? calif.comentario
                  : null,

              /**
               * PUNTUACIÓN NUMÉRICA
               */
              puntuacion:

                calif
                  ? calif.puntuacion
                  : null
            };
          });

          console.log(
            '[HistorialEntregas] ✓ Entregas procesadas:',
            this.entregas
          );
        },

        error: (error) => {

          console.error(
            '[HistorialEntregas] ✗ Error cargando entregas:',
            error
          );
        }
      });
  }
}
