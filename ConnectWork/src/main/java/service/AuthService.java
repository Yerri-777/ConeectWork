package service;

import dao.UsuarioDAO;
import modelo.Usuario;
import util.JwtUtil;

import java.sql.SQLException;
import java.time.LocalDate;
import java.util.LinkedHashMap;
import java.util.Map;

/**
 * Lógica de negocio para autenticación.
 * El AuthServlet delega aquí; este servicio orquesta UsuarioDAO + JwtUtil.
 */
public class AuthService {

    private final UsuarioDAO usuarioDAO;

    public AuthService() {
        this.usuarioDAO = new UsuarioDAO();
    }

    // ─── Login ────────────────────────────────────────────────────────────────
    /**
     * @return Map con token y datos del usuario, o null si credenciales inválidas
     */
    public Map<String, Object> login(String username, String password) throws SQLException {
        if (username == null || username.isBlank() || password == null || password.isBlank()) {
            throw new IllegalArgumentException("username y password son requeridos");
        }
        Usuario u = usuarioDAO.login(username, password);
        if (u == null) return null;   // credenciales incorrectas o cuenta inactiva

        String token = JwtUtil.generarToken(u.getId(), u.getUsername(), u.getRol());

        Map<String, Object> data = new LinkedHashMap<>();
        data.put("token",          token);
        data.put("id",             u.getId());
        data.put("nombreCompleto", u.getNombreCompleto());
        data.put("username",       u.getUsername());
        data.put("correo",         u.getCorreo());
        data.put("rol",            u.getRol());
        data.put("saldo",          u.getSaldo());
        data.put("perfilCompleto", u.isPerfilCompleto());
        return data;
    }

    // ─── Registro ─────────────────────────────────────────────────────────────
    /**
     * @return id del nuevo usuario
     * @throws IllegalArgumentException si los datos son inválidos o ya existen
     */
    public int registrar(Map<String, Object> datos) throws SQLException {
        String rol = (String) datos.get("rol");
        if (!"CLIENTE".equals(rol) && !"FREELANCER".equals(rol)) {
            throw new IllegalArgumentException("rol debe ser CLIENTE o FREELANCER");
        }

        String[] obligatorios = {"nombreCompleto","username","password","correo",
                                  "telefono","direccion","cui","fechaNacimiento"};
        for (String campo : obligatorios) {
            Object val = datos.get(campo);
            if (val == null || val.toString().isBlank()) {
                throw new IllegalArgumentException("Campo requerido: " + campo);
            }
        }

        if (usuarioDAO.existeUsername((String) datos.get("username"))) {
            throw new IllegalStateException("USERNAME_DUPLICADO");
        }
        if (usuarioDAO.existeCorreo((String) datos.get("correo"))) {
            throw new IllegalStateException("CORREO_DUPLICADO");
        }

        Usuario u = new Usuario();
        u.setNombreCompleto((String) datos.get("nombreCompleto"));
        u.setUsername((String) datos.get("username"));
        u.setPasswordHash((String) datos.get("password"));   // UsuarioDAO hace el hash
        u.setCorreo((String) datos.get("correo"));
        u.setTelefono((String) datos.get("telefono"));
        u.setDireccion((String) datos.get("direccion"));
        u.setCui((String) datos.get("cui"));
        u.setFechaNacimiento(LocalDate.parse((String) datos.get("fechaNacimiento")));
        u.setRol(rol);

        int id = usuarioDAO.registrar(u);
        if (id < 0) throw new RuntimeException("Error al insertar usuario en BD");
        return id;
    }
}