package dao;

import config.ConexionBD;
import modelo.Entrega;

import java.sql.*;
import java.util.ArrayList;
import java.util.List;


public class EntregaDAO {

    /**
     * Crear nueva entrega.
     */
    public int crear(Entrega e) throws SQLException {

        String sql = """
            INSERT INTO entrega (
                contrato_id,
                descripcion,
                archivos_url
            ) VALUES (?, ?, ?)
            """;

        try (Connection cn = ConexionBD.getConnection();
             PreparedStatement ps = cn.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {

            ps.setInt(1, e.getContratoId());
            ps.setString(2, e.getDescripcion());
            ps.setString(3, e.getArchivosUrl());

            int affected = ps.executeUpdate();

            if (affected == 0) {
                throw new SQLException("No se pudo crear la entrega");
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
     * Aprobar entrega pendiente.
     */
    public boolean aprobar(int id) throws SQLException {

        String sql = """
            UPDATE entrega
               SET estado = 'APROBADA'
             WHERE id = ?
               AND estado = 'PENDIENTE'
            """;

        try (Connection cn = ConexionBD.getConnection();
             PreparedStatement ps = cn.prepareStatement(sql)) {

            ps.setInt(1, id);

            return ps.executeUpdate() > 0;
        }
    }

    /**
     * Rechazar entrega pendiente.
     */
    public boolean rechazar(int id, String motivo) throws SQLException {

        String sql = """
            UPDATE entrega
               SET estado = 'RECHAZADA',
                   motivo_rechazo = ?
             WHERE id = ?
               AND estado = 'PENDIENTE'
            """;

        try (Connection cn = ConexionBD.getConnection();
             PreparedStatement ps = cn.prepareStatement(sql)) {

            ps.setString(1, motivo);
            ps.setInt(2, id);

            return ps.executeUpdate() > 0;
        }
    }

    /**
     * Buscar entrega por ID.
     */
    public Entrega buscarPorId(int id) throws SQLException {

        String sql = "SELECT * FROM entrega WHERE id = ?";

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
     * Obtener última entrega pendiente de un contrato.
     */
    public Entrega buscarPendientePorContrato(int contratoId) throws SQLException {

        String sql = """
            SELECT *
              FROM entrega
             WHERE contrato_id = ?
               AND estado = 'PENDIENTE'
             ORDER BY created_at DESC
             LIMIT 1
            """;

        try (Connection cn = ConexionBD.getConnection();
             PreparedStatement ps = cn.prepareStatement(sql)) {

            ps.setInt(1, contratoId);

            try (ResultSet rs = ps.executeQuery()) {

                if (rs.next()) {
                    return mapear(rs);
                }
            }
        }

        return null;
    }

    /**
     * Listar entregas de un contrato.
     */
    public List<Entrega> listarPorContrato(int contratoId) throws SQLException {

        String sql = """
            SELECT *
              FROM entrega
             WHERE contrato_id = ?
             ORDER BY created_at DESC
            """;

        List<Entrega> lista = new ArrayList<>();

        try (Connection cn = ConexionBD.getConnection();
             PreparedStatement ps = cn.prepareStatement(sql)) {

            ps.setInt(1, contratoId);

            try (ResultSet rs = ps.executeQuery()) {

                while (rs.next()) {
                    lista.add(mapear(rs));
                }
            }
        }

        return lista;
    }

    /**
     * Verificar si existe entrega pendiente.
     */
    public boolean existePendiente(int contratoId) throws SQLException {

        String sql = """
            SELECT 1
              FROM entrega
             WHERE contrato_id = ?
               AND estado = 'PENDIENTE'
             LIMIT 1
            """;

        try (Connection cn = ConexionBD.getConnection();
             PreparedStatement ps = cn.prepareStatement(sql)) {

            ps.setInt(1, contratoId);

            try (ResultSet rs = ps.executeQuery()) {
                return rs.next();
            }
        }
    }

    /**
     * Mapear ResultSet.
     */
    private Entrega mapear(ResultSet rs) throws SQLException {

        Entrega e = new Entrega();

        e.setId(rs.getInt("id"));
        e.setContratoId(rs.getInt("contrato_id"));
        e.setDescripcion(rs.getString("descripcion"));
        e.setArchivosUrl(rs.getString("archivos_url"));
        e.setEstado(rs.getString("estado"));
        e.setMotivoRechazo(rs.getString("motivo_rechazo"));

        Timestamp created = rs.getTimestamp("created_at");

        if (created != null) {
            e.setCreatedAt(created.toLocalDateTime());
        }

        return e;
    }
}