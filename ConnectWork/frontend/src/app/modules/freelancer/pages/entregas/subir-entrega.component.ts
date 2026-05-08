import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { EntregaService } from '../../../../core/services/entrega.service';
import { NotificationService } from '../../../../core/services/notification.service';

@Component({
  selector: 'app-subir-entrega',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './subir-entrega.component.html',
  styleUrls: ['./entregas.component.css']
})
export class SubirEntregaComponent implements OnInit {
  entregaForm!: FormGroup; 
  cargando = false; 
  archivos: File[] = []; 
  contratoId: string | null = null; 

  constructor(
    private fb: FormBuilder, 
    private entregaService: EntregaService,
    private route: ActivatedRoute, 
    private router: Router, 
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.inicializarFormulario(); 
    this.route.params.subscribe(params => {
      this.contratoId = params['id'];
    });
  }

  private inicializarFormulario(): void {
    this.entregaForm = this.fb.group({
      descripcion: ['', Validators.required] 
    });
  }

  onFileSelected(event: any): void {
    const archivosNuevos = Array.from(event.target.files) as File[]; 
    this.archivos.push(...archivosNuevos);
  }

  eliminarArchivo(archivo: File): void {
    this.archivos = this.archivos.filter(a => a !== archivo); 
  }

  subirEntrega(): void {
    if (this.entregaForm.invalid || this.archivos.length === 0 || !this.contratoId) {
      return; 
    }

    this.cargando = true;
    const formData = new FormData(); 
    formData.append('descripcion', this.entregaForm.get('descripcion')?.value);
    formData.append('contratoId', this.contratoId); 

    this.archivos.forEach((archivo, index) => {
      formData.append(`archivos[${index}]`, archivo); 
    });

    this.entregaService.subir(formData).subscribe({ 
      next: () => {
        this.notificationService.mostrarExito('Entrega subida correctamente');
        this.router.navigate(['/freelancer/entregas']); 
      },
      error: () => {
        this.cargando = false; 
        this.notificationService.mostrarError('Error al subir entrega');
      }
    });
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.entregaForm.get(fieldName); 
    return !!(field && field.invalid && (field.dirty || field.touched)); 
  }
}
