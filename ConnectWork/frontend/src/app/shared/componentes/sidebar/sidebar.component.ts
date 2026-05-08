import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { Usuario } from '../../../core/models/usuario.model';

interface MenuItem {
  label: string;
  route: string;
  icon: string;
  children?: MenuItem[];
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent implements OnInit {
  sidebarColapsado = false;
  usuarioActual: Usuario | null = null;
  submenuAbiertos: Set<string> = new Set();
  menuItems: MenuItem[] = [];

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.authService.currentUser$.subscribe((usuario: Usuario | null) => {
      this.usuarioActual = usuario;
      if (usuario) {
        this.cargarMenuSegunRol(usuario.rol);
      }
    });
  }

  /**
   * Obtener inicial segura para el avatar del usuario.
   * Retorna la primera letra de `nombreCompleto` (mayúscula),
   * o la primera letra de `username`, o 'U' si no hay datos.
   */
  getAvatarInitial(): string {
    const user = this.usuarioActual;
    if (!user) return 'U';
    const name = (user.nombreCompleto && user.nombreCompleto.trim()) || (user.username && String(user.username).trim()) || '';
    if (!name) return 'U';
    return name.charAt(0).toUpperCase();
  }

  private cargarMenuSegunRol(rol: string): void {
    switch (rol) {
      case 'ADMIN':
        this.menuItems = [
          { label: 'Dashboard', route: '/admin/dashboard', icon: '📊' },
          { label: 'Usuarios', route: '/admin/usuarios', icon: '👥' },
          { label: 'Categorías', route: '/admin/categorias', icon: '🏷️' },
          { label: 'Habilidades', route: '/admin/habilidades', icon: '⚙️' },
          { label: 'Solicitudes', route: '/admin/solicitudes', icon: '📮', children: [
            { label: 'Habilidades', route: '/admin/solicitudes/habilidades', icon: '⚙️' },
            { label: 'Categorías', route: '/admin/solicitudes/categorias', icon: '🏷️' }
          ]},
          { label: 'Comisión', route: '/admin/comision', icon: '💰' },
          { label: 'Saldo Plataforma', route: '/admin/saldo', icon: '💵' },
          { label: 'Reportes', route: '/admin/reportes', icon: '📈' }
        ];
        break;

      case 'CLIENTE':
        this.menuItems = [
          { label: 'Dashboard', route: '/cliente/dashboard', icon: '📊' },
          { label: 'Mis Proyectos', route: '/cliente/proyectos', icon: '📁', children: [
            { label: 'Crear Proyecto', route: '/cliente/proyectos/crear', icon: '✨' },
            { label: 'Mis Proyectos', route: '/cliente/proyectos/lista', icon: '📋' }
          ]},
          { label: 'Propuestas', route: '/cliente/propuestas', icon: '💬' },
          { label: 'Contratos', route: '/cliente/contratos', icon: '📜' },
          { label: 'Entregas', route: '/cliente/entregas', icon: '📦' },
          { label: 'Saldo', route: '/cliente/saldo', icon: '💰' },
          { label: 'Reportes', route: '/cliente/reportes', icon: '📈' }
        ];
        break;

      case 'FREELANCER':
        this.menuItems = [
          { label: 'Dashboard', route: '/freelancer/dashboard', icon: '📊' },
          { label: 'Explorar', route: '/freelancer/explorar', icon: '🔍' },
          { label: 'Propuestas', route: '/freelancer/propuestas', icon: '💬', children: [
            { label: 'Mis Propuestas', route: '/freelancer/propuestas/mias', icon: '📋' },
            { label: 'Enviar Propuesta', route: '/freelancer/propuestas/nueva', icon: '✨' }
          ]},
          { label: 'Contratos', route: '/freelancer/contratos', icon: '📜' },
          { label: 'Entregas', route: '/freelancer/entregas', icon: '📦' },
          { label: 'Saldo', route: '/freelancer/saldo', icon: '💰' },
          { label: 'Reportes', route: '/freelancer/reportes', icon: '📈' }
        ];
        break;
    }
  }

  toggleSidebar(): void {
    this.sidebarColapsado = !this.sidebarColapsado;
  }

  toggleSubmenu(label: string): void {
    if (this.submenuAbiertos.has(label)) {
      this.submenuAbiertos.delete(label);
    } else {
      this.submenuAbiertos.add(label);
    }
  }

  isSubmenuOpen(label: string): boolean {
    return this.submenuAbiertos.has(label);
  }
}
