package dao;

import config.ConexionBD;
import modelo.SolicitudCategoria;
import modelo.SolicitudHabilidad;

import java.sql.*;
import java.util.ArrayList;
import java.util.List;


public class SolicitudDAO {

    // ═════════════════════════════════════════════════════════════
    // SOLICITUDES DE HABILIDAD
    // ═════════════════════════════════════════════════════════════

    /**
     * Crear solicitud de habilidad
     */
    public int crearSolicitudHabilidad(SolicitudHabilidad s) throws SQLException {

        String sql = """
            INSERT INTO solicitud_habilidad
            (freelancer_id, nombre, descripcion)
            VALUES (?,?,?)
            """;

        try (Connection cn = ConexionBD.getConnection();
             PreparedStatement ps = cn.prepareStatement(
                     sql,
                     Statement.RETURN_GENERATED_KEYS)) {

            ps.setInt(1, s.getFreelancerId());
            ps.setString(2, s.getNombre());
            ps.setString(3, s.getDescripcion());

            ps.executeUpdate();

            try (ResultSet rs = ps.getGeneratedKeys()) {

                if (rs.next()) {
                    return rs.getInt(1);
                }
            }
        }

        return -1;
    }

    /**
     * Buscar solicitud habilidad por ID
     */
    public SolicitudHabilidad buscarSolicitudHabilidad(int id) throws SQLException {

        String sql = """
            SELECT sh.*,
                   u.nombre_completo AS nombre_freelancer
              FROM solicitud_habilidad sh
              JOIN usuario u
                ON u.id = sh.freelancer_id
             WHERE sh.id = ?
            """;

        try (Connection cn = ConexionBD.getConnection();
             PreparedStatement ps = cn.prepareStatement(sql)) {

            ps.setInt(1, id);

            try (ResultSet rs = ps.executeQuery()) {

                if (rs.next()) {
                    return mapearHabilidad(rs);
                }
            }
        }

        return null;
    }

    /**
     * Listar solicitudes de habilidad
     */
    public List<SolicitudHabilidad> listarSolicitudesHabilidad(String estado)
            throws SQLException {

        StringBuilder sql = new StringBuilder("""
            SELECT sh.*,
                   u.nombre_completo AS nombre_freelancer
              FROM solicitud_habilidad sh
              JOIN usuario u
                ON u.id = sh.freelancer_id
            """);

        if (estado != null && !estado.isBlank()) {
            sql.append(" WHERE sh.estado = ?");
        }

        sql.append(" ORDER BY sh.created_at DESC");

        List<SolicitudHabilidad> lista = new ArrayList<>();

        try (Connection cn = ConexionBD.getConnection();
             PreparedStatement ps = cn.prepareStatement(sql.toString())) {

            if (estado != null && !estado.isBlank()) {
                ps.setString(1, estado);
            }

            try (ResultSet rs = ps.executeQuery()) {

                while (rs.next()) {
                    lista.add(mapearHabilidad(rs));
                }
            }
        }

        return lista;
    }

    /**
     * Resolver solicitud de habilidad
     */
    public boolean resolverSolicitudHabilidad(
            int id,
            String nuevoEstado,
            int adminId) throws SQLException {

        String sql = """
            UPDATE solicitud_habilidad
               SET estado = ?,
                   admin_revisor_id = ?
             WHERE id = ?
               AND estado = 'PENDIENTE'
            """;

        try (Connection cn = ConexionBD.getConnection();
             PreparedStatement ps = cn.prepareStatement(sql)) {

            ps.setString(1, nuevoEstado);
            ps.setInt(2, adminId);
            ps.setInt(3, id);

            return ps.executeUpdate() > 0;
        }
    }

    // ═════════════════════════════════════════════════════════════
    // SOLICITUDES DE CATEGORÍA
    // ═════════════════════════════════════════════════════════════

    /**
     * Crear solicitud categoría
     */
    public int crearSolicitudCategoria(SolicitudCategoria s)
            throws SQLException {

        String sql = """
            INSERT INTO solicitud_categoria
            (cliente_id, nombre, descripcion)
            VALUES (?,?,?)
            """;

        try (Connection cn = ConexionBD.getConnection();
             PreparedStatement ps = cn.prepareStatement(
                     sql,
                     Statement.RETURN_GENERATED_KEYS)) {

            ps.setInt(1, s.getClienteId());
            ps.setString(2, s.getNombre());
            ps.setString(3, s.getDescripcion());

            ps.executeUpdate();

            try (ResultSet rs = ps.getGeneratedKeys()) {

                if (rs.next()) {
                    return rs.getInt(1);
                }
            }
        }

        return -1;
    }

    /**
     * Buscar solicitud categoría por ID
     */
    public SolicitudCategoria buscarSolicitudCategoria(int id)
            throws SQLException {

        String sql = """
            SELECT sc.*,
                   u.nombre_completo AS nombre_cliente
              FROM solicitud_categoria sc
              JOIN usuario u
                ON u.id = sc.cliente_id
             WHERE sc.id = ?
            """;

        try (Connection cn = ConexionBD.getConnection();
             PreparedStatement ps = cn.prepareStatement(sql)) {

            ps.setInt(1, id);

            try (ResultSet rs = ps.executeQuery()) {

                if (rs.next()) {
                    return mapearCategoria(rs);
                }
            }
        }

        return null;
    }

    /**
     * Listar solicitudes categoría
     */
    public List<SolicitudCategoria> listarSolicitudesCategoria(String estado)
            throws SQLException {

        StringBuilder sql = new StringBuilder("""
            SELECT sc.*,
                   u.nombre_completo AS nombre_cliente
              FROM solicitud_categoria sc
              JOIN usuario u
                ON u.id = sc.cliente_id
            """);

        if (estado != null && !estado.isBlank()) {
            sql.append(" WHERE sc.estado = ?");
        }

        sql.append(" ORDER BY sc.created_at DESC");

        List<SolicitudCategoria> lista = new ArrayList<>();

        try (Connection cn = ConexionBD.getConnection();
             PreparedStatement ps = cn.prepareStatement(sql.toString())) {

            if (estado != null && !estado.isBlank()) {
                ps.setString(1, estado);
            }

            try (ResultSet rs = ps.executeQuery()) {

                while (rs.next()) {
                    lista.add(mapearCategoria(rs));
                }
            }
        }

        return lista;
    }

    /**
     * Resolver solicitud categoría
     */
    public boolean resolverSolicitudCategoria(
            int id,
            String nuevoEstado,
            int adminId) throws SQLException {

        String sql = """
            UPDATE solicitud_categoria
               SET estado = ?,
                   admin_revisor_id = ?
             WHERE id = ?
               AND estado = 'PENDIENTE'
            """;

        try (Connection cn = ConexionBD.getConnection();
             PreparedStatement ps = cn.prepareStatement(sql)) {

            ps.setString(1, nuevoEstado);
            ps.setInt(2, adminId);
            ps.setInt(3, id);

            return ps.executeUpdate() > 0;
        }
    }

    // ═════════════════════════════════════════════════════════════
    // MAPEADORES
    // ═════════════════════════════════════════════════════════════

    private SolicitudHabilidad mapearHabilidad(ResultSet rs)
            throws SQLException {

        SolicitudHabilidad s = new SolicitudHabilidad();

        s.setId(rs.getInt("id"));
        s.setFreelancerId(rs.getInt("freelancer_id"));
        s.setNombreFreelancer(rs.getString("nombre_freelancer"));
        s.setNombre(rs.getString("nombre"));
        s.setDescripcion(rs.getString("descripcion"));
        s.setEstado(rs.getString("estado"));

        int adminId = rs.getInt("admin_revisor_id");

        if (!rs.wasNull()) {
            s.setAdminRevisorId(adminId);
        }

        s.setCreatedAt(
                rs.getTimestamp("created_at").toLocalDateTime()
        );

        return s;
    }

    private SolicitudCategoria mapearCategoria(ResultSet rs)
            throws SQLException {

        SolicitudCategoria s = new SolicitudCategoria();

        s.setId(rs.getInt("id"));
        s.setClienteId(rs.getInt("cliente_id"));
        s.setNombreCliente(rs.getString("nombre_cliente"));
        s.setNombre(rs.getString("nombre"));
        s.setDescripcion(rs.getString("descripcion"));
        s.setEstado(rs.getString("estado"));

        int adminId = rs.getInt("admin_revisor_id");

        if (!rs.wasNull()) {
            s.setAdminRevisorId(adminId);
        }

        s.setCreatedAt(
                rs.getTimestamp("created_at").toLocalDateTime()
        );

        return s;
    }
}