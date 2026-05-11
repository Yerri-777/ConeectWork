package dao;

import config.ConexionBD;
import modelo.Propuesta;

import java.sql.*;
import java.util.ArrayList;
import java.util.List;

public class PropuestaDAO {

    // ─────────────────────────────────────────────────────────────
    // ENVIAR PROPUESTA
    // ─────────────────────────────────────────────────────────────
    public int enviar(Propuesta p) throws SQLException {

        String validarProyecto = """
            SELECT estado
              FROM proyecto
             WHERE id = ?
            """;

        String validarDuplicada = """
            SELECT 1
              FROM propuesta
             WHERE proyecto_id = ?
               AND freelancer_id = ?
            """;

        String insert = """
            INSERT INTO propuesta (
                proyecto_id,
                freelancer_id,
                monto_ofertado,
                plazo_dias,
                carta_presentacion
            )
            VALUES (?,?,?,?,?)
            """;

        try (Connection cn = ConexionBD.getConnection()) {

            // validar proyecto abierto
            try (PreparedStatement ps = cn.prepareStatement(validarProyecto)) {

                ps.setInt(1, p.getProyectoId());

                try (ResultSet rs = ps.executeQuery()) {

                    if (!rs.next()) {
                        throw new SQLException("Proyecto no encontrado");
                    }

                    if (!"ABIERTO".equals(rs.getString("estado"))) {
                        throw new SQLException("El proyecto no está abierto");
                    }
                }
            }

            // validar duplicada
            try (PreparedStatement ps = cn.prepareStatement(validarDuplicada)) {

                ps.setInt(1, p.getProyectoId());
                ps.setInt(2, p.getFreelancerId());

                try (ResultSet rs = ps.executeQuery()) {

                    if (rs.next()) {
                        throw new SQLException("Ya enviaste propuesta a este proyecto");
                    }
                }
            }

            // insertar
            try (PreparedStatement ps = cn.prepareStatement(
                    insert,
                    Statement.RETURN_GENERATED_KEYS)) {

                ps.setInt(1, p.getProyectoId());
                ps.setInt(2, p.getFreelancerId());
                ps.setBigDecimal(3, p.getMontoOfertado());
                ps.setInt(4, p.getPlazoDias());
                ps.setString(5, p.getCartaPresentacion());

                ps.executeUpdate();

                try (ResultSet rs = ps.getGeneratedKeys()) {

                    if (rs.next()) {
                        return rs.getInt(1);
                    }
                }
            }
        }

        return -1;
    }

    // ─────────────────────────────────────────────────────────────
    // CAMBIAR ESTADO
    // ─────────────────────────────────────────────────────────────
    public boolean cambiarEstado(int id, String estado) throws SQLException {

        String sql = """
            UPDATE propuesta
               SET estado = ?
             WHERE id = ?
            """;

        try (Connection cn = ConexionBD.getConnection();
             PreparedStatement ps = cn.prepareStatement(sql)) {

            ps.setString(1, estado);
            ps.setInt(2, id);

            return ps.executeUpdate() > 0;
        }
    }

    // ─────────────────────────────────────────────────────────────
    // RETIRAR PROPUESTA
    // ─────────────────────────────────────────────────────────────
    public boolean retirar(int propuestaId, int freelancerId) throws SQLException {

        String sql = """
            UPDATE propuesta
               SET estado = 'RETIRADA'
             WHERE id = ?
               AND freelancer_id = ?
               AND estado = 'PENDIENTE'
               AND EXISTS (
                    SELECT 1
                      FROM proyecto p
                     WHERE p.id = propuesta.proyecto_id
                       AND p.estado = 'ABIERTO'
               )
            """;

        try (Connection cn = ConexionBD.getConnection();
             PreparedStatement ps = cn.prepareStatement(sql)) {

            ps.setInt(1, propuestaId);
            ps.setInt(2, freelancerId);

            return ps.executeUpdate() > 0;
        }
    }

    // ─────────────────────────────────────────────────────────────
    // BUSCAR POR ID
    // ─────────────────────────────────────────────────────────────
    public Propuesta buscarPorId(int id) throws SQLException {

        String sql = sqlBase() + """
             WHERE pr.id = ?
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

    // ─────────────────────────────────────────────────────────────
    // LISTAR POR PROYECTO
    // ─────────────────────────────────────────────────────────────
    public List<Propuesta> listarPorProyecto(int proyectoId) throws SQLException {

        String sql = sqlBase() + """
             WHERE pr.proyecto_id = ?
             ORDER BY pr.created_at DESC
            """;

        return ejecutarLista(sql, proyectoId);
    }

    // ─────────────────────────────────────────────────────────────
    // LISTAR POR FREELANCER
    // ─────────────────────────────────────────────────────────────
    public List<Propuesta> listarPorFreelancer(int freelancerId) throws SQLException {

        String sql = sqlBase() + """
             WHERE pr.freelancer_id = ?
             ORDER BY pr.created_at DESC
            """;

        return ejecutarLista(sql, freelancerId);
    }

    // ─────────────────────────────────────────────────────────────
    // RECHAZAR OTRAS
    // ─────────────────────────────────────────────────────────────
    public void rechazarOtras(int proyectoId, int propuestaAceptadaId)
            throws SQLException {

        String sql = """
            UPDATE propuesta
               SET estado = 'RECHAZADA'
             WHERE proyecto_id = ?
               AND id <> ?
               AND estado = 'PENDIENTE'
            """;

        try (Connection cn = ConexionBD.getConnection();
             PreparedStatement ps = cn.prepareStatement(sql)) {

            ps.setInt(1, proyectoId);
            ps.setInt(2, propuestaAceptadaId);

            ps.executeUpdate();
        }
    }

    // ─────────────────────────────────────────────────────────────
    // VALIDAR HABILIDADES
    // ─────────────────────────────────────────────────────────────
    public boolean freelancerCumpleHabilidades(
            int freelancerUsuarioId,
            int proyectoId) throws SQLException {

        String sql = """
            SELECT 1
              FROM freelancer_habilidad fh
              JOIN perfil_freelancer pf
                ON pf.id = fh.freelancer_id
              JOIN proyecto_habilidad ph
                ON ph.habilidad_id = fh.habilidad_id
             WHERE pf.usuario_id = ?
               AND ph.proyecto_id = ?
             LIMIT 1
            """;

        try (Connection cn = ConexionBD.getConnection();
             PreparedStatement ps = cn.prepareStatement(sql)) {

            ps.setInt(1, freelancerUsuarioId);
            ps.setInt(2, proyectoId);

            try (ResultSet rs = ps.executeQuery()) {
                return rs.next();
            }
        }
    }

    // ─────────────────────────────────────────────────────────────
    // HELPERS
    // ─────────────────────────────────────────────────────────────

    private String sqlBase() {

        return """
            SELECT pr.*,
                   u.nombre_completo AS nombre_freelancer,
                   pf.calificacion_promedio,
                   p.titulo AS titulo_proyecto
              FROM propuesta pr
              JOIN usuario u
                ON u.id = pr.freelancer_id
              JOIN perfil_freelancer pf
                ON pf.usuario_id = pr.freelancer_id
              JOIN proyecto p
                ON p.id = pr.proyecto_id
            """;
    }

    private List<Propuesta> ejecutarLista(String sql, int param)
            throws SQLException {

        List<Propuesta> lista = new ArrayList<>();

        try (Connection cn = ConexionBD.getConnection();
             PreparedStatement ps = cn.prepareStatement(sql)) {

            ps.setInt(1, param);

            try (ResultSet rs = ps.executeQuery()) {

                while (rs.next()) {
                    lista.add(mapear(rs));
                }
            }
        }

        return lista;
    }

    private Propuesta mapear(ResultSet rs) throws SQLException {

        Propuesta p = new Propuesta();

        p.setId(rs.getInt("id"));
        p.setProyectoId(rs.getInt("proyecto_id"));
        p.setTituloProyecto(rs.getString("titulo_proyecto"));

        p.setFreelancerId(rs.getInt("freelancer_id"));
        p.setNombreFreelancer(rs.getString("nombre_freelancer"));
        p.setCalificacionFreelancer(
                rs.getBigDecimal("calificacion_promedio"));

        p.setMontoOfertado(rs.getBigDecimal("monto_ofertado"));
        p.setPlazoDias(rs.getInt("plazo_dias"));
        p.setCartaPresentacion(rs.getString("carta_presentacion"));

        p.setEstado(rs.getString("estado"));

        Timestamp created = rs.getTimestamp("created_at");

        if (created != null) {
            p.setCreatedAt(created.toLocalDateTime());
        }

        return p;
    }
}