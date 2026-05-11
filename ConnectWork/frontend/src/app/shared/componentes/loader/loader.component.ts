
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

      transition(':enter', [
        style({ opacity: 0 }),
        animate('300ms ease-in', style({ opacity: 1 }))
      ]),

      transition(':leave', [
        animate('300ms ease-out', style({ opacity: 0 }))
      ])
    ])
  ]
})
export class LoaderComponent implements OnInit {


  isLoading$: Observable<boolean>;

  /**
   *
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
