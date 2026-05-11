import {
  Component,
  OnInit
} from '@angular/core';

import {
  CommonModule
} from '@angular/common';

import {
  NotificationService
} from '../../../../core/services/notification.service';

@Component({
  selector: 'app-reporte-freelancer',

  standalone: true,

  imports: [
    CommonModule
  ],

  templateUrl:
    './reporte-freelancer.component.html',

  styleUrls: [
    './reporte-freelancer.component.css'
  ]
})
export class ReporteFreelancerComponent
  implements OnInit {

  stats: any = {

    proyectosCompletados: 0,

    proyectosActivos: 0,

    propuestasEnviadas: 0,

    propuestasAceptadas: 0,

    tasaAceptacion: 0,

    ingresosTotales: 0,

    ingresosEsteMes: 0,

    calificacionPromedio: 0,

    totalReseñas: 0
  };

  cargando = false;

  freelancer: any = null;

  constructor(

    private notification:
      NotificationService

  ) {}

  ngOnInit(): void {

    this.cargarEstadisticas();
  }

  cargarEstadisticas(): void {

    this.cargando = true;

    try {


      const userJson =

        localStorage.getItem('usuario')

        ||

        localStorage.getItem(
          'connectwork_user'
        );

      if (!userJson) {

        this.notification.mostrarError(
          'No existe sesión activa'
        );

        this.cargando = false;

        return;
      }

      this.freelancer =
        JSON.parse(userJson);

      const freelancerId =
        String(this.freelancer.id);


      const contratos = JSON.parse(

        localStorage.getItem(
          'connectwork_contratos'
        ) || '[]'
      );

      const propuestas = JSON.parse(

        localStorage.getItem(
          'connectwork_propuestas'
        ) || '[]'
      );

      const calificaciones = JSON.parse(

        localStorage.getItem(
          'connectwork_calificaciones'
        ) || '[]'
      );

      const entregas = JSON.parse(

        localStorage.getItem(
          'connectwork_entregas'
        ) || '[]'
      );


      const misContratos =

        contratos.filter(
          (c: any) =>

            String(
              c.freelancerId
            ) === freelancerId
        );

      const misPropuestas =

        propuestas.filter(
          (p: any) =>

            String(
              p.freelancerId
            ) === freelancerId
        );

      const misCalificaciones =

        calificaciones.filter(
          (c: any) =>

            String(
              c.freelancerId
            ) === freelancerId
        );

      const misEntregas =

        entregas.filter(
          (e: any) =>

            String(
              e.freelancerId
            ) === freelancerId
        );

      const proyectosCompletados =

        misContratos.filter(
          (c: any) =>

            c.estado === 'COMPLETADO'

            ||

            c.estado === 'FINALIZADO'
        ).length;


      const proyectosActivos =

        misContratos.filter(
          (c: any) =>

            c.estado === 'ACTIVO'

            ||

            c.estado === 'EN_PROGRESO'
        ).length;


      const propuestasAceptadas =

        misPropuestas.filter(
          (p: any) =>

            p.estado === 'ACEPTADA'
        ).length;

      const tasaAceptacion =

        misPropuestas.length > 0

          ?

          (
            propuestasAceptadas
            /
            misPropuestas.length
          ) * 100

          :

          0;


      const movimientos =

        this.freelancer.movimientos || [];

      const ingresos =

        movimientos.filter(
          (m: any) =>

            m.tipo === 'INGRESO'
        );

      const ingresosTotales =

        ingresos.reduce(

          (
            acc: number,
            mov: any
          ) =>

            acc +
            Number(
              mov.monto || 0
            ),

          0
        );


      const hoy = new Date();

      const ingresosEsteMes =

        ingresos.filter(
          (m: any) => {

            const fecha =
              new Date(m.fecha);

            return (

              fecha.getMonth() ===
              hoy.getMonth()

              &&

              fecha.getFullYear() ===
              hoy.getFullYear()
            );
          }
        )
        .reduce(

          (
            acc: number,
            mov: any
          ) =>

            acc +
            Number(
              mov.monto || 0
            ),

          0
        );


      const totalReseñas =
        misCalificaciones.length;

      const promedio =

        totalReseñas > 0

          ?

          misCalificaciones.reduce(

            (
              acc: number,
              c: any
            ) =>

              acc +
              Number(
                c.puntuacion || 0
              ),

            0

          ) / totalReseñas

          :

          Number(
            this.freelancer.rating || 0
          );


      this.stats = {

        proyectosCompletados,

        proyectosActivos,

        propuestasEnviadas:
          misPropuestas.length,

        propuestasAceptadas,

        tasaAceptacion,

        ingresosTotales,

        ingresosEsteMes,

        calificacionPromedio:
          promedio,

        totalReseñas
      };

      console.log(
        '[ReporteFreelancer] Reporte generado'
      );

      console.log(
        this.stats
      );

      console.log(
        'Entregas:',
        misEntregas.length
      );

      console.log(
        'Calificaciones:',
        misCalificaciones.length
      );

      this.cargando = false;

    } catch (error) {

      console.error(
        '[ReporteFreelancer] Error:',
        error
      );

      this.notification.mostrarError(
        'No se pudieron cargar las estadísticas'
      );

      this.cargando = false;
    }
  }

  generarEstrellas(
    puntuacion: number
  ): string {

    const estrellas = Math.round(
      puntuacion || 0
    );

    return (

      '⭐'.repeat(
        Math.min(estrellas, 5)
      )

      +

      '☆'.repeat(
        Math.max(0, 5 - estrellas)
      )
    );
  }

  refrescar(): void {

    this.cargarEstadisticas();
  }
}
