import {
  Component,
  OnInit,
  ChangeDetectionStrategy
} from '@angular/core';

import { CommonModule } from '@angular/common';

import { FormsModule } from '@angular/forms';

import jsPDF from 'jspdf';

import autoTable from 'jspdf-autotable';

import { NotificationService } from '../../../../core/services/notification.service';

@Component({
  selector: 'app-reporte-cliente',

  standalone: true,

  imports: [
    CommonModule,
    FormsModule
  ],

  templateUrl:
    './reporte-cliente.component.html',

  styleUrls: [
    './reporte-cliente.component.css'
  ],

  changeDetection:
    ChangeDetectionStrategy.OnPush
})
export class ReporteClienteComponent
  implements OnInit {

  /**
   * FILTRO
   */
  periodo = 'mes';

  /**
   * LOADING
   */
  cargando = false;

  /**
   * FECHA
   */
  fechaActual =
    new Date().toLocaleDateString();

  /**
   * ESTADÍSTICAS
   */
  statsCategorias: any[] = [];

  statsEstados: any[] = [];

  estadisticas: any = {

    totalProyectos: 0,

    proyectosActivos: 0,

    proyectosFinalizados: 0,

    totalGastado: 0,

    saldoActual: 0
  };

  /**
   * DATA
   */
  proyectos: any[] = [];

  contratos: any[] = [];

  entregas: any[] = [];

  constructor(
    private notification:
      NotificationService
  ) {}

  ngOnInit(): void {

    this.cargarDatos();
  }

  /**
   * CARGAR DATOS
   * SINCRONIZADOS
   * CON EL SALDO REAL
   */
  cargarDatos(): void {

    this.cargando = true;

    try {


      this.proyectos = JSON.parse(

        localStorage.getItem(
          'connectwork_proyectos'
        ) || '[]'
      );

      this.contratos = JSON.parse(

        localStorage.getItem(
          'connectwork_contratos'
        ) || '[]'
      );

      this.entregas = JSON.parse(

        localStorage.getItem(
          'connectwork_entregas'
        ) || '[]'
      );

      /**
       * 2. USUARIO ACTUAL
       */
      const userJson =

        localStorage.getItem(
          'usuario'
        )

        ||

        localStorage.getItem(
          'connectwork_user'
        );

      const currentUser =

        userJson
          ? JSON.parse(userJson)
          : null;

      console.log(
        '[ReporteCliente] Usuario actual:',
        currentUser
      );


      this.estadisticas = {

        totalProyectos:
          this.proyectos.length,

        proyectosActivos:

          this.proyectos.filter(

            p =>

              [
                'ABIERTO',
                'ACTIVO',
                'EN_PROGRESO'
              ].includes(
                p.estado
              )

          ).length,

        proyectosFinalizados:

          this.proyectos.filter(

            p =>
              p.estado ===
              'FINALIZADO'

          ).length,


        totalGastado:

          (currentUser?.movimientos || [])

            .filter(

              (m: any) =>

                m.tipo === 'EGRESO'

                ||

                (
                  m.descripcion &&
                  m.descripcion.includes(
                    'Pago'
                  )
                )
            )

            .reduce(

              (
                acc: number,
                m: any
              ) =>

                acc +
                Math.abs(
                  Number(
                    m.monto || 0
                  )
                ),

              0
            ),

        saldoActual:

          Number(
            currentUser?.saldo
          ) || 0
      };

      const categoriasMap =
        new Map<string, number>();

      this.proyectos.forEach(

        (p: any) => {

          const categoria =

            p.categoria ||
            'Otros';

          const monto =

            Number(
              p.presupuestoMax || 0
            );

          categoriasMap.set(

            categoria,

            (
              categoriasMap.get(
                categoria
              ) || 0
            ) + monto
          );
        }
      );

      this.statsCategorias =

        Array.from(
          categoriasMap.entries()
        )

        .map(

          ([nombre, total]) => ({

            nombre,

            total
          })
        );

      /**
       * 5. ESTADOS
       */
      const estadosMap =
        new Map<string, number>();

      this.proyectos.forEach(

        (p: any) => {

          const estado =

            p.estado ||
            'BORRADOR';

          estadosMap.set(

            estado,

            (
              estadosMap.get(
                estado
              ) || 0
            ) + 1
          );
        }
      );

      this.statsEstados =

        Array.from(
          estadosMap.entries()
        )

        .map(

          ([estado, cantidad]) => ({

            estado,

            cantidad
          })
        );

      console.log(
        '📊 Reportes sincronizados con el saldo:',
        currentUser?.id
      );

      console.log(
        '[ReporteCliente] Estadísticas:',
        this.estadisticas
      );

      console.log(
        '[ReporteCliente] Categorías:',
        this.statsCategorias
      );

      console.log(
        '[ReporteCliente] Estados:',
        this.statsEstados
      );

      this.cargando = false;

    } catch (error) {

      console.error(
        '[ReporteCliente] Error:',
        error
      );

      this.notification
        .mostrarError(
          'No se pudieron procesar los datos del reporte'
        );

      this.cargando = false;
    }
  }

  /**
   * EXPORTAR PDF
   */
  exportarPDF(): void {

    try {

      const doc =
        new jsPDF();

      /**
       * HEADER
       */
      doc.setFontSize(20);

      doc.text(
        'Reporte Cliente - ConnectWork',
        14,
        20
      );

      doc.setFontSize(11);

      doc.text(
        `Fecha: ${this.fechaActual}`,
        14,
        30
      );

      doc.text(
        `Periodo: ${this.periodo}`,
        14,
        38
      );

      /**
       * RESUMEN
       */
      doc.setFontSize(15);

      doc.text(
        'Resumen General',
        14,
        50
      );

      autoTable(doc, {

        startY: 55,

        head: [
          ['Métrica', 'Valor']
        ],

        body: [

          [
            'Total Proyectos',
            this.estadisticas
              .totalProyectos
          ],

          [
            'Proyectos Activos',
            this.estadisticas
              .proyectosActivos
          ],

          [
            'Proyectos Finalizados',
            this.estadisticas
              .proyectosFinalizados
          ],

          [
            'Total Gastado',
            `Q ${this.estadisticas.totalGastado}`
          ],

          [
            'Saldo Actual',
            `Q ${this.estadisticas.saldoActual}`
          ]
        ]
      });

      /**
       * CATEGORÍAS
       */
      let finalY =

        (doc as any)
          .lastAutoTable.finalY + 15;

      doc.setFontSize(15);

      doc.text(
        'Inversión por Categoría',
        14,
        finalY
      );

      autoTable(doc, {

        startY:
          finalY + 5,

        head: [
          ['Categoría', 'Monto']
        ],

        body:

          this.statsCategorias.map(

            categoria => [

              categoria.nombre,

              `Q ${categoria.total}`
            ]
          )
      });

      /**
       * ESTADOS
       */
      finalY =

        (doc as any)
          .lastAutoTable.finalY + 15;

      doc.setFontSize(15);

      doc.text(
        'Estado de Proyectos',
        14,
        finalY
      );

      autoTable(doc, {

        startY:
          finalY + 5,

        head: [
          ['Estado', 'Cantidad']
        ],

        body:

          this.statsEstados.map(

            estado => [

              estado.estado,

              estado.cantidad
            ]
          )
      });

      /**
       * FOOTER
       */
      const pages =
        doc.getNumberOfPages();

      for (
        let i = 1;
        i <= pages;
        i++
      ) {

        doc.setPage(i);

        doc.setFontSize(10);

        doc.text(
          `Página ${i} de ${pages}`,
          170,
          290
        );
      }

      /**
       * DESCARGAR
       */
      doc.save(
        `reporte_connectwork_${Date.now()}.pdf`
      );

      console.log(
        '[ReporteCliente]  PDF generado'
      );

      this.notification
        .mostrarExito(
          'Reporte exportado correctamente'
        );

    } catch (error) {

      console.error(
        '[ReporteCliente] Error PDF:',
        error
      );

      this.notification
        .mostrarError(
          'Error generando PDF'
        );
    }
  }
}
