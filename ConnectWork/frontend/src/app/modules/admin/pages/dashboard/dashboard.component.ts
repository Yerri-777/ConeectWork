import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import {
  trigger,
  transition,
  style,
  animate,
} from '@angular/animations';

import {
  Subject,
  forkJoin,
  of,
} from 'rxjs';

import {
  takeUntil,
  catchError,
  finalize,
} from 'rxjs/operators';

import { ReporteService } from '../../../../core/services/reporte.service';
import { NotificationService } from '../../../../core/services/notification.service';

// =====================================================
// INTERFACES
// =====================================================

interface EstadisticaCard {
  titulo: string;
  valor: string | number;
  icono: string;
  color: string;
}

interface TopFreelancer {
  id?: number;
  nombre?: string;
  nombreCompleto?: string;
  contratosCompletados?: number;
  totalIngresado?: number;
  comisionGenerada?: number;
  promedioCalificacion?: number;
}

interface TopCategoria {
  id?: number;
  nombre?: string;
  totalContratos?: number;
  totalComisiones?: number;
}

interface IngresosDashboard {
  totalIngresos: number;
  totalComisiones: number;
  comisionActual: number;
  totalContratos: number;
}

@Component({
  selector: 'app-dashboard-admin',

  standalone: true,

  imports: [CommonModule],

  templateUrl: './dashboard.component.html',

  styleUrls: ['./dashboard.component.css'],

  animations: [
    trigger('fadeInUp', [
      transition(':enter', [
        style({
          opacity: 0,
          transform: 'translateY(20px)',
        }),

        animate(
          '500ms ease-out',
          style({
            opacity: 1,
            transform: 'translateY(0)',
          }),
        ),
      ]),
    ]),
  ],
})
export class DashboardComponent implements OnInit, OnDestroy {

  // =====================================================
  // ESTADO GENERAL
  // =====================================================

  cargando = false;

  fechaActual = new Date();

  // =====================================================
  // CARDS PRINCIPALES
  // =====================================================

  estadisticas: EstadisticaCard[] = [];

  // =====================================================
  // REPORTES ADMIN
  // =====================================================

  topFreelancers: TopFreelancer[] = [];

  topCategorias: TopCategoria[] = [];

  ingresos: IngresosDashboard = {
    totalIngresos: 0,
    totalComisiones: 0,
    comisionActual: 0,
    totalContratos: 0,
  };

  // =====================================================
  // CONTROL RXJS
  // =====================================================

  private destroy$ = new Subject<void>();

  constructor(
    private reporteService: ReporteService,
    private notificationService: NotificationService,
  ) {}

  // =====================================================
  // INIT
  // =====================================================

  ngOnInit(): void {
    console.log('====================================');
    console.log('[ADMIN DASHBOARD] Inicializando...');
    console.log('====================================');

    /**
     * Simulación backend estable:
     * Espera recuperación JWT/localStorage
     */
    setTimeout(() => {
      this.cargarDashboard();
    }, 350);
  }

  // =====================================================
  // DESTROY
  // =====================================================

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // =====================================================
  // CARGAR DASHBOARD
  // =====================================================

  private cargarDashboard(): void {

    console.log('====================================');
    console.log('[ADMIN DASHBOARD] Consumiendo endpoints...');
    console.log('====================================');

    this.cargando = true;

    forkJoin({

      // =========================================
      // ESTADISTICAS GENERALES
      // =========================================

      estadisticas:
        this.reporteService
          .obtenerEstadisticasGlobales()
          .pipe(
            catchError((error) => {
              this.logHttpError(
                'ERROR /reportes/admin/estadisticas',
                error
              );

              return of(null);
            }),
          ),

      // =========================================
      // TOP FREELANCERS
      // =========================================

      freelancers:
        this.reporteService
          .obtenerTopFreelancers()
          .pipe(
            catchError((error) => {
              this.logHttpError(
                'ERROR /reportes/admin/top-freelancers',
                error
              );

              return of([]);
            }),
          ),

      // =========================================
      // TOP CATEGORIAS
      // =========================================

      categorias:
        this.reporteService
          .obtenerTopCategorias()
          .pipe(
            catchError((error) => {
              this.logHttpError(
                'ERROR /reportes/admin/top-categorias',
                error
              );

              return of([]);
            }),
          ),

      // =========================================
      // INGRESOS
      // =========================================

      ingresos:
        this.reporteService
          .obtenerIngresos()
          .pipe(
            catchError((error) => {
              this.logHttpError(
                'ERROR /reportes/admin/ingresos',
                error
              );

              return of(null);
            }),
          ),

    })
      .pipe(
        takeUntil(this.destroy$),

        finalize(() => {
          this.cargando = false;

          console.log('====================================');
          console.log('[ADMIN DASHBOARD] Dashboard cargado');
          console.log('====================================');
        }),
      )

      .subscribe({

        next: (response: any) => {

          console.log('[ADMIN DASHBOARD] RESPONSE:', response);

          // =====================================
          // ESTADISTICAS
          // =====================================

          this.procesarEstadisticas(
            response?.estadisticas
          );

          // =====================================
          // TOP FREELANCERS
          // =====================================

          this.topFreelancers =
            this.normalizarTopFreelancers(
              response?.freelancers || []
            );

          // =====================================
          // TOP CATEGORIAS
          // =====================================

          this.topCategorias =
            this.normalizarTopCategorias(
              response?.categorias || []
            );

          // =====================================
          // INGRESOS
          // =====================================

          this.ingresos =
            this.normalizarIngresos(
              response?.ingresos
            );

          console.log('[ADMIN DASHBOARD] ✓ Datos procesados');
        },

        error: (error: HttpErrorResponse) => {

          this.logHttpError(
            'ERROR GENERAL DASHBOARD',
            error
          );

          this.notificationService.mostrarError(
            'Error cargando dashboard administrativo'
          );

          this.setValoresPorDefecto();
        },
      });
  }

  // =====================================================
  // PROCESAR ESTADISTICAS
  // =====================================================

  private procesarEstadisticas(datos: any): void {

    console.log('[ADMIN DASHBOARD] Estadísticas RAW:', datos);

    const totalUsuarios =
      Number(
        datos?.totalUsuarios ??
        datos?.usuarios ??
        datos?.cantidadUsuarios ??
        datos?.total_usuarios ??
        0
      );

    const totalProyectos =
      Number(
        datos?.totalProyectos ??
        datos?.proyectos ??
        datos?.cantidadProyectos ??
        datos?.total_proyectos ??
        0
      );

    const totalContratos =
      Number(
        datos?.totalContratos ??
        datos?.contratos ??
        datos?.cantidadContratos ??
        datos?.total_contratos ??
        0
      );

    const totalSolicitudes =
      Number(
        datos?.totalSolicitudes ??
        datos?.solicitudes ??
        datos?.cantidadSolicitudes ??
        datos?.total_solicitudes ??
        0
      );

    this.estadisticas = [

      {
        titulo: 'Usuarios Registrados',
        valor: totalUsuarios,
        icono: '👥',
        color: 'blue',
      },

      {
        titulo: 'Proyectos Publicados',
        valor: totalProyectos,
        icono: '📁',
        color: 'green',
      },

      {
        titulo: 'Contratos Activos',
        valor: totalContratos,
        icono: '📄',
        color: 'orange',
      },

      {
        titulo: 'Solicitudes Pendientes',
        valor: totalSolicitudes,
        icono: '⏳',
        color: 'red',
      },
    ];

    console.log(
      '[ADMIN DASHBOARD] Estadísticas procesadas:',
      this.estadisticas
    );
  }

  // =====================================================
  // NORMALIZAR FREELANCERS
  // =====================================================

  private normalizarTopFreelancers(
    data: any[]
  ): TopFreelancer[] {

    if (!Array.isArray(data)) {
      return [];
    }

    return data.slice(0, 5).map((item: any) => ({
      id:
        item?.id ??
        item?.freelancerId ??
        0,

      nombre:
        item?.nombre ??
        item?.nombreCompleto ??
        item?.freelancer ??
        'Freelancer',

      nombreCompleto:
        item?.nombreCompleto ??
        item?.nombre ??
        'Freelancer',

      contratosCompletados:
        Number(
          item?.contratosCompletados ??
          item?.cantidadContratos ??
          item?.contratos ??
          0
        ),

      totalIngresado:
        Number(
          item?.totalIngresado ??
          item?.ingresos ??
          item?.monto ??
          0
        ),

      comisionGenerada:
        Number(
          item?.comisionGenerada ??
          item?.comision ??
          0
        ),

      promedioCalificacion:
        Number(
          item?.promedioCalificacion ??
          item?.rating ??
          0
        ),
    }));
  }

  // =====================================================
  // NORMALIZAR CATEGORIAS
  // =====================================================

  private normalizarTopCategorias(
    data: any[]
  ): TopCategoria[] {

    if (!Array.isArray(data)) {
      return [];
    }

    return data.slice(0, 5).map((item: any) => ({
      id:
        item?.id ??
        item?.categoriaId ??
        0,

      nombre:
        item?.nombre ??
        item?.categoria ??
        'Categoría',

      totalContratos:
        Number(
          item?.totalContratos ??
          item?.contratos ??
          0
        ),

      totalComisiones:
        Number(
          item?.totalComisiones ??
          item?.comisiones ??
          0
        ),
    }));
  }

  // =====================================================
  // NORMALIZAR INGRESOS
  // =====================================================

  private normalizarIngresos(
    data: any
  ): IngresosDashboard {

    return {

      totalIngresos:
        Number(
          data?.totalIngresos ??
          data?.ingresos ??
          0
        ),

      totalComisiones:
        Number(
          data?.totalComisiones ??
          data?.comisiones ??
          0
        ),

      comisionActual:
        Number(
          data?.comisionActual ??
          data?.porcentaje ??
          0
        ),

      totalContratos:
        Number(
          data?.totalContratos ??
          data?.contratos ??
          0
        ),
    };
  }

  // =====================================================
  // DEFAULTS
  // =====================================================

  private setValoresPorDefecto(): void {

    this.estadisticas = [

      {
        titulo: 'Usuarios Registrados',
        valor: 0,
        icono: '👥',
        color: 'blue',
      },

      {
        titulo: 'Proyectos Publicados',
        valor: 0,
        icono: '📁',
        color: 'green',
      },

      {
        titulo: 'Contratos Activos',
        valor: 0,
        icono: '📄',
        color: 'orange',
      },

      {
        titulo: 'Solicitudes Pendientes',
        valor: 0,
        icono: '⏳',
        color: 'red',
      },
    ];

    this.topFreelancers = [];

    this.topCategorias = [];

    this.ingresos = {
      totalIngresos: 0,
      totalComisiones: 0,
      comisionActual: 0,
      totalContratos: 0,
    };
  }

  // =====================================================
  // LOGGER HTTP
  // =====================================================

  private logHttpError(
    titulo: string,
    error: HttpErrorResponse
  ): void {

    console.error('====================================');
    console.error(titulo);
    console.error('====================================');

    console.error('STATUS:', error.status);
    console.error('STATUS TEXT:', error.statusText);
    console.error('URL:', error.url);
    console.error('MESSAGE:', error.message);
    console.error('BODY:', error.error);
    console.error('FULL ERROR:', error);

    console.error('====================================');

    // =========================================
    // MENSAJES UX
    // =========================================

    switch (error.status) {

      case 0:
        this.notificationService.mostrarAdvertencia(
          'Modo local activo - simulando backend'
        );
        break;

      case 401:
        this.notificationService.mostrarError(
          'Sesión expirada'
        );
        break;

      case 403:
        this.notificationService.mostrarError(
          'No tienes permisos'
        );
        break;

      case 404:
        this.notificationService.mostrarError(
          'Endpoint no encontrado'
        );
        break;

      default:

        if (error.status >= 500) {
          this.notificationService.mostrarError(
            'Error interno del servidor'
          );
        }

        break;
    }
  }

  // =====================================================
  // HELPERS TEMPLATE
  // =====================================================

  trackByIndex(index: number): number {
    return index;
  }

  formatearMoneda(valor: number): string {

    return new Intl.NumberFormat('es-GT', {
      style: 'currency',
      currency: 'GTQ',
      minimumFractionDigits: 2,
    }).format(valor || 0);
  }

  obtenerClaseColor(color: string): string {

    switch (color) {

      case 'blue':
        return 'card-blue';

      case 'green':
        return 'card-green';

      case 'orange':
        return 'card-orange';

      case 'red':
        return 'card-red';

      default:
        return 'card-default';
    }
  }

  obtenerSaludo(): string {

    const hora = new Date().getHours();

    if (hora < 12) {
      return 'Buenos días';
    }

    if (hora < 18) {
      return 'Buenas tardes';
    }

    return 'Buenas noches';
  }
}
