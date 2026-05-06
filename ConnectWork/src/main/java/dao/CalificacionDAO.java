package dao;

import config.ConexionBD;
import modelo.Calificacion;

import java.sql.*;

public class CalificacionDAO {

    public int crear(Calificacion c) throws SQLException {
        String sql = """
            INSERT INTO calificacion (contrato_id, cliente_id, freelancer_id, estrellas, comentario)
            VALUES (?,?,?,?,?)
            """;
        try (Connection cn = ConexionBD.getConnection();
             PreparedStatement ps = cn.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {
            ps.setInt(1, c.getContratoId());
            ps.setInt(2, c.getClienteId());
            ps.setInt(3, c.getFreelancerId());
            ps.setInt(4, c.getEstrellas());
            ps.setString(5, c.getComentario());
            ps.executeUpdate();
            try (ResultSet rs = ps.getGeneratedKeys()) {
                return rs.next() ? rs.getInt(1) : -1;
            }
        }
    }

    public Calificacion buscarPorContrato(int contratoId) throws SQLException {
        String sql = "SELECT * FROM calificacion WHERE contrato_id=?";
        try (Connection cn = ConexionBD.getConnection();
             PreparedStatement ps = cn.prepareStatement(sql)) {
            ps.setInt(1, contratoId);
            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) return mapear(rs);
            }
        }
        return null;
    }

    public boolean yaCalificado(int contratoId) throws SQLException {
        String sql = "SELECT 1 FROM calificacion WHERE contrato_id=?";
        try (Connection cn = ConexionBD.getConnection();
             PreparedStatement ps = cn.prepareStatement(sql)) {
            ps.setInt(1, contratoId);
            try (ResultSet rs = ps.executeQuery()) { return rs.next(); }
        }
    }

    private Calificacion mapear(ResultSet rs) throws SQLException {
        Calificacion c = new Calificacion();
        c.setId(rs.getInt("id"));
        c.setContratoId(rs.getInt("contrato_id"));
        c.setClienteId(rs.getInt("cliente_id"));
        c.setFreelancerId(rs.getInt("freelancer_id"));
        c.setEstrellas(rs.getInt("estrellas"));
        c.setComentario(rs.getString("comentario"));
        c.setCreatedAt(rs.getTimestamp("created_at").toLocalDateTime());
        return c;
    }
}