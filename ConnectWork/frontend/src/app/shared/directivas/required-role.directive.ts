import { Directive, Input, OnInit, TemplateRef, ViewContainerRef } from '@angular/core';
import { AuthService } from '../../core/services/auth.service';

/**
 * Directiva: Muestra/oculta elementos según rol del usuario
 * Uso: <button *appRequiredRole="'ADMIN'">Solo Admin</button>
 *      <div *appRequiredRole="['CLIENTE', 'FREELANCER']">Cliente o Freelancer</div>
 */
@Directive({
  selector: '[appRequiredRole]',
  standalone: true
})
export class RequiredRoleDirective implements OnInit {
  private rolesRequeridos: string[] = [];
  private hasView = false;

  constructor(
    private templateRef: TemplateRef<any>,
    private viewContainer: ViewContainerRef,
    private authService: AuthService
  ) {}

  @Input()
  set appRequiredRole(roles: string | string[]) {
    this.rolesRequeridos = Array.isArray(roles) ? roles : [roles];
    this.updateView();
  }

  ngOnInit(): void {
    this.authService.currentUser$.subscribe(() => {
      this.updateView();
    });
  }

  private updateView(): void {
    const usuario = this.authService.getCurrentUser();
    const tieneRol = usuario && this.rolesRequeridos.includes(usuario.rol);

    if (tieneRol) {
      if (!this.hasView) {
        this.viewContainer.createEmbeddedView(this.templateRef);
        this.hasView = true;
      }
    } else {
      this.viewContainer.clear();
      this.hasView = false;
    }
  }
}
