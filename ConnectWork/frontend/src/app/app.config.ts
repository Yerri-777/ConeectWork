import { ApplicationConfig } from '@angular/core';
import { provideRouter, withPreloading, PreloadAllModules } from '@angular/router';
import { provideHttpClient, HTTP_INTERCEPTORS } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';
import { routes } from './app.routes';
import { AuthInterceptor } from './core/interceptores/auth.interceptor';
import { ErrorInterceptor } from './core/interceptores/error.interceptor';
import { LoaderInterceptor } from './core/interceptores/loader.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [

   provideRouter(routes),


    provideHttpClient(),

    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: LoaderInterceptor, multi: true },

    provideAnimations()
  ]
};
