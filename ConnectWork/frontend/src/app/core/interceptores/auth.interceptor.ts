import {
  Injectable
} from '@angular/core';

import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpErrorResponse
} from '@angular/common/http';

import {
  Observable,
  throwError
} from 'rxjs';

import {
  catchError
} from 'rxjs/operators';

import {
  Router
} from '@angular/router';

import {
  NotificationService
} from '../services/notification.service';

@Injectable()
export class AuthInterceptor
implements HttpInterceptor {

  private isRedirecting = false;

  constructor(

    private router: Router,

    private notificationService:
      NotificationService

  ) {}

  intercept(
    req: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {

    console.log(
      '======================================'
    );

    console.log(
      '[AuthInterceptor] REQUEST:',
      req.method,
      req.url
    );


    const publicRoutes = [

      '/api/auth/login',

      '/api/auth/registro'
    ];

    const isPublic =
      publicRoutes.some(route =>
        req.url.includes(route)
      );

    let authReq = req;


    if (!isPublic) {

      const token =
        localStorage.getItem(
          'connectwork_token'
        );

      console.log(
        '[AuthInterceptor] TOKEN:',
        token
      );

      if (
        token &&
        token !== 'null' &&
        token.trim() !== ''
      ) {

        authReq = req.clone({

          setHeaders: {

            Authorization:
              `Bearer ${token}`
          }
        });

        console.log(
          '[AuthInterceptor] ✓ JWT agregado'
        );

      } else {

        console.warn(
          '[AuthInterceptor] ✗ Sin token'
        );
      }
    }


    return next.handle(authReq).pipe(

      catchError(
        (error: HttpErrorResponse) => {

          console.error(
            '======================================'
          );

          console.error(
            '[AuthInterceptor] ERROR HTTP'
          );

          console.error(
            'STATUS:',
            error.status
          );

          console.error(
            'URL:',
            error.url
          );

          console.error(
            'MESSAGE:',
            error.message
          );

          console.error(
            'BODY:',
            error.error
          );

          console.error(
            '======================================'
          );



          if (
            error.status === 401 &&
            !isPublic
          ) {

            this.handle401();
          }



          else if (error.status === 403) {

            this.notificationService
              .mostrarError(
                'Acceso denegado'
              );
          }



          else if (error.status >= 500) {

            this.notificationService
              .mostrarError(
                'Error interno servidor'
              );
          }

          return throwError(
            () => error
          );
        }
      )
    );
  }



  private handle401(): void {

    if (this.isRedirecting) {
      return;
    }

    this.isRedirecting = true;

    console.warn(
      '[AuthInterceptor] Sesión expirada'
    );

    localStorage.removeItem(
      'connectwork_token'
    );

    localStorage.removeItem(
      'connectwork_user'
    );

    localStorage.removeItem(
      'connectwork_rol'
    );

    this.notificationService
      .mostrarError(
        'Sesión expirada'
      );

    this.router.navigate([
      '/auth/login'
    ]).finally(() => {

      this.isRedirecting = false;
    });
  }
}
