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
          { label: 'Dashboard', route: '/admin/dashboard', icon: 'D' },
          { label: 'Usuarios', route: '/admin/usuarios', icon: 'U' },
          { label: 'Categorias', route: '/admin/categorias', icon: 'C' },
          { label: 'Habilidades', route: '/admin/habilidades', icon: 'H' },
          { label: 'Solicitudes', route: '/admin/solicitudes', icon: 'S', children: [
            { label: 'Habilidades', route: '/admin/solicitudes/habilidades', icon: '' },
            { label: 'Categorias', route: '/admin/solicitudes/categorias', icon: '' }
          ]},
          { label: 'Comision', route: '/admin/comision', icon: 'C' },
          { label: 'Saldo Plataforma', route: '/admin/saldo', icon: 'S' },
          { label: 'Reportes', route: '/admin/reportes', icon: 'R' }
        ];
        break;

      case 'CLIENTE':
        this.menuItems = [
          { label: 'Dashboard', route: '/cliente/dashboard', icon: 'D' },
          { label: 'Mis Proyectos', route: '/cliente/proyectos', icon: 'P', children: [
            { label: 'Crear Proyecto', route: '/cliente/proyectos/crear', icon: '' },
            { label: 'Ver Proyectos', route: '/cliente/proyectos', icon: '' }
          ]},
          { label: 'Propuestas', route: '/cliente/propuestas', icon: 'P' },
          { label: 'Contratos', route: '/cliente/contratos', icon: 'C' },
          { label: 'Entregas', route: '/cliente/entregas', icon: 'E' },
          { label: 'Saldo', route: '/cliente/saldo', icon: 'S' },
          { label: 'Reportes', route: '/cliente/reportes', icon: 'R' }
        ];
        break;

      case 'FREELANCER':
        this.menuItems = [
          { label: 'Dashboard', route: '/freelancer/dashboard', icon: 'D' },
          { label: 'Explorar Proyectos', route: '/freelancer/explorar', icon: 'E' },
          { label: 'Propuestas', route: '/freelancer/propuestas', icon: 'P', children: [
            { label: 'Mis Propuestas', route: '/freelancer/propuestas', icon: '' },
            { label: 'Buscar Proyectos', route: '/freelancer/explorar', icon: '' }
          ]},
          { label: 'Contratos', route: '/freelancer/contratos', icon: 'C' },
         { label: 'Entregas', route: '/freelancer/entregas/historial', icon: 'E' },
          { label: 'Saldo', route: '/freelancer/saldo', icon: 'S' },
          { label: 'Reportes', route: '/freelancer/reportes', icon: 'R' }
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

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/auth/login']);
  }
}
