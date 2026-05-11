import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UsuarioService } from '../../../../core/services/usuario.service';
import { AuthService } from '../../../../core/services/auth.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { ModalConfirmarComponent } from '../../../../shared/componentes/modal-confirmar/modal-confirmar.component';
import { Usuario } from '../../../../core/models/usuario.model';

@Component({
  selector: 'app-lista-usuarios',
  standalone: true,
  imports: [CommonModule, FormsModule, ModalConfirmarComponent],
  templateUrl: './lista-usuarios.component.html',
  styleUrls: ['./lista-usuarios.component.css']
})
export class ListaUsuariosComponent implements OnInit {
  usuarios: Usuario[] = [];
  usuariosFiltrados: Usuario[] = [];
  busqueda = '';
  filtroRol = '';
  usuarioSeleccionado: Usuario | null = null;
  modalAbierto = false;
  cargando = false;
  usuarioActual: any = null;

  constructor(
    private usuarioService: UsuarioService,
    private authService: AuthService,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.usuarioActual = this.authService.getCurrentUser();

    if (!this.usuarioActual || this.usuarioActual.rol !== 'ADMIN') {
      this.notificationService.mostrarError('No tienes permiso para acceder a esta sección');
      return;
    }

    this.cargarUsuarios();
  }

  cargarUsuarios(): void {
    this.cargando = true;

    this.usuarioService.listarTodos().subscribe({
      next: (usuarios) => {
        this.usuarios = usuarios || [];
        this.usuariosFiltrados = usuarios || [];
        this.cargando = false;
      },
      error: (error) => {
        this.cargando = false;
        console.error('Error al cargar usuarios:', error);

        if (error.status === 403) {
          this.notificationService.mostrarError('No tienes permisos para ver usuarios');
        } else {
          this.notificationService.mostrarError('Error al cargar usuarios');
        }

        this.usuarios = [];
        this.usuariosFiltrados = [];
      }
    });
  }

  filtrarUsuarios(): void {
    this.usuariosFiltrados = this.usuarios.filter(usuario => {
      const cumpleBusqueda = this.busqueda === '' ||
        (usuario.nombreCompleto && usuario.nombreCompleto.toLowerCase().includes(this.busqueda.toLowerCase())) ||
        (usuario.username && usuario.username.toLowerCase().includes(this.busqueda.toLowerCase()));

      const cumpleRol = this.filtroRol === '' || usuario.rol === this.filtroRol;

      return cumpleBusqueda && cumpleRol;
    });
  }

  abrirModal(usuario: Usuario): void {
    this.usuarioSeleccionado = { ...usuario };
    this.modalAbierto = true;
  }

  cerrarModal(): void {
    this.modalAbierto = false;
    this.usuarioSeleccionado = null;
  }

  confirmarActualizarEstado(): void {
    if (!this.usuarioSeleccionado || !this.usuarioSeleccionado.id) {
      return;
    }

    const accion = this.usuarioSeleccionado.activo
      ? this.usuarioService.desactivar(this.usuarioSeleccionado.id)
      : this.usuarioService.activar(this.usuarioSeleccionado.id);

    accion.subscribe({
      next: () => {
        const accionTexto = this.usuarioSeleccionado!.activo ? 'desactivado' : 'activado';
        this.notificationService.mostrarExito(`Usuario ${accionTexto}`);
        this.cerrarModal();
        this.cargarUsuarios();
      },
      error: (error) => {
        console.error('Error:', error);

        if (error.status === 403) {
          this.notificationService.mostrarError('No tienes permisos para realizar esta acción');
        } else if (error.status === 404) {
          this.notificationService.mostrarError('Usuario no encontrado');
        } else {
          this.notificationService.mostrarError('Error al actualizar usuario');
        }
      }
    });
  }

  toggleEstado(usuario: Usuario): void {
    this.abrirModal(usuario);
  }
}
