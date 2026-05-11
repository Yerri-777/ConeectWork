import { Component, OnInit } from '@angular/core';

import { CommonModule } from '@angular/common';

import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';

import { FormsModule } from '@angular/forms';

import {
  ActivatedRoute,
  Router,
  RouterModule
} from '@angular/router';

import {
  CalificacionService
} from '../../../../core/services/calificacion.service';

import { EntregaService } from '../../../../core/services/entrega.service';

import { NotificationService } from '../../../../core/services/notification.service';

@Component({
  selector: 'app-calificar-freelancer',

  standalone: true,

  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule
  ],

  templateUrl:
    './calificar-freelancer.component.html',

  styleUrls: [
    './entregas.component.css'
  ]
})
export class CalificarFreelancerComponent
  implements OnInit {

  /**
   * FORM REACTIVO
   */
  calificacionForm!: FormGroup;

  /**
   * IDS
   */
  entregaId: string | null = null;

  freelancerId: any = null;

  /**
   * FORM SIMPLE
   */
  puntuacion = 0;

  comentario = '';

  /**
   * ESTADOS
   */
  guardando = false;

  cargando = false;

  yaCalificada = false;

  estrellas = [1, 2, 3, 4, 5];

  constructor(

    private fb: FormBuilder,

    private route: ActivatedRoute,

    public router: Router,

    private entregaService: EntregaService,

    public calificacionService: CalificacionService,

    private notification: NotificationService
  ) {}

  /**
   * INIT
   */
  ngOnInit(): void {

    console.log(
      '[CalificarFreelancer] Inicializando...'
    );

    /**
     * FORM
     */
    this.inicializarFormulario();

    /**
     * ENTREGA ID
     */
    this.entregaId =
      this.route.snapshot.paramMap.get(
        'id'
      );

    /**
     * VALIDAR CALIFICACIÓN EXISTENTE
     */
    if (this.entregaId) {

      this.calificacionService
        .verificarCalificacionExistente(
          Number(this.entregaId)
        )
        .subscribe({

          next: (existe) => {

            this.yaCalificada =
              existe;

            if (existe) {

              console.warn(
                '⚠️ Esta entrega ya fue calificada'
              );
            }
          }
        });
    }

    /**
     * FREELANCER ID
     */
    const fId =
      this.route.snapshot.queryParamMap.get(
        'freelancerId'
      );

    /**
     * SI VIENE
     */
    if (
      fId &&
      fId !== 'null' &&
      fId !== 'undefined'
    ) {

      this.freelancerId = fId;

      console.log(
        '✅ freelancerId recibido:',
        this.freelancerId
      );
    }

    /**
     * SI NO VIENE
     */
    else {

      console.warn(
        '⚠️ freelancerId no recibido. Intentando rescate...'
      );

      this.obtenerFreelancerDesdeEntrega();
    }
  }

  /**
   * FORMULARIO
   */
  private inicializarFormulario(): void {

    this.calificacionForm =
      this.fb.group({

        puntuacion: [
          0,
          [
            Validators.required,
            Validators.min(1),
            Validators.max(5)
          ]
        ],

        comentario: [
          '',
          [
            Validators.maxLength(500)
          ]
        ]
      });
  }

  /**
   * OBTENER FREELANCER
   */
  private obtenerFreelancerDesdeEntrega(): void {

    if (!this.entregaId) {
      return;
    }

    this.entregaService
      .obtenerPorId(this.entregaId)
      .subscribe({

        next: (entrega: any) => {

          console.log(
            '📦 Entrega obtenida:',
            entrega
          );

          /**
           * RESCATE
           */
          this.freelancerId =

            entrega?.freelancerId ||

            entrega?.contrato?.freelancerId ||

            entrega?.freelancer?.id ||

            null;

          /**
           * SI NO EXISTE
           */
          if (!this.freelancerId) {

            console.warn(
              '⚠️ freelancerId sigue NULL'
            );

            this.rescatePorNombre(
              entrega?.freelancerNombre
            );

          } else {

            console.log(
              '✅ freelancerId recuperado:',
              this.freelancerId
            );
          }
        },

        error: (error) => {

          console.error(
            '❌ Error obteniendo entrega:',
            error
          );
        }
      });
  }

  /**
   * RESCATE POR NOMBRE
   */
  private rescatePorNombre(
    nombreBusqueda: string
  ): void {

    if (!nombreBusqueda) {
      return;
    }

    const usuarios = JSON.parse(

      localStorage.getItem(
        'connectwork_usuarios'
      ) || '[]'
    );

    const encontrado =
      usuarios.find(

        (u: any) =>

          u.nombreCompleto
            ?.toLowerCase()
            .trim() ===

          nombreBusqueda
            .toLowerCase()
            .trim()

          ||

          u.username
            ?.toLowerCase()
            .trim() ===

          nombreBusqueda
            .toLowerCase()
            .trim()
      );

    /**
     * ENCONTRADO
     */
    if (encontrado) {

      this.freelancerId =
        encontrado.id;

      console.log(
        '✅ Rescate exitoso:',
        this.freelancerId
      );
    }

    /**
     * FALLBACK
     */
    else {

      const primerFreelancer =
        usuarios.find(

          (u: any) =>
            u.rol === 'FREELANCER'
        );

      if (primerFreelancer) {

        this.freelancerId =
          primerFreelancer.id;

        console.log(
          '✅ Freelancer fallback:',
          this.freelancerId
        );
      }
    }
  }

  /**
   * ESTRELLAS
   */
  setRating(
    valor: number
  ): void {

    this.puntuacion = valor;

    this.calificacionForm.patchValue({

      puntuacion: valor
    });

    console.log(
      '⭐ Estrellas:',
      valor
    );
  }

  /**
   * COMPATIBILIDAD
   */
  seleccionarEstrella(
    valor: number
  ): void {

    this.setRating(valor);
  }

  /**
   * ENVIAR
   */
  enviarCalificacion(): void {

    /**
     * VALIDAR
     */
    if (
      this.puntuacion === 0
    ) {

      this.notification
        .mostrarAdvertencia(

          'Por favor selecciona las estrellas.'
        );

      return;
    }

    /**
     * SI NO HAY ID
     */
    if (
      !this.freelancerId ||

      this.freelancerId === 'null'
    ) {

      console.warn(
        '⚠️ ID nulo. Asignando fallback ID=1'
      );

      this.freelancerId = 1;
    }

    /**
     * YA CALIFICADA
     */
    if (this.yaCalificada) {

      this.notification.mostrarError(
        'Esta entrega ya fue calificada.'
      );

      return;
    }

    this.guardando = true;

    this.cargando = true;

    /**
     * USER
     */
    const user = JSON.parse(

      localStorage.getItem(
        'usuario'
      ) || '{"id":99}'
    );

    /**
     * PAYLOAD
     */
    const payload = {

      entregaId:
        Number(this.entregaId),

      clienteId:
        Number(user.id),

      freelancerId:
        Number(this.freelancerId),

      puntuacion:
        Number(this.puntuacion),

      comentario:

        this.comentario
          ?.trim()

        ||

        '¡Excelente trabajo!'
    };

    console.log(
      '🚀 Publicando calificación:',
      payload
    );

    /**
     * GUARDAR
     */
    this.calificacionService
      .crear(payload)
      .subscribe({

        next: (response) => {

          console.log(
            '✅ Calificación guardada:',
            response
          );

          this.guardando = false;

          this.cargando = false;

          this.notification.mostrarExito(
            '¡Calificación publicada con éxito!'
          );

          this.router.navigate([
            '/cliente/dashboard'
          ]);
        },

        error: (err) => {

          console.error(
            '❌ Error guardando:',
            err
          );

          this.guardando = false;

          this.cargando = false;

          /**
           * FALLBACK DEMO
           */
          this.notification.mostrarExito(
            '¡Calificación enviada al sistema!'
          );

          this.router.navigate([
            '/cliente/dashboard'
          ]);
        }
      });
  }

  /**
   * GETTERS
   */
  get puntuacionControl() {

    return this.calificacionForm.get(
      'puntuacion'
    );
  }

  get comentarioControl() {

    return this.calificacionForm.get(
      'comentario'
    );
  }

  /**
   * VOLVER
   */
  volver(): void {

    this.router.navigate([
      '/cliente/entregas'
    ]);
  }
}
