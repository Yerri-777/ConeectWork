import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { SolicitudService } from '../../../../core/services/solicitud.service';
import { NotificationService } from '../../../../core/services/notification.service';

@Component({
  selector: 'app-solicitar-habilidad',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './solicitar-habilidad.component.html',
  styleUrls: ['./solicitudes.component.css']
})
export class SolicitarHabilidadComponent implements OnInit {
  solicitudForm!: FormGroup;
  enviando = false;
  misSolicitudes: any[] = [];

  constructor(
    private fb: FormBuilder,
    private solicitudService: SolicitudService,
    private router: Router,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.inicializarFormulario();
    this.cargarMisSolicitudes();
  }

  private inicializarFormulario(): void {
    this.solicitudForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.maxLength(100)]],
      descripcion: ['', Validators.required]
    });
  }

  private cargarMisSolicitudes(): void {
    this.solicitudService.misSolicitudesHabilidad().subscribe({
      next: (solicitudes: any[]) => {
        this.misSolicitudes = solicitudes;
      }
    });
  }

  enviarSolicitud(): void {
    if (this.solicitudForm.invalid) return;

    this.enviando = true;
    this.solicitudService.solicitarHabilidad(this.solicitudForm.value).subscribe({
      next: () => {
        this.enviando = false;
        this.notificationService.mostrarExito('Solicitud enviada correctamente');
        this.solicitudForm.reset();
        this.cargarMisSolicitudes();
      },
      error: (error: any) => {
        this.enviando = false;
        this.notificationService.mostrarError('Error al enviar la solicitud');
      }
    });
  }

  cancelar(): void {
    this.router.navigate(['/freelancer/dashboard']);
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.solicitudForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }
}
