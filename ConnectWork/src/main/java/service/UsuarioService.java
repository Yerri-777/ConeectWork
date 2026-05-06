package service;

import dao.UsuarioDAO;
import modelo.Usuario;

import java.sql.SQLException;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;

/**
 * Lógica de negocio para gestión de usuarios (módulo Admin).
 */
public class UsuarioService {

    private final UsuarioDAO usuarioDAO;

    public UsuarioService() {
        this.usuarioDAO = new UsuarioDAO();
    }

    public List<Usuario> listarPorRol(String rol) throws SQLException {
        List<Usuario> lista = usuarioDAO.listarPorRol(rol);
        lista.forEach(u -> u.setPasswordHash(null));  // nunca exponer el hash
        return lista;
    }

    public Usuario buscarPorId(int id) throws SQLException {
        Usuario u = usuarioDAO.buscarPorId(id);
        if (u != null) u.setPasswordHash(null);
        return u;
    }

    public void activar(int id) throws SQLException {
        boolean ok = usuarioDAO.cambiarEstado(id, true);
        if (!ok) throw new IllegalArgumentException("Usuario no encontrado o es administrador");
    }

    public void desactivar(int id) throws SQLException {
        boolean ok = usuarioDAO.cambiarEstado(id, false);
        if (!ok) throw new IllegalArgumentException("Usuario no encontrado o es administrador");
    }

    public int crearAdmin(Map<String, Object> datos) throws SQLException {
        if (usuarioDAO.existeUsername((String) datos.get("username"))) {
            throw new IllegalStateException("USERNAME_DUPLICADO");
        }
        if (usuarioDAO.existeCorreo((String) datos.get("correo"))) {
            throw new IllegalStateException("CORREO_DUPLICADO");
        }
        Usuario u = new Usuario();
        u.setNombreCompleto((String) datos.get("nombreCompleto"));
        u.setUsername((String) datos.get("username"));
        u.setPasswordHash((String) datos.get("password"));
        u.setCorreo((String) datos.get("correo"));
        u.setTelefono((String) datos.get("telefono"));
        u.setDireccion((String) datos.get("direccion"));
        u.setCui((String) datos.get("cui"));
        u.setFechaNacimiento(LocalDate.parse((String) datos.get("fechaNacimiento")));
        u.setRol("ADMIN");
        u.setPerfilCompleto(true);
        return usuarioDAO.registrar(u);
    }
}