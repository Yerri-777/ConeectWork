import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UsuarioService } from '../../../../core/services/usuario.service';
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

  constructor(
    private usuarioService: UsuarioService,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.cargarUsuarios();
  }

  private cargarUsuarios(): void {
    this.usuarioService.listarTodos().subscribe({
      next: (usuarios) => {
        this.usuarios = usuarios;
        this.usuariosFiltrados = usuarios;
      },
      error: (error) => {
        console.error('Error:', error);
        this.notificationService.mostrarError('Error al cargar usuarios');
      }
    });
  }

  filtrarUsuarios(): void {
    this.usuariosFiltrados = this.usuarios.filter(usuario => {
      const cumpleBusqueda = this.busqueda === '' ||
        usuario.nombreCompleto.toLowerCase().includes(this.busqueda.toLowerCase()) ||
        usuario.username.toLowerCase().includes(this.busqueda.toLowerCase());

      const cumpleRol = this.filtroRol === '' || usuario.rol === this.filtroRol;

      return cumpleBusqueda && cumpleRol;
    });
  }

  abrirModal(usuario: Usuario): void {
    this.usuarioSeleccionado = usuario;
    this.modalAbierto = true;
  }

  cerrarModal(): void {
    this.modalAbierto = false;
    this.usuarioSeleccionado = null;
  }

  confirmarActualizarEstado(): void {
    if (!this.usuarioSeleccionado) return;

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
        this.notificationService.mostrarError('Error al actualizar usuario');
      }
    });
  }
}
