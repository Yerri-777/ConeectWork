import {
  Component,
  OnInit,
  ChangeDetectionStrategy
} from '@angular/core';

import { CommonModule } from '@angular/common';

import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators
} from '@angular/forms';

import {
  ActivatedRoute,
  Router,
  RouterModule
} from '@angular/router';

import { NotificationService } from '../../../../core/services/notification.service';

@Component({
  selector: 'app-editar-proyecto',

  standalone: true,

  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule
  ],

  templateUrl: './editar-proyecto.component.html',

  styleUrls: ['./proyectos.component.css'],

  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EditarProyectoComponent implements OnInit {

  proyectoForm!: FormGroup;

  proyectoId = '';

  cargando = true;

  guardando = false;

  categorias: string[] = [
    'Desarrollo Web',
    'Diseño Gráfico',
    'Desarrollo Mobile',
    'Marketing Digital',
    'Base de Datos',
    'Redacción',
    'UI/UX',
    'SEO'
  ];

  habilidadesDisponibles: string[] = [
    'Angular',
    'React',
    'Spring Boot',
    'Node.js',
    'Flutter',
    'MySQL',
    'Figma',
    'Photoshop',
    'SEO',
    'Copywriting'
  ];

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {

    this.inicializarFormulario();

    const id = this.route.snapshot.paramMap.get('id');

    if (!id) {

      this.router.navigate([
        '/cliente/proyectos'
      ]);

      return;
    }

    this.proyectoId = id;

    this.cargarProyecto();
  }

  private inicializarFormulario(): void {

    this.proyectoForm = this.fb.group({

      titulo: [
        '',
        [
          Validators.required,
          Validators.minLength(5)
        ]
      ],

      descripcion: [
        '',
        [
          Validators.required,
          Validators.minLength(50)
        ]
      ],

      presupuestoMin: [
        100,
        [
          Validators.required,
          Validators.min(1)
        ]
      ],

      presupuestoMax: [
        500,
        [
          Validators.required,
          Validators.min(1)
        ]
      ],

      categoria: [
        '',
        Validators.required
      ],

      habilidades: [
        []
      ],

      plazoDias: [
        7,
        [
          Validators.required,
          Validators.min(1)
        ]
      ]
    });
  }

  private cargarProyecto(): void {

    const proyectos = localStorage.getItem(
      'connectwork_proyectos'
    );

    const lista = proyectos
      ? JSON.parse(proyectos)
      : [];

    const proyecto = lista.find(
      (p: any) => String(p.id) === this.proyectoId
    );

    if (!proyecto) {

      this.notificationService.mostrarError(
        'Proyecto no encontrado'
      );

      this.router.navigate([
        '/cliente/proyectos'
      ]);

      return;
    }

    this.proyectoForm.patchValue({

      titulo: proyecto.titulo,

      descripcion: proyecto.descripcion,

      presupuestoMin: proyecto.presupuestoMin,

      presupuestoMax: proyecto.presupuestoMax,

      categoria: proyecto.categoria,

      habilidades: proyecto.habilidades || [],

      plazoDias: proyecto.plazoDias
    });

    this.cargando = false;
  }

  toggleHabilidad(
    habilidad: string
  ): void {

    const control =
      this.proyectoForm.get('habilidades');

    const habilidades: string[] =
      control?.value || [];

    const existe =
      habilidades.includes(habilidad);

    if (existe) {

      control?.setValue(
        habilidades.filter(
          h => h !== habilidad
        )
      );

    } else {

      control?.setValue([
        ...habilidades,
        habilidad
      ]);
    }
  }

  tieneHabilidad(
    habilidad: string
  ): boolean {

    const habilidades: string[] =
      this.proyectoForm.get(
        'habilidades'
      )?.value || [];

    return habilidades.includes(
      habilidad
    );
  }

  onSubmit(): void {

    if (this.proyectoForm.invalid) {

      this.proyectoForm.markAllAsTouched();

      return;
    }

    this.guardando = true;

    const proyectos = localStorage.getItem(
      'connectwork_proyectos'
    );

    const lista = proyectos
      ? JSON.parse(proyectos)
      : [];

    const index = lista.findIndex(
      (p: any) => String(p.id) === this.proyectoId
    );

    if (index === -1) {

      this.notificationService.mostrarError(
        'Proyecto no encontrado'
      );

      this.guardando = false;

      return;
    }

    lista[index] = {

      ...lista[index],

      ...this.proyectoForm.getRawValue(),

      presupuesto:
        Number(
          this.proyectoForm.value.presupuestoMax
        ),

      fechaActualizacion:
        new Date()
    };

    localStorage.setItem(
      'connectwork_proyectos',
      JSON.stringify(lista)
    );

    this.notificationService.mostrarExito(
      'Proyecto actualizado correctamente'
    );

    this.guardando = false;

    this.router.navigate([
      '/cliente/proyectos'
    ]);
  }

  campoInvalido(
    campo: string
  ): boolean {

    const control =
      this.proyectoForm.get(campo);

    return !!(
      control &&
      control.invalid &&
      (
        control.touched ||
        control.dirty
      )
    );
  }

cancelar(): void {

  this.router.navigate([
    '/cliente/proyectos'
  ]);
}


  obtenerError(
    campo: string
  ): string {

    const control =
      this.proyectoForm.get(campo);

    if (!control?.errors) {
      return '';
    }

    if (control.errors['required']) {
      return 'Campo obligatorio';
    }

    if (control.errors['minlength']) {

      return `Mínimo ${control.errors['minlength'].requiredLength} caracteres`;
    }

    if (control.errors['maxlength']) {

      return `Máximo ${control.errors['maxlength'].requiredLength} caracteres`;
    }

    return 'Campo inválido';
  }
}
