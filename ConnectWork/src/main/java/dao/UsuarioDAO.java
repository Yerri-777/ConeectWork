package dao;

import config.ConexionBD;
import modelo.Usuario;
import util.PasswordUtil;

import java.math.BigDecimal;
import java.sql.*;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

public class UsuarioDAO {

    // ════════════════════════════════════════════════════════════════════════
    // REGISTRAR USUARIO
    // ════════════════════════════════════════════════════════════════════════

    public int registrar(Usuario u) throws SQLException {

        String sql = """
            INSERT INTO usuario (
                nombre_completo,
                username,
                password_hash,
                correo,
                telefono,
                direccion,
                cui,
                fecha_nacimiento,
                rol,
                activo,
                perfil_completo,
                saldo
            )
            VALUES (?,?,?,?,?,?,?,?,?,?,?,?)
            """;

        try (Connection cn = ConexionBD.getConnection();
             PreparedStatement ps = cn.prepareStatement(
                     sql,
                     Statement.RETURN_GENERATED_KEYS)) {

            ps.setString(1, u.getNombreCompleto());
            ps.setString(2, u.getUsername());
            ps.setString(3, u.getPasswordHash());
            ps.setString(4, u.getCorreo());
            ps.setString(5, u.getTelefono());
            ps.setString(6, u.getDireccion());
            ps.setString(7, u.getCui());

            if (u.getFechaNacimiento() != null) {
                ps.setDate(8, Date.valueOf(u.getFechaNacimiento()));
            } else {
                ps.setNull(8, Types.DATE);
            }

            ps.setString(9, u.getRol());
            ps.setBoolean(10, u.isActivo());
            ps.setBoolean(11, u.isPerfilCompleto());
            ps.setBigDecimal(
                    12,
                    u.getSaldo() != null ? u.getSaldo() : BigDecimal.ZERO
            );

            ps.executeUpdate();

            try (ResultSet rs = ps.getGeneratedKeys()) {

                if (rs.next()) {
                    return rs.getInt(1);
                }
            }
        }

        return -1;
    }

    // ════════════════════════════════════════════════════════════════════════
    // LOGIN
    // ════════════════════════════════════════════════════════════════════════

    public Usuario login(String username, String password)
            throws SQLException {

        String sql = """
            SELECT *
              FROM usuario
             WHERE username = ?
               AND activo = 1
            """;

        try (Connection cn = ConexionBD.getConnection();
             PreparedStatement ps = cn.prepareStatement(sql)) {

            ps.setString(1, username);

            try (ResultSet rs = ps.executeQuery()) {

                if (rs.next()) {

                    String hash = rs.getString("password_hash");

                    if (PasswordUtil.checkPassword(password, hash)) {

                        Usuario u = mapear(rs);

                        // seguridad
                        u.setPasswordHash(null);

                        return u;
                    }
                }
            }
        }

        return null;
    }

    // ════════════════════════════════════════════════════════════════════════
    // BUSCAR POR ID
    // ════════════════════════════════════════════════════════════════════════

    public Usuario buscarPorId(int id) throws SQLException {

        String sql = "SELECT * FROM usuario WHERE id = ?";

        try (Connection cn = ConexionBD.getConnection();
             PreparedStatement ps = cn.prepareStatement(sql)) {

            ps.setInt(1, id);

            try (ResultSet rs = ps.executeQuery()) {

                if (rs.next()) {
                    return mapear(rs);
                }
            }
        }

        return null;
    }

    // ════════════════════════════════════════════════════════════════════════
    // BUSCAR POR USERNAME
    // ════════════════════════════════════════════════════════════════════════

    public Usuario buscarPorUsername(String username)
            throws SQLException {

        String sql = """
            SELECT *
              FROM usuario
             WHERE username = ?
            """;

        try (Connection cn = ConexionBD.getConnection();
             PreparedStatement ps = cn.prepareStatement(sql)) {

            ps.setString(1, username);

            try (ResultSet rs = ps.executeQuery()) {

                if (rs.next()) {
                    return mapear(rs);
                }
            }
        }

        return null;
    }

    // ════════════════════════════════════════════════════════════════════════
    // ACTUALIZAR USUARIO
    // ════════════════════════════════════════════════════════════════════════

    public boolean actualizar(Usuario u) throws SQLException {

        String sql = """
            UPDATE usuario
               SET nombre_completo = ?,
                   username = ?,
                   password_hash = ?,
                   correo = ?,
                   telefono = ?,
                   direccion = ?,
                   cui = ?,
                   fecha_nacimiento = ?,
                   rol = ?,
                   activo = ?,
                   perfil_completo = ?
             WHERE id = ?
            """;

        try (Connection cn = ConexionBD.getConnection();
             PreparedStatement ps = cn.prepareStatement(sql)) {

            ps.setString(1, u.getNombreCompleto());
            ps.setString(2, u.getUsername());
            ps.setString(3, u.getPasswordHash());
            ps.setString(4, u.getCorreo());
            ps.setString(5, u.getTelefono());
            ps.setString(6, u.getDireccion());
            ps.setString(7, u.getCui());

            if (u.getFechaNacimiento() != null) {
                ps.setDate(8, Date.valueOf(u.getFechaNacimiento()));
            } else {
                ps.setNull(8, Types.DATE);
            }

            ps.setString(9, u.getRol());
            ps.setBoolean(10, u.isActivo());
            ps.setBoolean(11, u.isPerfilCompleto());

            ps.setInt(12, u.getId());

            return ps.executeUpdate() > 0;
        }
    }

    // ════════════════════════════════════════════════════════════════════════
    // CAMBIAR ESTADO
    // ════════════════════════════════════════════════════════════════════════

    public boolean cambiarEstado(int usuarioId, boolean activo)
            throws SQLException {

        String sql = """
            UPDATE usuario
               SET activo = ?
             WHERE id = ?
            """;

        try (Connection cn = ConexionBD.getConnection();
             PreparedStatement ps = cn.prepareStatement(sql)) {

            ps.setBoolean(1, activo);
            ps.setInt(2, usuarioId);

            return ps.executeUpdate() > 0;
        }
    }

    // ════════════════════════════════════════════════════════════════════════
    // MARCAR PERFIL COMPLETO
    // ════════════════════════════════════════════════════════════════════════

    public boolean marcarPerfilCompleto(int usuarioId)
            throws SQLException {

        String sql = """
            UPDATE usuario
               SET perfil_completo = 1
             WHERE id = ?
            """;

        try (Connection cn = ConexionBD.getConnection();
             PreparedStatement ps = cn.prepareStatement(sql)) {

            ps.setInt(1, usuarioId);

            return ps.executeUpdate() > 0;
        }
    }

    // ════════════════════════════════════════════════════════════════════════
    // SALDO
    // ════════════════════════════════════════════════════════════════════════

    public BigDecimal obtenerSaldo(int usuarioId)
            throws SQLException {

        String sql = """
            SELECT saldo
              FROM usuario
             WHERE id = ?
            """;

        try (Connection cn = ConexionBD.getConnection();
             PreparedStatement ps = cn.prepareStatement(sql)) {

            ps.setInt(1, usuarioId);

            try (ResultSet rs = ps.executeQuery()) {

                if (rs.next()) {

                    BigDecimal saldo = rs.getBigDecimal("saldo");

                    return saldo != null
                            ? saldo
                            : BigDecimal.ZERO;
                }
            }
        }

        return BigDecimal.ZERO;
    }

    public boolean actualizarSaldo(int usuarioId,
                                   BigDecimal nuevoSaldo)
            throws SQLException {

        String sql = """
            UPDATE usuario
               SET saldo = ?
             WHERE id = ?
            """;

        try (Connection cn = ConexionBD.getConnection();
             PreparedStatement ps = cn.prepareStatement(sql)) {

            ps.setBigDecimal(1, nuevoSaldo);
            ps.setInt(2, usuarioId);

            return ps.executeUpdate() > 0;
        }
    }

    public boolean sumarSaldo(int usuarioId,
                              BigDecimal monto)
            throws SQLException {

        String sql = """
            UPDATE usuario
               SET saldo = saldo + ?
             WHERE id = ?
            """;

        try (Connection cn = ConexionBD.getConnection();
             PreparedStatement ps = cn.prepareStatement(sql)) {

            ps.setBigDecimal(1, monto);
            ps.setInt(2, usuarioId);

            return ps.executeUpdate() > 0;
        }
    }

    public boolean restarSaldo(int usuarioId,
                               BigDecimal monto)
            throws SQLException {

        String sql = """
            UPDATE usuario
               SET saldo = saldo - ?
             WHERE id = ?
               AND saldo >= ?
            """;

        try (Connection cn = ConexionBD.getConnection();
             PreparedStatement ps = cn.prepareStatement(sql)) {

            ps.setBigDecimal(1, monto);
            ps.setInt(2, usuarioId);
            ps.setBigDecimal(3, monto);

            return ps.executeUpdate() > 0;
        }
    }

    // ════════════════════════════════════════════════════════════════════════
    // VALIDACIONES
    // ════════════════════════════════════════════════════════════════════════

    public boolean existeUsername(String username)
            throws SQLException {

        String sql = """
            SELECT COUNT(*)
              FROM usuario
             WHERE username = ?
            """;

        try (Connection cn = ConexionBD.getConnection();
             PreparedStatement ps = cn.prepareStatement(sql)) {

            ps.setString(1, username);

            try (ResultSet rs = ps.executeQuery()) {

                rs.next();

                return rs.getInt(1) > 0;
            }
        }
    }

    public boolean existeCorreo(String correo)
            throws SQLException {

        String sql = """
            SELECT COUNT(*)
              FROM usuario
             WHERE correo = ?
            """;

        try (Connection cn = ConexionBD.getConnection();
             PreparedStatement ps = cn.prepareStatement(sql)) {

            ps.setString(1, correo);

            try (ResultSet rs = ps.executeQuery()) {

                rs.next();

                return rs.getInt(1) > 0;
            }
        }
    }

    // ════════════════════════════════════════════════════════════════════════
    // LISTADOS
    // ════════════════════════════════════════════════════════════════════════

    public List<Usuario> listarTodos() throws SQLException {

        String sql = """
            SELECT *
              FROM usuario
             ORDER BY created_at DESC
            """;

        List<Usuario> lista = new ArrayList<>();

        try (Connection cn = ConexionBD.getConnection();
             PreparedStatement ps = cn.prepareStatement(sql);
             ResultSet rs = ps.executeQuery()) {

            while (rs.next()) {
                lista.add(mapear(rs));
            }
        }

        return lista;
    }

    public List<Usuario> listarPorRol(String rol)
            throws SQLException {

        String sql = """
            SELECT *
              FROM usuario
             WHERE rol = ?
             ORDER BY created_at DESC
            """;

        List<Usuario> lista = new ArrayList<>();

        try (Connection cn = ConexionBD.getConnection();
             PreparedStatement ps = cn.prepareStatement(sql)) {

            ps.setString(1, rol);

            try (ResultSet rs = ps.executeQuery()) {

                while (rs.next()) {
                    lista.add(mapear(rs));
                }
            }
        }

        return lista;
    }

    // ════════════════════════════════════════════════════════════════════════
    // MAPEADOR
    // ════════════════════════════════════════════════════════════════════════

    private Usuario mapear(ResultSet rs) throws SQLException {

        Usuario u = new Usuario();

        u.setId(rs.getInt("id"));
        u.setNombreCompleto(rs.getString("nombre_completo"));
        u.setUsername(rs.getString("username"));
        u.setPasswordHash(rs.getString("password_hash"));
        u.setCorreo(rs.getString("correo"));
        u.setTelefono(rs.getString("telefono"));
        u.setDireccion(rs.getString("direccion"));
        u.setCui(rs.getString("cui"));

        Date fecha = rs.getDate("fecha_nacimiento");

        if (fecha != null) {
            u.setFechaNacimiento(fecha.toLocalDate());
        }

        u.setRol(rs.getString("rol"));
        u.setActivo(rs.getBoolean("activo"));
        u.setPerfilCompleto(rs.getBoolean("perfil_completo"));

        BigDecimal saldo = rs.getBigDecimal("saldo");

        u.setSaldo(
                saldo != null
                        ? saldo
                        : BigDecimal.ZERO
        );

        Timestamp created = rs.getTimestamp("created_at");

        if (created != null) {
            u.setCreatedAt(created.toLocalDateTime());
        }

        return u;
    }
}