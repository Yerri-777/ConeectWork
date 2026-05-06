package dao;

import config.ConexionBD;
import modelo.Habilidad;

import java.sql.*;
import java.util.ArrayList;
import java.util.List;

public class HabilidadDAO {

    public int crear(Habilidad h) throws SQLException {
        String sql = "INSERT INTO habilidad (categoria_id, nombre, descripcion) VALUES (?,?,?)";
        try (Connection cn = ConexionBD.getConnection();
             PreparedStatement ps = cn.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {
            ps.setInt(1, h.getCategoriaId());
            ps.setString(2, h.getNombre());
            ps.setString(3, h.getDescripcion());
            ps.executeUpdate();
            try (ResultSet rs = ps.getGeneratedKeys()) {
                return rs.next() ? rs.getInt(1) : -1;
            }
        }
    }

    public boolean actualizar(Habilidad h) throws SQLException {
        String sql = "UPDATE habilidad SET nombre=?, descripcion=?, categoria_id=? WHERE id=?";
        try (Connection cn = ConexionBD.getConnection();
             PreparedStatement ps = cn.prepareStatement(sql)) {
            ps.setString(1, h.getNombre());
            ps.setString(2, h.getDescripcion());
            ps.setInt(3, h.getCategoriaId());
            ps.setInt(4, h.getId());
            return ps.executeUpdate() > 0;
        }
    }

    public boolean cambiarEstado(int id, boolean activo) throws SQLException {
        String sql = "UPDATE habilidad SET activo=? WHERE id=?";
        try (Connection cn = ConexionBD.getConnection();
             PreparedStatement ps = cn.prepareStatement(sql)) {
            ps.setBoolean(1, activo);
            ps.setInt(2, id);
            return ps.executeUpdate() > 0;
        }
    }

    public List<Habilidad> listar(Integer categoriaId, Boolean soloActivas) throws SQLException {
        StringBuilder sb = new StringBuilder("""
            SELECT h.*, c.nombre AS nombre_categoria
              FROM habilidad h
              JOIN categoria c ON c.id = h.categoria_id
             WHERE 1=1
            """);
        if (categoriaId != null) sb.append(" AND h.categoria_id = ").append(categoriaId);
        if (soloActivas != null && soloActivas) sb.append(" AND h.activo = TRUE");
        sb.append(" ORDER BY h.nombre");

        List<Habilidad> lista = new ArrayList<>();
        try (Connection cn = ConexionBD.getConnection();
             PreparedStatement ps = cn.prepareStatement(sb.toString());
             ResultSet rs = ps.executeQuery()) {
            while (rs.next()) lista.add(mapear(rs));
        }
        return lista;
    }

    /** Habilidades que posee un freelancer */
    public List<Habilidad> listarPorFreelancer(int usuarioId) throws SQLException {
        String sql = """
            SELECT h.*, c.nombre AS nombre_categoria
              FROM habilidad h
              JOIN categoria c ON c.id = h.categoria_id
              JOIN freelancer_habilidad fh ON fh.habilidad_id = h.id
              JOIN perfil_freelancer pf ON pf.id = fh.freelancer_id
             WHERE pf.usuario_id = ?
            """;
        List<Habilidad> lista = new ArrayList<>();
        try (Connection cn = ConexionBD.getConnection();
             PreparedStatement ps = cn.prepareStatement(sql)) {
            ps.setInt(1, usuarioId);
            try (ResultSet rs = ps.executeQuery()) {
                while (rs.next()) lista.add(mapear(rs));
            }
        }
        return lista;
    }

    /** Habilidades requeridas por un proyecto */
    public List<Habilidad> listarPorProyecto(int proyectoId) throws SQLException {
        String sql = """
            SELECT h.*, c.nombre AS nombre_categoria
              FROM habilidad h
              JOIN categoria c ON c.id = h.categoria_id
              JOIN proyecto_habilidad ph ON ph.habilidad_id = h.id
             WHERE ph.proyecto_id = ?
            """;
        List<Habilidad> lista = new ArrayList<>();
        try (Connection cn = ConexionBD.getConnection();
             PreparedStatement ps = cn.prepareStatement(sql)) {
            ps.setInt(1, proyectoId);
            try (ResultSet rs = ps.executeQuery()) {
                while (rs.next()) lista.add(mapear(rs));
            }
        }
        return lista;
    }

    private Habilidad mapear(ResultSet rs) throws SQLException {
        Habilidad h = new Habilidad();
        h.setId(rs.getInt("id"));
        h.setCategoriaId(rs.getInt("categoria_id"));
        h.setNombreCategoria(rs.getString("nombre_categoria"));
        h.setNombre(rs.getString("nombre"));
        h.setDescripcion(rs.getString("descripcion"));
        h.setActivo(rs.getBoolean("activo"));
        return h;
    }
}