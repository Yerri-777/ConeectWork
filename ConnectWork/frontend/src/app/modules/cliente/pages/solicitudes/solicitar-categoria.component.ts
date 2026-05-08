import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { SolicitudService } from '../../../../core/services/solicitud.service';
import { NotificationService } from '../../../../core/services/notification.service';

@Component({
  selector: 'app-solicitar-categoria',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './solicitar-categoria.component.html',
  styleUrls: ['./solicitudes.component.css']
})
export class SolicitarCategoriaComponent implements OnInit {
  categoriaForm!: FormGroup;
  enviando = false;

  constructor(
    private fb: FormBuilder,
    private solicitudService: SolicitudService,
    private notification: NotificationService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.categoriaForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(3)]],
      descripcion: ['', [Validators.required, Validators.minLength(10)]]
    });
  }

  enviarSolicitud(): void {
    if (this.categoriaForm.invalid) return;

    this.enviando = true;
    const datos = this.categoriaForm.value;

    this.solicitudService.crearSolicitudCategoria(datos).subscribe({
      next: () => {
        this.notification.mostrarExito('Sugerencia enviada correctamente. ¡Gracias!');
        this.router.navigate(['/cliente/dashboard']);
      },
      error: (err: any) => {
        this.enviando = false;
        this.notification.mostrarError('No se pudo enviar la solicitud. Intenta más tarde.');
      }
    });
  }

  isFieldInvalid(field: string): boolean {
    const control = this.categoriaForm.get(field);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  cancelar(): void {
    this.router.navigate(['/cliente/dashboard']);
  }
}
