import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { NotificationService } from '../services/notification.service';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
  constructor(private notificationService: NotificationService) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(req).pipe(
      catchError((error: HttpErrorResponse) => {
        // Compilar mensaje de error
        let errorMessage = 'Ocurrió un error desconocido';

        if (error.error instanceof ErrorEvent) {
          // Error del lado del cliente
          errorMessage = `Error: ${error.error.message}`;
        } else {
          // Error del lado del servidor
          if (error.error && error.error.mensaje) {
            errorMessage = error.error.mensaje;
          } else if (error.statusText) {
            errorMessage = error.statusText;
          }

          // Mensajes específicos por código
          switch (error.status) {
            case 400:
              errorMessage = error.error?.mensaje || 'Solicitud inválida';
              break;
            case 401:
              errorMessage = 'No autorizado. Por favor inicia sesión.';
              break;
            case 403:
              errorMessage = 'Acceso denegado.';
              break;
            case 404:
              errorMessage = 'Recurso no encontrado.';
              break;
            case 409:
              errorMessage = error.error?.mensaje || 'El recurso ya existe.';
              break;
            case 500:
              errorMessage = 'Error interno del servidor.';
              break;
            case 503:
              errorMessage = 'Servicio no disponible.';
              break;
          }
        }

        // Mostrar notificación
        this.notificationService.mostrarError(errorMessage);

        return throwError(() => error);
      })
    );
  }
}
