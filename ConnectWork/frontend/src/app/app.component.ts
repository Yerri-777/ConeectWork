import {
  Component,
  OnInit,
  OnDestroy
} from '@angular/core';

import {
  CommonModule
} from '@angular/common';

import {
  RouterOutlet,
  Router,
  NavigationEnd
} from '@angular/router';

import {
  filter,
  Subject,
  takeUntil
} from 'rxjs';

import {
  AuthService
} from './core/services/auth.service';

import {
  NavbarComponent
} from './shared/componentes/navbar/navbar.component';

import {
  SidebarComponent
} from './shared/componentes/sidebar/sidebar.component';

import {
  LoaderComponent
} from './shared/componentes/loader/loader.component';

@Component({
  selector: 'app-root',

  standalone: true,

  imports: [
    CommonModule,
    RouterOutlet,
    NavbarComponent,
    SidebarComponent,
    LoaderComponent
  ],

  templateUrl: './app.component.html',

  styleUrls: ['./app.component.css']
})
export class AppComponent
implements OnInit, OnDestroy {

  isPublicRoute = false;

  private timeoutId: any;

  private destroy$ =
    new Subject<void>();

  private readonly INACTIVITY_TIME =
    1000 * 60 * 30; // 30 min

  constructor(

    private router: Router,

    public authService:
      AuthService

  ) {


    this.router.events.pipe(

      filter(
        event =>
          event instanceof NavigationEnd
      ),

      takeUntil(this.destroy$)

    ).subscribe((event: any) => {

      const publicRoutes = [

        '/',

        '/auth/login',

        '/auth/registro',

        '/404',

        '/403',

        '/error'
      ];

      this.isPublicRoute =
        publicRoutes.includes(
          event.urlAfterRedirects
        );

      console.log(
        '[AppComponent] Ruta:',
        event.urlAfterRedirects
      );

      console.log(
        '[AppComponent] Pública:',
        this.isPublicRoute
      );
    });
  }

  // =====================================================
  // INIT
  // =====================================================

  ngOnInit(): void {

    console.log(
      '[AppComponent] Inicializando app...'
    );

    /**
     * RESTAURAR SESIÓN
     */
    this.authService.restoreSession();

    /**
     * ESPERAR ESTABILIZACIÓN JWT
     */
    setTimeout(() => {

      this.setupAutoLogout();

      this.resetTimer();

      console.log(
        '[AppComponent] ✓ App estable'
      );

    }, 300);
  }

  // =====================================================
  // AUTO LOGOUT
  // =====================================================

  private setupAutoLogout(): void {

    const events = [

      'mousedown',

      'mousemove',

      'keypress',

      'scroll',

      'touchstart',

      'click'
    ];

    events.forEach(event => {

      window.addEventListener(
        event,
        this.resetTimer.bind(this)
      );
    });

    console.log(
      '[AppComponent] ✓ AutoLogout activado'
    );
  }

  // =====================================================
  // RESET TIMER
  // =====================================================

  private resetTimer(): void {

    clearTimeout(this.timeoutId);

    this.timeoutId = setTimeout(() => {

      console.warn(
        '[AppComponent] Sesión expirada por inactividad'
      );

      if (this.authService.isLoggedIn()) {

        this.authService.logout();

        this.router.navigate([
          '/auth/login'
        ]);
      }

    }, this.INACTIVITY_TIME);
  }

  // =====================================================
  // DESTROY
  // =====================================================

  ngOnDestroy(): void {

    clearTimeout(this.timeoutId);

    this.destroy$.next();

    this.destroy$.complete();

    console.log(
      '[AppComponent] Destroy'
    );
  }
}
