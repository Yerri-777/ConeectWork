import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Router } from '@angular/router';
import { NotificationService } from '../services/notification.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(
    private router: Router,
    private notificationService: NotificationService
  ) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // No agregar token a rutas de autenticación
    const publicRoutes = ['/api/auth/login', '/api/auth/registro'];
    const isPublic = publicRoutes.some(route => req.url.includes(route));

    if (!isPublic) {
      const token = localStorage.getItem('connectwork_token');
      if (token) {
        req = req.clone({
          setHeaders: {
            Authorization: `Bearer ${token}`
          }
        });
      }
    }

    return next.handle(req).pipe(
      catchError((error: HttpErrorResponse) => {
        // Manejar errores de autenticación
        if (error.status === 401) {
          // Token expirado o inválido
          localStorage.removeItem('connectwork_token');
          localStorage.removeItem('connectwork_user');
          this.notificationService.mostrarError('Sesión expirada. Por favor inicia sesión nuevamente.');
          this.router.navigate(['/auth/login']);
        }

        // Manejar errores de autorización
        if (error.status === 403) {
          this.notificationService.mostrarError('No tienes permiso para acceder a este recurso.');
          this.router.navigate(['/forbidden']);
        }

        // Manejar otros errores
        if (error.status === 404) {
          this.notificationService.mostrarError('Recurso no encontrado.');
        }

        if (error.status >= 500) {
          this.notificationService.mostrarError('Error interno del servidor. Por favor intenta más tarde.');
        }

        return throwError(() => error);
      })
    );
  }
}
