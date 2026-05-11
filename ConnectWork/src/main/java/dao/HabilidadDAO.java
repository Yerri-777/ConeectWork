package dao;

import config.ConexionBD;
import modelo.Habilidad;

import java.sql.*;
import java.util.ArrayList;
import java.util.List;

/**
 * DAO para habilidades.
 */
public class HabilidadDAO {

    /**
     * Crear habilidad.
     */
    public int crear(Habilidad h) throws SQLException {

        String sql = """
            INSERT INTO habilidad (
                categoria_id,
                nombre,
                descripcion,
                activo
            ) VALUES (?, ?, ?, ?)
            """;

        try (Connection cn = ConexionBD.getConnection();
             PreparedStatement ps = cn.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {

            ps.setInt(1, h.getCategoriaId());
            ps.setString(2, h.getNombre());
            ps.setString(3, h.getDescripcion());
            ps.setBoolean(4, true);

            int affected = ps.executeUpdate();

            if (affected == 0) {
                throw new SQLException("No se pudo crear la habilidad");
            }

            try (ResultSet rs = ps.getGeneratedKeys()) {

                if (rs.next()) {
                    return rs.getInt(1);
                }
            }
        }

        return -1;
    }

    /**
     * Actualizar habilidad.
     */
    public boolean actualizar(Habilidad h) throws SQLException {

        String sql = """
            UPDATE habilidad
               SET categoria_id = ?,
                   nombre = ?,
                   descripcion = ?,
                   activo = ?
             WHERE id = ?
            """;

        try (Connection cn = ConexionBD.getConnection();
             PreparedStatement ps = cn.prepareStatement(sql)) {

            ps.setInt(1, h.getCategoriaId());
            ps.setString(2, h.getNombre());
            ps.setString(3, h.getDescripcion());
            ps.setBoolean(4, h.isActivo());
            ps.setInt(5, h.getId());

            return ps.executeUpdate() > 0;
        }
    }

    /**
     * Buscar habilidad por ID.
     */
    public Habilidad buscarPorId(int id) throws SQLException {

        String sql = """
            SELECT *
              FROM habilidad
             WHERE id = ?
            """;

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

    /**
     * Listar habilidades.
     */
    public List<Habilidad> listar(Integer categoriaId, boolean soloActivas) throws SQLException {

        StringBuilder sql = new StringBuilder("""
            SELECT *
              FROM habilidad
             WHERE 1 = 1
            """);

        List<Object> params = new ArrayList<>();

        if (soloActivas) {
            sql.append(" AND activo = TRUE");
        }

        if (categoriaId != null && categoriaId > 0) {
            sql.append(" AND categoria_id = ?");
            params.add(categoriaId);
        }

        sql.append(" ORDER BY nombre ASC");

        List<Habilidad> lista = new ArrayList<>();

        try (Connection cn = ConexionBD.getConnection();
             PreparedStatement ps = cn.prepareStatement(sql.toString())) {

            for (int i = 0; i < params.size(); i++) {
                ps.setObject(i + 1, params.get(i));
            }

            try (ResultSet rs = ps.executeQuery()) {

                while (rs.next()) {
                    lista.add(mapear(rs));
                }
            }
        }

        return lista;
    }

    /**
     * Habilidades de un freelancer.
     */
    public List<Habilidad> listarPorFreelancer(int freelancerPerfilId) throws SQLException {

        String sql = """
            SELECT h.*
              FROM habilidad h
              JOIN freelancer_habilidad fh
                ON fh.habilidad_id = h.id
             WHERE fh.freelancer_id = ?
               AND h.activo = TRUE
             ORDER BY h.nombre
            """;

        List<Habilidad> lista = new ArrayList<>();

        try (Connection cn = ConexionBD.getConnection();
             PreparedStatement ps = cn.prepareStatement(sql)) {

            ps.setInt(1, freelancerPerfilId);

            try (ResultSet rs = ps.executeQuery()) {

                while (rs.next()) {
                    lista.add(mapear(rs));
                }
            }
        }

        return lista;
    }

    /**
     * Habilidades requeridas por proyecto.
     */
    public List<Habilidad> listarPorProyecto(int proyectoId) throws SQLException {

        String sql = """
            SELECT h.*
              FROM habilidad h
              JOIN proyecto_habilidad ph
                ON ph.habilidad_id = h.id
             WHERE ph.proyecto_id = ?
               AND h.activo = TRUE
             ORDER BY h.nombre
            """;

        List<Habilidad> lista = new ArrayList<>();

        try (Connection cn = ConexionBD.getConnection();
             PreparedStatement ps = cn.prepareStatement(sql)) {

            ps.setInt(1, proyectoId);

            try (ResultSet rs = ps.executeQuery()) {

                while (rs.next()) {
                    lista.add(mapear(rs));
                }
            }
        }

        return lista;
    }

    /**
     * Activar/desactivar habilidad.
     */
    public boolean cambiarEstado(int id, boolean activo) throws SQLException {

        String sql = """
            UPDATE habilidad
               SET activo = ?
             WHERE id = ?
            """;

        try (Connection cn = ConexionBD.getConnection();
             PreparedStatement ps = cn.prepareStatement(sql)) {

            ps.setBoolean(1, activo);
            ps.setInt(2, id);

            return ps.executeUpdate() > 0;
        }
    }

    /**
     * Verificar existencia por nombre.
     */
    public boolean existePorNombre(String nombre) throws SQLException {

        String sql = """
            SELECT 1
              FROM habilidad
             WHERE LOWER(nombre) = LOWER(?)
             LIMIT 1
            """;

        try (Connection cn = ConexionBD.getConnection();
             PreparedStatement ps = cn.prepareStatement(sql)) {

            ps.setString(1, nombre);

            try (ResultSet rs = ps.executeQuery()) {
                return rs.next();
            }
        }
    }

    /**
     * Mapear entidad.
     */
    private Habilidad mapear(ResultSet rs) throws SQLException {

        Habilidad h = new Habilidad();

        h.setId(rs.getInt("id"));
        h.setCategoriaId(rs.getInt("categoria_id"));
        h.setNombre(rs.getString("nombre"));
        h.setDescripcion(rs.getString("descripcion"));
        h.setActivo(rs.getBoolean("activo"));

        return h;
    }
}