package dao;

import config.ConexionBD;
import modelo.Usuario;
import util.PasswordUtil;

import java.sql.*;
import java.util.ArrayList;
import java.util.List;

public class UsuarioDAO {

    // ─── Registro ────────────────────────────────────────────────────────────
    public int registrar(Usuario u) throws SQLException {
        String sql = """
            INSERT INTO usuario (nombre_completo, username, password_hash, correo,
                                 telefono, direccion, cui, fecha_nacimiento, rol)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            """;
        try (Connection cn = ConexionBD.getConnection();
             PreparedStatement ps = cn.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {
            ps.setString(1, u.getNombreCompleto());
            ps.setString(2, u.getUsername());
            ps.setString(3, PasswordUtil.encriptar(u.getPasswordHash()));
            ps.setString(4, u.getCorreo());
            ps.setString(5, u.getTelefono());
            ps.setString(6, u.getDireccion());
            ps.setString(7, u.getCui());
            ps.setDate(8, Date.valueOf(u.getFechaNacimiento()));
            ps.setString(9, u.getRol());
            ps.executeUpdate();
            try (ResultSet rs = ps.getGeneratedKeys()) {
                return rs.next() ? rs.getInt(1) : -1;
            }
        }
    }

    // ─── Login ───────────────────────────────────────────────────────────────
    public Usuario login(String username, String password) throws SQLException {
        String sql = "SELECT * FROM usuario WHERE username = ?";
        try (Connection cn = ConexionBD.getConnection();
             PreparedStatement ps = cn.prepareStatement(sql)) {
            ps.setString(1, username);
            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) {
                    Usuario u = mapear(rs);
                    if (!u.isActivo()) return null;
                    if (PasswordUtil.verificar(password, u.getPasswordHash())) return u;
                }
            }
        }
        return null;
    }

    // ─── Buscar por ID ───────────────────────────────────────────────────────
    public Usuario buscarPorId(int id) throws SQLException {
        String sql = "SELECT * FROM usuario WHERE id = ?";
        try (Connection cn = ConexionBD.getConnection();
             PreparedStatement ps = cn.prepareStatement(sql)) {
            ps.setInt(1, id);
            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) return mapear(rs);
            }
        }
        return null;
    }

    // ─── Listar por rol ──────────────────────────────────────────────────────
    public List<Usuario> listarPorRol(String rol) throws SQLException {
        String sql = "SELECT * FROM usuario WHERE rol = ? ORDER BY created_at DESC";
        List<Usuario> lista = new ArrayList<>();
        try (Connection cn = ConexionBD.getConnection();
             PreparedStatement ps = cn.prepareStatement(sql)) {
            ps.setString(1, rol);
            try (ResultSet rs = ps.executeQuery()) {
                while (rs.next()) lista.add(mapear(rs));
            }
        }
        return lista;
    }

    // ─── Activar / Desactivar ────────────────────────────────────────────────
    public boolean cambiarEstado(int id, boolean activo) throws SQLException {
        String sql = "UPDATE usuario SET activo = ? WHERE id = ? AND rol != 'ADMIN'";
        try (Connection cn = ConexionBD.getConnection();
             PreparedStatement ps = cn.prepareStatement(sql)) {
            ps.setBoolean(1, activo);
            ps.setInt(2, id);
            return ps.executeUpdate() > 0;
        }
    }

    // ─── Marcar perfil completo ──────────────────────────────────────────────
    public void marcarPerfilCompleto(int id) throws SQLException {
        String sql = "UPDATE usuario SET perfil_completo = TRUE WHERE id = ?";
        try (Connection cn = ConexionBD.getConnection();
             PreparedStatement ps = cn.prepareStatement(sql)) {
            ps.setInt(1, id);
            ps.executeUpdate();
        }
    }

    // ─── Saldo ───────────────────────────────────────────────────────────────
    public boolean recargarSaldo(int clienteId, java.math.BigDecimal monto) throws SQLException {
        String sql = "UPDATE usuario SET saldo = saldo + ? WHERE id = ? AND rol = 'CLIENTE'";
        try (Connection cn = ConexionBD.getConnection();
             PreparedStatement ps = cn.prepareStatement(sql)) {
            ps.setBigDecimal(1, monto);
            ps.setInt(2, clienteId);
            return ps.executeUpdate() > 0;
        }
    }

    public java.math.BigDecimal consultarSaldo(int usuarioId) throws SQLException {
        String sql = "SELECT saldo FROM usuario WHERE id = ?";
        try (Connection cn = ConexionBD.getConnection();
             PreparedStatement ps = cn.prepareStatement(sql)) {
            ps.setInt(1, usuarioId);
            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) return rs.getBigDecimal("saldo");
            }
        }
        return null;
    }

    // ─── Validar unicidad ────────────────────────────────────────────────────
    public boolean existeUsername(String username) throws SQLException {
        String sql = "SELECT 1 FROM usuario WHERE username = ?";
        try (Connection cn = ConexionBD.getConnection();
             PreparedStatement ps = cn.prepareStatement(sql)) {
            ps.setString(1, username);
            try (ResultSet rs = ps.executeQuery()) { return rs.next(); }
        }
    }

    public boolean existeCorreo(String correo) throws SQLException {
        String sql = "SELECT 1 FROM usuario WHERE correo = ?";
        try (Connection cn = ConexionBD.getConnection();
             PreparedStatement ps = cn.prepareStatement(sql)) {
            ps.setString(1, correo);
            try (ResultSet rs = ps.executeQuery()) { return rs.next(); }
        }
    }

    // ─── Mapeo ───────────────────────────────────────────────────────────────
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
        u.setFechaNacimiento(rs.getDate("fecha_nacimiento").toLocalDate());
        u.setRol(rs.getString("rol"));
        u.setSaldo(rs.getBigDecimal("saldo"));
        u.setActivo(rs.getBoolean("activo"));
        u.setPerfilCompleto(rs.getBoolean("perfil_completo"));
        u.setCreatedAt(rs.getTimestamp("created_at").toLocalDateTime());
        return u;
    }
}