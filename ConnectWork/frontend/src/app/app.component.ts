import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs';
import { AuthService } from './core/services/auth.service';
import { NavbarComponent } from './shared/componentes/navbar/navbar.component';
import { SidebarComponent } from './shared/componentes/sidebar/sidebar.component';
import { LoaderComponent } from './shared/componentes/loader/loader.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, NavbarComponent, SidebarComponent, LoaderComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit, OnDestroy {
  isPublicRoute: boolean = false;
  private timeoutId: any;

  constructor(
    private router: Router,
    public authService: AuthService
  ) {
    // Detectar si la ruta actual es pública para ajustar el layout
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      const publicRoutes = ['/', '/auth/login', '/auth/registro', '/404', '/403', '/error'];
      this.isPublicRoute = publicRoutes.includes(event.urlAfterRedirects);
    });
  }

  ngOnInit(): void {
    this.authService.restoreSession();
    this.setupAutoLogout();
  }

  private setupAutoLogout(): void {
    // Escuchar eventos de usuario para resetear el timer de inactividad
    ['mousedown', 'mousemove', 'keypress', 'touchstart'].forEach(event => {
      window.addEventListener(event, () => this.resetTimer());
    });
  }

  private resetTimer(): void {
    clearTimeout(this.timeoutId);
    // Logout automático tras 30 minutos de inactividad
    this.timeoutId = setTimeout(() => {
      if (this.authService.isLoggedIn()) {
        this.authService.logout();
      }
    }, 1800000);
  }

  ngOnDestroy(): void {
    clearTimeout(this.timeoutId);
  }
}
