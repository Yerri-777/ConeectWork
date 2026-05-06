package dao;

import config.ConexionBD;
import modelo.PerfilCliente;
import modelo.PerfilFreelancer;

import java.sql.*;

public class PerfilDAO {

    // ════════════════════════════════════════════════════════════════════════
    //  PERFIL CLIENTE
    // ════════════════════════════════════════════════════════════════════════

    public void crearPerfilCliente(PerfilCliente p) throws SQLException {
        String sql = "INSERT INTO perfil_cliente (usuario_id, descripcion, sector, sitio_web) VALUES (?,?,?,?)";
        try (Connection cn = ConexionBD.getConnection();
             PreparedStatement ps = cn.prepareStatement(sql)) {
            ps.setInt(1, p.getUsuarioId());
            ps.setString(2, p.getDescripcion());
            ps.setString(3, p.getSector());
            ps.setString(4, p.getSitioWeb());
            ps.executeUpdate();
        }
    }

    public PerfilCliente buscarPerfilCliente(int usuarioId) throws SQLException {
        String sql = "SELECT * FROM perfil_cliente WHERE usuario_id = ?";
        try (Connection cn = ConexionBD.getConnection();
             PreparedStatement ps = cn.prepareStatement(sql)) {
            ps.setInt(1, usuarioId);
            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) return mapearCliente(rs);
            }
        }
        return null;
    }

    public boolean actualizarPerfilCliente(PerfilCliente p) throws SQLException {
        String sql = "UPDATE perfil_cliente SET descripcion=?, sector=?, sitio_web=? WHERE usuario_id=?";
        try (Connection cn = ConexionBD.getConnection();
             PreparedStatement ps = cn.prepareStatement(sql)) {
            ps.setString(1, p.getDescripcion());
            ps.setString(2, p.getSector());
            ps.setString(3, p.getSitioWeb());
            ps.setInt(4, p.getUsuarioId());
            return ps.executeUpdate() > 0;
        }
    }

    // ════════════════════════════════════════════════════════════════════════
    //  PERFIL FREELANCER
    // ════════════════════════════════════════════════════════════════════════

    public void crearPerfilFreelancer(PerfilFreelancer p) throws SQLException {
        String sqlPerfil = """
            INSERT INTO perfil_freelancer (usuario_id, biografia, nivel_experiencia, tarifa_hora)
            VALUES (?,?,?,?)
            """;
        try (Connection cn = ConexionBD.getConnection()) {
            cn.setAutoCommit(false);
            try {
                int perfilId;
                try (PreparedStatement ps = cn.prepareStatement(sqlPerfil, Statement.RETURN_GENERATED_KEYS)) {
                    ps.setInt(1, p.getUsuarioId());
                    ps.setString(2, p.getBiografia());
                    ps.setString(3, p.getNivelExperiencia());
                    ps.setBigDecimal(4, p.getTarifaHora());
                    ps.executeUpdate();
                    try (ResultSet rs = ps.getGeneratedKeys()) {
                        rs.next();
                        perfilId = rs.getInt(1);
                    }
                }
                // Insertar habilidades
                if (p.getHabilidadesIds() != null) {
                    insertarHabilidadesFreelancer(cn, perfilId, p.getHabilidadesIds());
                }
                cn.commit();
            } catch (SQLException e) {
                cn.rollback();
                throw e;
            }
        }
    }

    public PerfilFreelancer buscarPerfilFreelancer(int usuarioId) throws SQLException {
        String sql = "SELECT * FROM perfil_freelancer WHERE usuario_id = ?";
        try (Connection cn = ConexionBD.getConnection();
             PreparedStatement ps = cn.prepareStatement(sql)) {
            ps.setInt(1, usuarioId);
            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) return mapearFreelancer(rs);
            }
        }
        return null;
    }

    public boolean actualizarPerfilFreelancer(PerfilFreelancer p) throws SQLException {
        String sql = """
            UPDATE perfil_freelancer
               SET biografia=?, nivel_experiencia=?, tarifa_hora=?
             WHERE usuario_id=?
            """;
        try (Connection cn = ConexionBD.getConnection()) {
            cn.setAutoCommit(false);
            try {
                int perfilId;
                try (PreparedStatement ps = cn.prepareStatement(sql)) {
                    ps.setString(1, p.getBiografia());
                    ps.setString(2, p.getNivelExperiencia());
                    ps.setBigDecimal(3, p.getTarifaHora());
                    ps.setInt(4, p.getUsuarioId());
                    ps.executeUpdate();
                }
                // Obtener id del perfil
                try (PreparedStatement ps = cn.prepareStatement(
                        "SELECT id FROM perfil_freelancer WHERE usuario_id=?")) {
                    ps.setInt(1, p.getUsuarioId());
                    try (ResultSet rs = ps.executeQuery()) {
                        rs.next();
                        perfilId = rs.getInt(1);
                    }
                }
                // Reemplazar habilidades
                if (p.getHabilidadesIds() != null) {
                    try (PreparedStatement ps = cn.prepareStatement(
                            "DELETE FROM freelancer_habilidad WHERE freelancer_id=?")) {
                        ps.setInt(1, perfilId);
                        ps.executeUpdate();
                    }
                    insertarHabilidadesFreelancer(cn, perfilId, p.getHabilidadesIds());
                }
                cn.commit();
                return true;
            } catch (SQLException e) {
                cn.rollback();
                throw e;
            }
        }
    }

    private void insertarHabilidadesFreelancer(Connection cn, int perfilId,
                                               java.util.List<Integer> ids) throws SQLException {
        String sql = "INSERT INTO freelancer_habilidad (freelancer_id, habilidad_id) VALUES (?,?)";
        try (PreparedStatement ps = cn.prepareStatement(sql)) {
            for (int habId : ids) {
                ps.setInt(1, perfilId);
                ps.setInt(2, habId);
                ps.addBatch();
            }
            ps.executeBatch();
        }
    }

    // ─── Recalcular calificación promedio del freelancer ─────────────────────
    public void recalcularCalificacion(int freelancerId) throws SQLException {
        String sql = """
            UPDATE perfil_freelancer pf
               SET calificacion_promedio = (
                       SELECT COALESCE(AVG(c.estrellas), 0)
                         FROM calificacion c WHERE c.freelancer_id = pf.usuario_id
                   ),
                   total_calificaciones = (
                       SELECT COUNT(*) FROM calificacion c WHERE c.freelancer_id = pf.usuario_id
                   )
             WHERE pf.usuario_id = ?
            """;
        try (Connection cn = ConexionBD.getConnection();
             PreparedStatement ps = cn.prepareStatement(sql)) {
            ps.setInt(1, freelancerId);
            ps.executeUpdate();
        }
    }

    // ─── Mapeadores ──────────────────────────────────────────────────────────
    private PerfilCliente mapearCliente(ResultSet rs) throws SQLException {
        PerfilCliente p = new PerfilCliente();
        p.setId(rs.getInt("id"));
        p.setUsuarioId(rs.getInt("usuario_id"));
        p.setDescripcion(rs.getString("descripcion"));
        p.setSector(rs.getString("sector"));
        p.setSitioWeb(rs.getString("sitio_web"));
        return p;
    }

    private PerfilFreelancer mapearFreelancer(ResultSet rs) throws SQLException {
        PerfilFreelancer p = new PerfilFreelancer();
        p.setId(rs.getInt("id"));
        p.setUsuarioId(rs.getInt("usuario_id"));
        p.setBiografia(rs.getString("biografia"));
        p.setNivelExperiencia(rs.getString("nivel_experiencia"));
        p.setTarifaHora(rs.getBigDecimal("tarifa_hora"));
        p.setCalificacionPromedio(rs.getBigDecimal("calificacion_promedio"));
        p.setTotalCalificaciones(rs.getInt("total_calificaciones"));
        return p;
    }
}