package dao;

import config.ConexionBD;
import modelo.PerfilCliente;
import modelo.PerfilFreelancer;

import java.sql.*;
import java.util.ArrayList;
import java.util.List;

public class PerfilDAO {

    // ════════════════════════════════════════════════════════════════
    // PERFIL CLIENTE
    // ════════════════════════════════════════════════════════════════

    public void crearPerfilCliente(PerfilCliente p) throws SQLException {

        String sql = """
            INSERT INTO perfil_cliente
            (usuario_id, descripcion, sector, sitio_web)
            VALUES (?, ?, ?, ?)
            """;

        try (
                Connection cn = ConexionBD.getConnection();
                PreparedStatement ps = cn.prepareStatement(sql)
        ) {

            ps.setInt(1, p.getUsuarioId());
            ps.setString(2, p.getDescripcion());
            ps.setString(3, p.getSector());
            ps.setString(4, p.getSitioWeb());

            ps.executeUpdate();
        }
    }

    public PerfilCliente buscarPerfilCliente(int usuarioId) throws SQLException {

        String sql = """
            SELECT *
              FROM perfil_cliente
             WHERE usuario_id = ?
            """;

        try (
                Connection cn = ConexionBD.getConnection();
                PreparedStatement ps = cn.prepareStatement(sql)
        ) {

            ps.setInt(1, usuarioId);

            try (ResultSet rs = ps.executeQuery()) {

                if (rs.next()) {
                    return mapearCliente(rs);
                }
            }
        }

        return null;
    }

    public boolean actualizarPerfilCliente(PerfilCliente p) throws SQLException {

        String sql = """
            UPDATE perfil_cliente
               SET descripcion = ?,
                   sector = ?,
                   sitio_web = ?
             WHERE usuario_id = ?
            """;

        try (
                Connection cn = ConexionBD.getConnection();
                PreparedStatement ps = cn.prepareStatement(sql)
        ) {

            ps.setString(1, p.getDescripcion());
            ps.setString(2, p.getSector());
            ps.setString(3, p.getSitioWeb());
            ps.setInt(4, p.getUsuarioId());

            return ps.executeUpdate() > 0;
        }
    }

    // ════════════════════════════════════════════════════════════════
    // PERFIL FREELANCER
    // ════════════════════════════════════════════════════════════════

    public void crearPerfilFreelancer(PerfilFreelancer p) throws SQLException {

        String sql = """
            INSERT INTO perfil_freelancer
            (usuario_id, biografia, nivel_experiencia, tarifa_hora)
            VALUES (?, ?, ?, ?)
            """;

        try (Connection cn = ConexionBD.getConnection()) {

            cn.setAutoCommit(false);

            try {

                int perfilId;

                try (
                        PreparedStatement ps = cn.prepareStatement(
                                sql,
                                Statement.RETURN_GENERATED_KEYS
                        )
                ) {

                    ps.setInt(1, p.getUsuarioId());
                    ps.setString(2, p.getBiografia());
                    ps.setString(3, p.getNivelExperiencia());
                    ps.setBigDecimal(4, p.getTarifaHora());

                    ps.executeUpdate();

                    try (ResultSet rs = ps.getGeneratedKeys()) {

                        if (!rs.next()) {
                            throw new SQLException("No se pudo generar ID perfil freelancer");
                        }

                        perfilId = rs.getInt(1);
                    }
                }

                if (p.getHabilidadesIds() != null &&
                    !p.getHabilidadesIds().isEmpty()) {

                    insertarHabilidadesFreelancer(
                            cn,
                            perfilId,
                            p.getHabilidadesIds()
                    );
                }

                cn.commit();

            } catch (SQLException e) {

                cn.rollback();
                throw e;
            }
        }
    }

    public PerfilFreelancer buscarPerfilFreelancer(int usuarioId) throws SQLException {

        String sql = """
            SELECT *
              FROM perfil_freelancer
             WHERE usuario_id = ?
            """;

        try (
                Connection cn = ConexionBD.getConnection();
                PreparedStatement ps = cn.prepareStatement(sql)
        ) {

            ps.setInt(1, usuarioId);

            try (ResultSet rs = ps.executeQuery()) {

                if (rs.next()) {

                    PerfilFreelancer p = mapearFreelancer(rs);

                    p.setHabilidadesIds(
                            obtenerHabilidadesIds(cn, p.getId())
                    );

                    return p;
                }
            }
        }

        return null;
    }

    public boolean actualizarPerfilFreelancer(PerfilFreelancer p) throws SQLException {

        String sql = """
            UPDATE perfil_freelancer
               SET biografia = ?,
                   nivel_experiencia = ?,
                   tarifa_hora = ?
             WHERE usuario_id = ?
            """;

        try (Connection cn = ConexionBD.getConnection()) {

            cn.setAutoCommit(false);

            try {

                int filas;

                try (PreparedStatement ps = cn.prepareStatement(sql)) {

                    ps.setString(1, p.getBiografia());
                    ps.setString(2, p.getNivelExperiencia());
                    ps.setBigDecimal(3, p.getTarifaHora());
                    ps.setInt(4, p.getUsuarioId());

                    filas = ps.executeUpdate();
                }

                if (filas == 0) {
                    cn.rollback();
                    return false;
                }

                int perfilId = obtenerPerfilId(cn, p.getUsuarioId());

                eliminarHabilidadesFreelancer(cn, perfilId);

                if (p.getHabilidadesIds() != null &&
                    !p.getHabilidadesIds().isEmpty()) {

                    insertarHabilidadesFreelancer(
                            cn,
                            perfilId,
                            p.getHabilidadesIds()
                    );
                }

                cn.commit();

                return true;

            } catch (SQLException e) {

                cn.rollback();
                throw e;
            }
        }
    }

    public void recalcularCalificacion(int freelancerId) throws SQLException {

        String sql = """
            UPDATE perfil_freelancer pf
               SET calificacion_promedio = (
                   SELECT COALESCE(AVG(c.estrellas), 0)
                     FROM calificacion c
                    WHERE c.freelancer_id = pf.usuario_id
               ),
               total_calificaciones = (
                   SELECT COUNT(*)
                     FROM calificacion c
                    WHERE c.freelancer_id = pf.usuario_id
               )
             WHERE pf.usuario_id = ?
            """;

        try (
                Connection cn = ConexionBD.getConnection();
                PreparedStatement ps = cn.prepareStatement(sql)
        ) {

            ps.setInt(1, freelancerId);

            ps.executeUpdate();
        }
    }

    // ════════════════════════════════════════════════════════════════
    // HELPERS
    // ════════════════════════════════════════════════════════════════

    private int obtenerPerfilId(Connection cn, int usuarioId)
            throws SQLException {

        String sql = """
            SELECT id
              FROM perfil_freelancer
             WHERE usuario_id = ?
            """;

        try (PreparedStatement ps = cn.prepareStatement(sql)) {

            ps.setInt(1, usuarioId);

            try (ResultSet rs = ps.executeQuery()) {

                if (rs.next()) {
                    return rs.getInt("id");
                }
            }
        }

        throw new SQLException("Perfil freelancer no encontrado");
    }

    private void eliminarHabilidadesFreelancer(
            Connection cn,
            int perfilId
    ) throws SQLException {

        String sql = """
            DELETE FROM freelancer_habilidad
             WHERE freelancer_id = ?
            """;

        try (PreparedStatement ps = cn.prepareStatement(sql)) {

            ps.setInt(1, perfilId);

            ps.executeUpdate();
        }
    }

    private void insertarHabilidadesFreelancer(
            Connection cn,
            int perfilId,
            List<Integer> ids
    ) throws SQLException {

        String sql = """
            INSERT INTO freelancer_habilidad
            (freelancer_id, habilidad_id)
            VALUES (?, ?)
            """;

        try (PreparedStatement ps = cn.prepareStatement(sql)) {

            for (Integer id : ids) {

                ps.setInt(1, perfilId);
                ps.setInt(2, id);

                ps.addBatch();
            }

            ps.executeBatch();
        }
    }

    private List<Integer> obtenerHabilidadesIds(
            Connection cn,
            int perfilId
    ) throws SQLException {

        List<Integer> ids = new ArrayList<>();

        String sql = """
            SELECT habilidad_id
              FROM freelancer_habilidad
             WHERE freelancer_id = ?
            """;

        try (PreparedStatement ps = cn.prepareStatement(sql)) {

            ps.setInt(1, perfilId);

            try (ResultSet rs = ps.executeQuery()) {

                while (rs.next()) {
                    ids.add(rs.getInt("habilidad_id"));
                }
            }
        }

        return ids;
    }

    // ════════════════════════════════════════════════════════════════
    // MAPPERS
    // ════════════════════════════════════════════════════════════════

    private PerfilCliente mapearCliente(ResultSet rs)
            throws SQLException {

        PerfilCliente p = new PerfilCliente();

        p.setId(rs.getInt("id"));
        p.setUsuarioId(rs.getInt("usuario_id"));
        p.setDescripcion(rs.getString("descripcion"));
        p.setSector(rs.getString("sector"));
        p.setSitioWeb(rs.getString("sitio_web"));

        return p;
    }

    private PerfilFreelancer mapearFreelancer(ResultSet rs)
            throws SQLException {

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