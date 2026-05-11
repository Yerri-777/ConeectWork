package service;

import dao.UsuarioDAO;
import modelo.Usuario;
import util.JwtUtil;
import util.PasswordUtil;

import java.sql.SQLException;
import java.time.LocalDate;
import java.time.Period;
import java.util.LinkedHashMap;
import java.util.Map;

public class AuthService {

    private final UsuarioDAO usuarioDAO;

    public AuthService() {

        this.usuarioDAO =
                new UsuarioDAO();
    }

    // =========================================================
    // LOGIN
    // =========================================================

    public Map<String, Object> login(
            String username,
            String password
    ) throws SQLException {

        // =====================================================
        // VALIDACIONES
        // =====================================================

        if (
                username == null ||
                username.isBlank()
        ) {

            throw new IllegalArgumentException(
                    "Username requerido"
            );
        }

        if (
                password == null ||
                password.isBlank()
        ) {

            throw new IllegalArgumentException(
                    "Password requerido"
            );
        }

        username = username.trim();

        System.out.println(
                "[AuthService] Login username: "
                        + username
        );

        // =====================================================
        // BUSCAR USUARIO
        // =====================================================

        Usuario usuario =
                usuarioDAO.buscarPorUsername(
                        username
                );

        if (usuario == null) {

            System.err.println(
                    "[AuthService] Usuario no encontrado"
            );

            return null;
        }

        // =====================================================
        // VALIDAR PASSWORD
        // =====================================================

        boolean passwordCorrecto =
                PasswordUtil.checkPassword(
                        password,
                        usuario.getPasswordHash()
                );

        if (!passwordCorrecto) {

            System.err.println(
                    "[AuthService] Password incorrecto"
            );

            return null;
        }

        // =====================================================
        // VALIDAR ACTIVO
        // =====================================================

        if (!usuario.isActivo()) {

            throw new IllegalStateException(
                    "Usuario inactivo"
            );
        }

        // =====================================================
        // JWT
        // =====================================================

        String token =
                JwtUtil.generarToken(
                        usuario.getId(),
                        usuario.getUsername(),
                        usuario.getRol()
                );

        // =====================================================
        // RESPONSE
        // =====================================================

        Map<String, Object> response =
                new LinkedHashMap<>();

        response.put("token", token);

        response.put("id",
                usuario.getId());

        response.put("nombreCompleto",
                usuario.getNombreCompleto());

        response.put("username",
                usuario.getUsername());

        response.put("correo",
                usuario.getCorreo());

        response.put("rol",
                usuario.getRol());

        response.put("saldo",
                usuario.getSaldo());

        response.put("perfilCompleto",
                usuario.isPerfilCompleto());

        System.out.println(
                "[AuthService] ✓ Login correcto"
        );

        return response;
    }

    // =========================================================
    // REGISTRO
    // =========================================================

    public int registrar(
            Map<String, Object> datos
    ) throws SQLException {

        if (
                datos == null ||
                datos.isEmpty()
        ) {

            throw new IllegalArgumentException(
                    "Datos requeridos"
            );
        }

        String rol =
                obtenerString(datos.get("rol"));

        if (
                rol == null ||
                rol.isBlank()
        ) {

            throw new IllegalArgumentException(
                    "Rol requerido"
            );
        }

        rol = rol.trim().toUpperCase();

        if (
                !rol.equals("CLIENTE") &&
                !rol.equals("FREELANCER")
        ) {

            throw new IllegalArgumentException(
                    "Rol inválido"
            );
        }

        Usuario u = new Usuario();

        u.setNombreCompleto(
                obtenerString(
                        datos.get("nombreCompleto")
                )
        );

        u.setUsername(
                obtenerString(
                        datos.get("username")
                )
        );

        u.setCorreo(
                obtenerString(
                        datos.get("correo")
                )
        );

        u.setTelefono(
                obtenerString(
                        datos.get("telefono")
                )
        );

        u.setDireccion(
                obtenerString(
                        datos.get("direccion")
                )
        );

        u.setCui(
                obtenerString(
                        datos.get("cui")
                )
        );

        u.setFechaNacimiento(
                LocalDate.parse(
                        obtenerString(
                                datos.get("fechaNacimiento")
                        )
                )
        );

        u.setRol(rol);

        u.setActivo(true);

        u.setPerfilCompleto(false);

        // =====================================================
        // HASH PASSWORD
        // =====================================================

        String password =
                obtenerString(
                        datos.get("password")
                );

        u.setPasswordHash(
                PasswordUtil.hashPassword(
                        password
                )
        );

        // =====================================================
        // INSERT
        // =====================================================

        int id =
                usuarioDAO.registrar(u);

        System.out.println(
                "[AuthService] ✓ Usuario registrado ID: "
                        + id
        );

        return id;
    }

    // =========================================================
    // HELPER
    // =========================================================

    private String obtenerString(
            Object obj
    ) {

        if (obj == null) {
            return null;
        }

        return obj.toString().trim();
    }
}