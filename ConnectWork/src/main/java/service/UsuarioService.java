package service;

import dao.UsuarioDAO;
import modelo.Usuario;
import util.PasswordUtil;

import java.sql.SQLException;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;

/**
 * Service de usuarios.
 * ConnectWork - CUNOC
 */
public class UsuarioService {

    private final UsuarioDAO usuarioDAO;

    public UsuarioService() {
        this.usuarioDAO = new UsuarioDAO();
    }

    // ─────────────────────────────────────────────────────────
    // LISTADOS
    // ─────────────────────────────────────────────────────────

    public List<Usuario> listar() throws SQLException {

        List<Usuario> lista = usuarioDAO.listarPorRol("CLIENTE");

        lista.addAll(usuarioDAO.listarPorRol("FREELANCER"));
        lista.addAll(usuarioDAO.listarPorRol("ADMIN"));

        limpiarPasswords(lista);

        System.out.println("[UsuarioService.listar] ✓ " + lista.size());

        return lista;
    }

    public List<Usuario> listarTodos() throws SQLException {
        return listar();
    }

    public List<Usuario> listarPorRol(String rol) throws SQLException {

        validarRol(rol);

        List<Usuario> lista = usuarioDAO.listarPorRol(rol.toUpperCase().trim());

        limpiarPasswords(lista);

        return lista;
    }

    // ─────────────────────────────────────────────────────────
    // BÚSQUEDA
    // ─────────────────────────────────────────────────────────

    public Usuario buscarPorId(int id) throws SQLException {

        validarId(id);

        Usuario u = usuarioDAO.buscarPorId(id);

        if (u == null) {
            throw new IllegalArgumentException("Usuario no encontrado");
        }

        u.setPasswordHash(null);

        return u;
    }

    // ─────────────────────────────────────────────────────────
    // ESTADOS
    // ─────────────────────────────────────────────────────────

    public void activar(int id) throws SQLException {
        cambiarEstadoInterno(id, true);
    }

    public void desactivar(int id) throws SQLException {
        cambiarEstadoInterno(id, false);
    }

    public void cambiarEstado(int id, boolean activo) throws SQLException {
        cambiarEstadoInterno(id, activo);
    }

    private void cambiarEstadoInterno(int id, boolean activo) throws SQLException {

        validarId(id);

        Usuario u = usuarioDAO.buscarPorId(id);

        if (u == null) {
            throw new IllegalArgumentException("Usuario no encontrado");
        }

        if ("ADMIN".equalsIgnoreCase(u.getRol())) {
            throw new IllegalArgumentException("No se puede modificar administradores");
        }

        boolean ok = usuarioDAO.cambiarEstado(id, activo);

        if (!ok) {
            throw new IllegalStateException("No se pudo actualizar estado");
        }

        System.out.println("[UsuarioService.cambiarEstado] ✓ ID: "
                + id + " -> " + activo);
    }

    // ─────────────────────────────────────────────────────────
    // ACTUALIZAR
    // ─────────────────────────────────────────────────────────

    public void actualizar(Usuario u) throws SQLException {

        if (u == null) {
            throw new IllegalArgumentException("Usuario requerido");
        }

        validarId(u.getId());

        Usuario actual = usuarioDAO.buscarPorId(u.getId());

        if (actual == null) {
            throw new IllegalArgumentException("Usuario no encontrado");
        }

        validarCamposUsuario(u, false);

        // password
        if (u.getPasswordHash() == null || u.getPasswordHash().isBlank()) {

            u.setPasswordHash(actual.getPasswordHash());

        } else {

            u.setPasswordHash(
                    PasswordUtil.hashPassword(u.getPasswordHash())
            );
        }

        boolean ok = usuarioDAO.actualizar(u);

        if (!ok) {
            throw new IllegalStateException("No se pudo actualizar usuario");
        }

        System.out.println("[UsuarioService.actualizar] ✓ ID: " + u.getId());
    }

    // ─────────────────────────────────────────────────────────
    // CREAR
    // ─────────────────────────────────────────────────────────

    public int crear(Usuario u) throws SQLException {

        if (u == null) {
            throw new IllegalArgumentException("Usuario requerido");
        }

        validarCamposUsuario(u, true);

        if (usuarioDAO.existeUsername(u.getUsername())) {
            throw new IllegalStateException("USERNAME_DUPLICADO");
        }

        if (usuarioDAO.existeCorreo(u.getCorreo())) {
            throw new IllegalStateException("CORREO_DUPLICADO");
        }

        u.setPasswordHash(
                PasswordUtil.hashPassword(u.getPasswordHash())
        );

        if (u.getRol() == null || u.getRol().isBlank()) {
            u.setRol("CLIENTE");
        }

        u.setRol(u.getRol().toUpperCase().trim());

        u.setActivo(true);

        int id = usuarioDAO.registrar(u);

        if (id <= 0) {
            throw new SQLException("No se pudo crear usuario");
        }

        System.out.println("[UsuarioService.crear] ✓ ID: " + id);

        return id;
    }

    // ─────────────────────────────────────────────────────────
    // CREAR ADMIN
    // ─────────────────────────────────────────────────────────

    public int crearAdmin(Map<String, Object> datos) throws SQLException {

        if (datos == null) {
            throw new IllegalArgumentException("Datos requeridos");
        }

        String[] obligatorios = {
                "nombreCompleto",
                "username",
                "password",
                "correo",
                "telefono",
                "direccion",
                "cui",
                "fechaNacimiento"
        };

        for (String campo : obligatorios) {

            Object val = datos.get(campo);

            if (val == null || val.toString().isBlank()) {
                throw new IllegalArgumentException("Campo requerido: " + campo);
            }
        }

        String username = datos.get("username").toString().trim();
        String correo = datos.get("correo").toString().trim();

        if (usuarioDAO.existeUsername(username)) {
            throw new IllegalStateException("USERNAME_DUPLICADO");
        }

        if (usuarioDAO.existeCorreo(correo)) {
            throw new IllegalStateException("CORREO_DUPLICADO");
        }

        Usuario u = new Usuario();

        u.setNombreCompleto(datos.get("nombreCompleto").toString().trim());
        u.setUsername(username);

        u.setPasswordHash(
                PasswordUtil.hashPassword(
                        datos.get("password").toString()
                )
        );

        u.setCorreo(correo);
        u.setTelefono(datos.get("telefono").toString().trim());
        u.setDireccion(datos.get("direccion").toString().trim());
        u.setCui(datos.get("cui").toString().trim());

        try {

            u.setFechaNacimiento(
                    LocalDate.parse(datos.get("fechaNacimiento").toString())
            );

        } catch (Exception e) {

            throw new IllegalArgumentException(
                    "Formato fecha inválido. Use YYYY-MM-DD"
            );
        }

        u.setRol("ADMIN");
        u.setActivo(true);
        u.setPerfilCompleto(true);

        int id = usuarioDAO.registrar(u);

        if (id <= 0) {
            throw new SQLException("No se pudo crear administrador");
        }

        System.out.println("[UsuarioService.crearAdmin] ✓ ID: " + id);

        return id;
    }

    // ─────────────────────────────────────────────────────────
    // ELIMINAR (SOFT DELETE)
    // ─────────────────────────────────────────────────────────

    public void eliminar(int id) throws SQLException {

        validarId(id);

        Usuario u = usuarioDAO.buscarPorId(id);

        if (u == null) {
            throw new IllegalArgumentException("Usuario no encontrado");
        }

        if ("ADMIN".equalsIgnoreCase(u.getRol())) {
            throw new IllegalArgumentException("No se puede eliminar administradores");
        }

        boolean ok = usuarioDAO.cambiarEstado(id, false);

        if (!ok) {
            throw new IllegalStateException("No se pudo eliminar usuario");
        }

        System.out.println("[UsuarioService.eliminar] ✓ ID: " + id);
    }

    // ─────────────────────────────────────────────────────────
    // HELPERS
    // ─────────────────────────────────────────────────────────

    private void validarId(int id) {

        if (id <= 0) {
            throw new IllegalArgumentException("ID inválido");
        }
    }

    private void validarRol(String rol) {

        if (rol == null || rol.isBlank()) {
            throw new IllegalArgumentException("Rol requerido");
        }

        rol = rol.toUpperCase().trim();

        if (!rol.equals("CLIENTE")
                && !rol.equals("FREELANCER")
                && !rol.equals("ADMIN")) {

            throw new IllegalArgumentException("Rol inválido");
        }
    }

    private void limpiarPasswords(List<Usuario> lista) {

        lista.forEach(u -> u.setPasswordHash(null));
    }

    private void validarCamposUsuario(Usuario u, boolean crear) {

        if (u.getNombreCompleto() == null || u.getNombreCompleto().isBlank()) {
            throw new IllegalArgumentException("Nombre requerido");
        }

        if (u.getUsername() == null || u.getUsername().isBlank()) {
            throw new IllegalArgumentException("Username requerido");
        }

        if (crear && (u.getPasswordHash() == null || u.getPasswordHash().isBlank())) {
            throw new IllegalArgumentException("Password requerida");
        }

        if (u.getCorreo() == null || u.getCorreo().isBlank()) {
            throw new IllegalArgumentException("Correo requerido");
        }
    }
}