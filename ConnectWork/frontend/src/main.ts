import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';

bootstrapApplication(AppComponent, appConfig)
  .catch((err) => {
    console.error(' Error al iniciar la aplicación:', err);

    const appRoot = document.querySelector('app-root');
    if (appRoot) {
      appRoot.innerHTML = `
        <div style="padding: 40px; font-family: Arial, sans-serif; text-align: center;">
          <h1>Error al iniciar la aplicación</h1>
          <p>${err.message || 'Error desconocido'}</p>
        </div>
      `;
    }
  });
