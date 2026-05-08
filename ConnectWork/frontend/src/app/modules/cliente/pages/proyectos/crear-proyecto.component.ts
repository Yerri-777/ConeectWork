import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { ProyectoService } from '../../../../core/services/proyecto.service';

@Component({
  selector: 'app-crear-proyecto',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './crear-proyecto.component.html',
  styleUrls: ['./proyectos.component.css']
})
export class CrearProyectoComponent {
  proyectoForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private proyectoService: ProyectoService,
    private router: Router
  ) {
    this.proyectoForm = this.fb.group({
      titulo: ['', Validators.required],
      descripcion: ['', [Validators.required, Validators.minLength(50)]],
      presupuesto: [0, [Validators.required, Validators.min(10)]],
      categoria: ['', Validators.required]
    });
  }

  onSubmit() {
    if (this.proyectoForm.valid) {
      this.proyectoService.crear(this.proyectoForm.value).subscribe(() => {
        this.router.navigate(['/cliente/proyectos']);
      });
    }
  }
}
