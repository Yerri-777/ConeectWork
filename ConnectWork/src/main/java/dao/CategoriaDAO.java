package dao;

import config.ConexionBD;
import modelo.Categoria;
import modelo.Habilidad;

import java.sql.*;
import java.util.ArrayList;
import java.util.List;

public class CategoriaDAO {

    public int crear(Categoria c) throws SQLException {
        String sql = "INSERT INTO categoria (nombre, descripcion) VALUES (?,?)";
        try (Connection cn = ConexionBD.getConnection();
                PreparedStatement ps = cn.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {
            ps.setString(1, c.getNombre());
            ps.setString(2, c.getDescripcion());
            ps.executeUpdate();
            try (ResultSet rs = ps.getGeneratedKeys()) {
                return rs.next() ? rs.getInt(1) : -1;
            }
        }
    }

    public boolean actualizar(Categoria c) throws SQLException {
        String sql = "UPDATE categoria SET nombre=?, descripcion=? WHERE id=?";
        try (Connection cn = ConexionBD.getConnection();
                PreparedStatement ps = cn.prepareStatement(sql)) {
            ps.setString(1, c.getNombre());
            ps.setString(2, c.getDescripcion());
            ps.setInt(3, c.getId());
            return ps.executeUpdate() > 0;
        }
    }

    public boolean cambiarEstado(int id, boolean activo) throws SQLException {
        String sql = "UPDATE categoria SET activo=? WHERE id=?";
        try (Connection cn = ConexionBD.getConnection();
                PreparedStatement ps = cn.prepareStatement(sql)) {
            ps.setBoolean(1, activo);
            ps.setInt(2, id);
            return ps.executeUpdate() > 0;
        }
    }

    public List<Categoria> listar(Boolean soloActivas) throws SQLException {
        String sql = soloActivas != null && soloActivas
                ? "SELECT * FROM categoria WHERE activo = TRUE ORDER BY nombre"
                : "SELECT * FROM categoria ORDER BY nombre";
        List<Categoria> lista = new ArrayList<>();
        try (Connection cn = ConexionBD.getConnection();
                PreparedStatement ps = cn.prepareStatement(sql);
                ResultSet rs = ps.executeQuery()) {
            while (rs.next())
                lista.add(mapear(rs));
        }
        return lista;
    }

    public Categoria buscarPorId(int id) throws SQLException {
        String sql = "SELECT * FROM categoria WHERE id=?";
        try (Connection cn = ConexionBD.getConnection();
                PreparedStatement ps = cn.prepareStatement(sql)) {
            ps.setInt(1, id);
            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next())
                    return mapear(rs);
            }
        }
        return null;
    }

    private Categoria mapear(ResultSet rs) throws SQLException {
        Categoria c = new Categoria();
        c.setId(rs.getInt("id"));
        c.setNombre(rs.getString("nombre"));
        c.setDescripcion(rs.getString("descripcion"));
        c.setActivo(rs.getBoolean("activo"));
        return c;
    }
}