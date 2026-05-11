import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef
} from '@angular/core';

import { CommonModule } from '@angular/common';

import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators
} from '@angular/forms';

import {
  Router,
  RouterModule
} from '@angular/router';

import { NotificationService } from '../../../../core/services/notification.service';

@Component({
  selector: 'app-crear-proyecto',

  standalone: true,

  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule
  ],

  templateUrl: './crear-proyecto.component.html',

  styleUrls: ['./proyectos.component.css'],

  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CrearProyectoComponent implements OnInit {

  proyectoForm!: FormGroup;

  cargando = false;

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

  proyectosLocales: any[] = [];

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private notificationService: NotificationService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.inicializarFormulario();
    this.cargarProyectosLocales();
  }


  private inicializarFormulario(): void {

    this.proyectoForm = this.fb.group({

      titulo: [
        '',
        [Validators.required, Validators.minLength(5), Validators.maxLength(150)]
      ],

      descripcion: [
        '',
        [Validators.required, Validators.minLength(50), Validators.maxLength(1500)]
      ],

      presupuestoMin: [
        100,
        [Validators.required, Validators.min(1)]
      ],

      presupuestoMax: [
        500,
        [Validators.required, Validators.min(1)]
      ],

      categoria: ['', Validators.required],

      habilidades: [[]],

      plazoDias: [
        7,
        [Validators.required, Validators.min(1), Validators.max(365)]
      ]
    });
  }



  private cargarProyectosLocales(): void {

    try {

      const data = localStorage.getItem('connectwork_proyectos');

      this.proyectosLocales = data ? JSON.parse(data) : [];

    } catch (error) {

      console.error('Error cargando proyectos:', error);

      this.proyectosLocales = [];
    }
  }

  private guardarProyectoLocal(proyecto: any): void {

    try {

      const data = localStorage.getItem('connectwork_proyectos');

      const proyectos = data ? JSON.parse(data) : [];

      proyectos.unshift(proyecto);

      localStorage.setItem(
        'connectwork_proyectos',
        JSON.stringify(proyectos)
      );

      this.proyectosLocales = proyectos;

    } catch (error) {

      console.error('Error guardando proyecto:', error);

      this.notificationService.mostrarError(
        'Error al guardar proyecto'
      );
    }
  }


  toggleHabilidad(habilidad: string): void {

    const control = this.proyectoForm.get('habilidades');

    const actuales: string[] = control?.value || [];

    const existe = actuales.includes(habilidad);

    const nuevas = existe
      ? actuales.filter(h => h !== habilidad)
      : [...actuales, habilidad];

    control?.setValue(nuevas);
    control?.markAsTouched();
    control?.updateValueAndValidity();
  }

  tieneHabilidad(habilidad: string): boolean {

    const habilidades =
      this.proyectoForm.get('habilidades')?.value || [];

    return habilidades.includes(habilidad);
  }

  onSubmit(): void {

    if (this.cargando) return;

    if (this.proyectoForm.invalid) {

      this.proyectoForm.markAllAsTouched();

      this.notificationService.mostrarAdvertencia(
        'Completa todos los campos requeridos'
      );

      return;
    }

    const form = this.proyectoForm.getRawValue();

    if (!form.habilidades || form.habilidades.length === 0) {

      this.notificationService.mostrarError(
        'Selecciona al menos una habilidad'
      );

      return;
    }

    const min = Number(form.presupuestoMin);
    const max = Number(form.presupuestoMax);

    if (min > max) {

      this.notificationService.mostrarError(
        'El presupuesto mínimo no puede ser mayor al máximo'
      );

      return;
    }

    this.cargando = true;

    const now = new Date();
    const limit = new Date();

    limit.setDate(now.getDate() + Number(form.plazoDias));


    const nuevoProyecto = {

      id: Date.now(),

      titulo: form.titulo.trim(),
      descripcion: form.descripcion.trim(),

      categoria: {
        nombre: form.categoria
      },

      habilidades: form.habilidades,

      presupuestoMin: min,
      presupuestoMax: max,

      presupuesto: max,

      plazoDias: Number(form.plazoDias),

      estado: 'ABIERTO',

      cliente: {
        nombreCompleto: 'Cliente Demo',
        calificacion: 5.0
      },

      clienteNombre: 'Cliente Demo',

      totalPropuestas: 0,
      propuestas: [],

      propuestasCount: 0,

      activo: true,

      fechaCreacion: now,
      fechaPublicacion: now,
      fechaLimite: limit
    };

    this.guardarProyectoLocal(nuevoProyecto);

    setTimeout(() => {

      this.cargando = false;

      this.notificationService.mostrarExito(
        'Proyecto publicado correctamente'
      );

      this.proyectoForm.reset({
        titulo: '',
        descripcion: '',
        presupuestoMin: 100,
        presupuestoMax: 500,
        categoria: '',
        habilidades: [],
        plazoDias: 7
      });

      this.cdr.markForCheck();

      this.router.navigate(['/cliente/proyectos']);

    }, 500);
  }



  campoInvalido(campo: string): boolean {

    const control = this.proyectoForm.get(campo);

    return !!(
      control &&
      control.invalid &&
      (control.touched || control.dirty)
    );
  }

  obtenerError(campo: string): string {

    const control = this.proyectoForm.get(campo);

    if (!control?.errors) return '';

    if (control.errors['required']) return 'Campo obligatorio';

    if (control.errors['minlength'])
      return `Mínimo ${control.errors['minlength'].requiredLength} caracteres`;

    if (control.errors['maxlength'])
      return `Máximo ${control.errors['maxlength'].requiredLength} caracteres`;

    if (control.errors['min'])
      return 'Valor inválido';

    return 'Campo inválido';
  }
}
