package dao;

import config.ConexionBD;
import modelo.Categoria;

import java.sql.*;
import java.util.ArrayList;
import java.util.List;

public class CategoriaDAO {

    // ─────────────────────────────────────────────────────────────
    // Crear categoría
    // ─────────────────────────────────────────────────────────────
    public int crear(Categoria c) throws SQLException {

        String sql = """
            INSERT INTO categoria (
                nombre,
                descripcion
            )
            VALUES (?, ?)
            """;

        try (
            Connection cn = ConexionBD.getConnection();
            PreparedStatement ps = cn.prepareStatement(
                sql,
                Statement.RETURN_GENERATED_KEYS
            )
        ) {

            ps.setString(1, c.getNombre());
            ps.setString(2, c.getDescripcion());

            ps.executeUpdate();

            try (ResultSet rs = ps.getGeneratedKeys()) {
                return rs.next() ? rs.getInt(1) : -1;
            }
        }
    }

    // ─────────────────────────────────────────────────────────────
    // Actualizar categoría
    // ─────────────────────────────────────────────────────────────
    public boolean actualizar(Categoria c) throws SQLException {

        String sql = """
            UPDATE categoria
            SET nombre = ?,
                descripcion = ?
            WHERE id = ?
            """;

        try (
            Connection cn = ConexionBD.getConnection();
            PreparedStatement ps = cn.prepareStatement(sql)
        ) {

            ps.setString(1, c.getNombre());
            ps.setString(2, c.getDescripcion());
            ps.setInt(3, c.getId());

            return ps.executeUpdate() > 0;
        }
    }

    // ─────────────────────────────────────────────────────────────
    // Cambiar estado
    // ─────────────────────────────────────────────────────────────
    public boolean cambiarEstado(int id, boolean activo) throws SQLException {

        String sql = """
            UPDATE categoria
            SET activo = ?
            WHERE id = ?
            """;

        try (
            Connection cn = ConexionBD.getConnection();
            PreparedStatement ps = cn.prepareStatement(sql)
        ) {

            ps.setBoolean(1, activo);
            ps.setInt(2, id);

            return ps.executeUpdate() > 0;
        }
    }

    // ─────────────────────────────────────────────────────────────
    // Listar categorías
    // ─────────────────────────────────────────────────────────────
    public List<Categoria> listar(Boolean soloActivas) throws SQLException {

        String sql =
            Boolean.TRUE.equals(soloActivas)
            ? """
              SELECT id, nombre, descripcion, activo
              FROM categoria
              WHERE activo = TRUE
              ORDER BY nombre
              """
            : """
              SELECT id, nombre, descripcion, activo
              FROM categoria
              ORDER BY nombre
              """;

        List<Categoria> lista = new ArrayList<>();

        try (
            Connection cn = ConexionBD.getConnection();
            PreparedStatement ps = cn.prepareStatement(sql);
            ResultSet rs = ps.executeQuery()
        ) {

            while (rs.next()) {
                lista.add(mapear(rs));
            }
        }

        return lista;
    }

    // ─────────────────────────────────────────────────────────────
    // Buscar por ID
    // ─────────────────────────────────────────────────────────────
    public Categoria buscarPorId(int id) throws SQLException {

        String sql = """
            SELECT id, nombre, descripcion, activo
            FROM categoria
            WHERE id = ?
            LIMIT 1
            """;

        try (
            Connection cn = ConexionBD.getConnection();
            PreparedStatement ps = cn.prepareStatement(sql)
        ) {

            ps.setInt(1, id);

            try (ResultSet rs = ps.executeQuery()) {

                if (rs.next()) {
                    return mapear(rs);
                }
            }
        }

        return null;
    }

    // ─────────────────────────────────────────────────────────────
    // Verificar nombre existente
    // ─────────────────────────────────────────────────────────────
    public boolean existeNombre(String nombre) throws SQLException {

        String sql = """
            SELECT 1
            FROM categoria
            WHERE LOWER(nombre) = LOWER(?)
            LIMIT 1
            """;

        try (
            Connection cn = ConexionBD.getConnection();
            PreparedStatement ps = cn.prepareStatement(sql)
        ) {

            ps.setString(1, nombre);

            try (ResultSet rs = ps.executeQuery()) {
                return rs.next();
            }
        }
    }

    // ─────────────────────────────────────────────────────────────
    // Mapper
    // ─────────────────────────────────────────────────────────────
    private Categoria mapear(ResultSet rs) throws SQLException {

        Categoria c = new Categoria();

        c.setId(rs.getInt("id"));
        c.setNombre(rs.getString("nombre"));
        c.setDescripcion(rs.getString("descripcion"));
        c.setActivo(rs.getBoolean("activo"));

        return c;
    }
}