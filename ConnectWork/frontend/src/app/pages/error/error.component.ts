import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { trigger, transition, style, animate } from '@angular/animations';

@Component({
  selector: 'app-error-generico',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './error.component.html',
  styleUrls: ['./error.component.css'],
  animations: [
    trigger('fadeIn', [
      transition(':enter', [
        style({ opacity: 0, transform: 'scale(0.95)' }),
        animate('400ms ease-out', style({ opacity: 1, transform: 'scale(1)' }))
      ])
    ])
  ]
})
export class ErrorComponent implements OnInit {
  mensajeError: string = 'Ha ocurrido un error inesperado en el sistema.';
  codigoError: string = '500';
  currentTimestamp: number = Date.now();

  constructor(private route: ActivatedRoute) {}

  ngOnInit(): void {

    this.route.queryParams.subscribe(params => {
      if (params['mensaje']) this.mensajeError = params['mensaje'];
      if (params['codigo']) this.codigoError = params['codigo'];
    });
  }

  reintentar(): void {
    window.location.reload();
  }
}
