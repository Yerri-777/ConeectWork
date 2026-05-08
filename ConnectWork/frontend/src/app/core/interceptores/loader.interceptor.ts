import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http';
import { Observable } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { LoaderService } from '../services/loader.service';

@Injectable()
export class LoaderInterceptor implements HttpInterceptor {
  // Contador de requests en curso que deben mostrar el loader.
  private requestCounter = 0;

  constructor(private loaderService: LoaderService) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // No mostrar loader para endpoints que devuelvan archivos grandes o reportes
    const skipLoader = typeof req.url === 'string' && req.url.includes('/reportes');

    if (!skipLoader) {
      this.requestCounter = Math.max(0, this.requestCounter) + 1;
      try {
        this.loaderService.show();
      } catch (e) {
        // Protegemos contra fallos en el servicio de loader para no romper la cadena de requests
        console.error('LoaderInterceptor: error al mostrar loader', e);
      }
    }

    return next.handle(req).pipe(
      finalize(() => {
        if (!skipLoader) {
          this.requestCounter = Math.max(0, this.requestCounter - 1);
          if (this.requestCounter === 0) {
            try {
              this.loaderService.hide();
            } catch (e) {
              console.error('LoaderInterceptor: error al ocultar loader', e);
            }
          }
        }
      })
    );
  }
}

