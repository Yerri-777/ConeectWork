
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Observable } from 'rxjs';
import { LoaderService } from '../../../core/services/loader.service';
import { trigger, transition, style, animate } from '@angular/animations';


@Component({
  selector: 'app-loader',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './loader.component.html',
  styleUrls: ['./loader.component.css'],
  animations: [
    trigger('fadeInOut', [
      // Animación de entrada (aparición del spinner)
      transition(':enter', [
        style({ opacity: 0 }),
        animate('300ms ease-in', style({ opacity: 1 }))
      ]),
      // Animación de salida (desaparición del spinner)
      transition(':leave', [
        animate('300ms ease-out', style({ opacity: 0 }))
      ])
    ])
  ]
})
export class LoaderComponent implements OnInit {


  isLoading$: Observable<boolean>;

  /**
   * Constructor con inyección de LoaderService
   *
   * DEPENDENCIA:
   * @param loaderService - Servicio que maneja el estado de carga
   */
  constructor(private loaderService: LoaderService) {

    this.isLoading$ = this.loaderService.cargandoObs;
  }


  ngOnInit(): void {

  }
}
