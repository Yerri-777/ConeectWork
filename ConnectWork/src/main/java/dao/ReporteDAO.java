package dao;

import config.ConexionBD;

import java.sql.*;
import java.util.*;

public class ReporteDAO {

    // ════════════════════════════════════════════════════════════════════════
    //  REPORTES DE ADMINISTRADOR
    // ════════════════════════════════════════════════════════════════════════

    /** Top 5 freelancers con más ingresos en un intervalo */
    public List<Map<String, Object>> topFreelancers(String desde, String hasta) throws SQLException {
        String sql = """
            SELECT u.id, u.nombre_completo,
                   COUNT(c.id)                         AS contratos_completados,
                   SUM(c.monto - c.comision_monto)     AS total_generado,
                   SUM(c.comision_monto)               AS comision_plataforma
              FROM contrato c
              JOIN usuario u ON u.id = c.freelancer_id
             WHERE c.estado = 'COMPLETADO'
               AND c.fecha_completado BETWEEN ? AND ?
             GROUP BY u.id, u.nombre_completo
             ORDER BY total_generado DESC
             LIMIT 5
            """;
        return ejecutarReporte(sql, desde, hasta);
    }

    /** Top 5 categorías con más actividad en un intervalo */
    public List<Map<String, Object>> topCategorias(String desde, String hasta) throws SQLException {
        String sql = """
            SELECT cat.id, cat.nombre,
                   COUNT(c.id)            AS total_contratos,
                   SUM(c.comision_monto)  AS comisiones_generadas
              FROM contrato c
              JOIN proyecto p   ON p.id   = c.proyecto_id
              JOIN categoria cat ON cat.id = p.categoria_id
             WHERE c.estado = 'COMPLETADO'
               AND c.fecha_completado BETWEEN ? AND ?
             GROUP BY cat.id, cat.nombre
             ORDER BY total_contratos DESC
             LIMIT 5
            """;
        return ejecutarReporte(sql, desde, hasta);
    }

    /** Total de ingresos de la plataforma en un intervalo */
    public Map<String, Object> totalIngresos(String desde, String hasta) throws SQLException {
        String sql = """
            SELECT COUNT(sp.id)            AS contratos_completados,
                   COALESCE(SUM(sp.monto_comision), 0) AS total_comisiones
              FROM saldo_plataforma sp
             WHERE sp.created_at BETWEEN ? AND ?
            """;
        try (Connection cn = ConexionBD.getConnection();
             PreparedStatement ps = cn.prepareStatement(sql)) {
            ps.setString(1, desde);
            ps.setString(2, hasta);
            try (ResultSet rs = ps.executeQuery()) {
                Map<String, Object> row = new LinkedHashMap<>();
                if (rs.next()) {
                    row.put("contratosCompletados", rs.getInt("contratos_completados"));
                    row.put("totalComisiones",      rs.getBigDecimal("total_comisiones"));
                }
                return row;
            }
        }
    }

    // ════════════════════════════════════════════════════════════════════════
    //  REPORTES DE CLIENTE
    // ════════════════════════════════════════════════════════════════════════

    /** Historial de proyectos del cliente en un intervalo */
    public List<Map<String, Object>> historialProyectosCliente(int clienteId, String desde, String hasta) throws SQLException {
        String sql = """
            SELECT p.id, p.titulo, p.estado, p.created_at,
                   c.monto, c.fecha_completado,
                   u.nombre_completo AS freelancer
              FROM proyecto p
              LEFT JOIN contrato c ON c.proyecto_id = p.id
              LEFT JOIN usuario  u ON u.id = c.freelancer_id
             WHERE p.cliente_id = ?
               AND p.created_at BETWEEN ? AND ?
             ORDER BY p.created_at DESC
            """;
        List<Map<String, Object>> lista = new ArrayList<>();
        try (Connection cn = ConexionBD.getConnection();
             PreparedStatement ps = cn.prepareStatement(sql)) {
            ps.setInt(1, clienteId);
            ps.setString(2, desde);
            ps.setString(3, hasta);
            try (ResultSet rs = ps.executeQuery()) {
                while (rs.next()) {
                    Map<String, Object> row = new LinkedHashMap<>();
                    row.put("id",                rs.getInt("id"));
                    row.put("titulo",            rs.getString("titulo"));
                    row.put("estado",            rs.getString("estado"));
                    row.put("createdAt",         rs.getTimestamp("created_at").toLocalDateTime().toString());
                    row.put("monto",             rs.getBigDecimal("monto"));
                    row.put("freelancer",        rs.getString("freelancer"));
                    Timestamp fc = rs.getTimestamp("fecha_completado");
                    row.put("fechaCompletado",   fc != null ? fc.toLocalDateTime().toString() : null);
                    lista.add(row);
                }
            }
        }
        return lista;
    }

    /** Historial de recargas del cliente */
    public List<Map<String, Object>> historialRecargasCliente(int clienteId, String desde, String hasta) throws SQLException {
        String sql = """
            SELECT id, monto, created_at
              FROM recarga_saldo
             WHERE cliente_id = ?
               AND created_at BETWEEN ? AND ?
             ORDER BY created_at DESC
            """;
        List<Map<String, Object>> lista = new ArrayList<>();
        try (Connection cn = ConexionBD.getConnection();
             PreparedStatement ps = cn.prepareStatement(sql)) {
            ps.setInt(1, clienteId);
            ps.setString(2, desde);
            ps.setString(3, hasta);
            try (ResultSet rs = ps.executeQuery()) {
                while (rs.next()) {
                    Map<String, Object> row = new LinkedHashMap<>();
                    row.put("id",        rs.getInt("id"));
                    row.put("monto",     rs.getBigDecimal("monto"));
                    row.put("fecha",     rs.getTimestamp("created_at").toLocalDateTime().toString());
                    lista.add(row);
                }
            }
        }
        return lista;
    }

    /** Gasto por categoría del cliente en un intervalo */
    public List<Map<String, Object>> gastoPorCategoriaCliente(int clienteId, String desde, String hasta) throws SQLException {
        String sql = """
            SELECT cat.nombre AS categoria,
                   COUNT(c.id)    AS cantidad_contratos,
                   SUM(c.monto)   AS total_gastado
              FROM contrato c
              JOIN proyecto  p   ON p.id   = c.proyecto_id
              JOIN categoria cat ON cat.id = p.categoria_id
             WHERE c.cliente_id = ?
               AND c.estado = 'COMPLETADO'
               AND c.fecha_completado BETWEEN ? AND ?
             GROUP BY cat.id, cat.nombre
             ORDER BY total_gastado DESC
            """;
        List<Map<String, Object>> lista = new ArrayList<>();
        try (Connection cn = ConexionBD.getConnection();
             PreparedStatement ps = cn.prepareStatement(sql)) {
            ps.setInt(1, clienteId);
            ps.setString(2, desde);
            ps.setString(3, hasta);
            try (ResultSet rs = ps.executeQuery()) {
                while (rs.next()) {
                    Map<String, Object> row = new LinkedHashMap<>();
                    row.put("categoria",          rs.getString("categoria"));
                    row.put("cantidadContratos",  rs.getInt("cantidad_contratos"));
                    row.put("totalGastado",       rs.getBigDecimal("total_gastado"));
                    lista.add(row);
                }
            }
        }
        return lista;
    }

    // ════════════════════════════════════════════════════════════════════════
    //  REPORTES DE FREELANCER
    // ════════════════════════════════════════════════════════════════════════

    /** Historial de contratos completados del freelancer */
    public List<Map<String, Object>> historialContratosFreelancer(int freelancerId, String desde, String hasta) throws SQLException {
        String sql = """
            SELECT c.id, p.titulo AS proyecto, u.nombre_completo AS cliente,
                   c.monto - c.comision_monto AS monto_recibido,
                   cal.estrellas, cal.comentario, c.fecha_completado
              FROM contrato c
              JOIN proyecto    p   ON p.id  = c.proyecto_id
              JOIN usuario     u   ON u.id  = c.cliente_id
              LEFT JOIN calificacion cal ON cal.contrato_id = c.id
             WHERE c.freelancer_id = ?
               AND c.estado = 'COMPLETADO'
               AND c.fecha_completado BETWEEN ? AND ?
             ORDER BY c.fecha_completado DESC
            """;
        List<Map<String, Object>> lista = new ArrayList<>();
        try (Connection cn = ConexionBD.getConnection();
             PreparedStatement ps = cn.prepareStatement(sql)) {
            ps.setInt(1, freelancerId);
            ps.setString(2, desde);
            ps.setString(3, hasta);
            try (ResultSet rs = ps.executeQuery()) {
                while (rs.next()) {
                    Map<String, Object> row = new LinkedHashMap<>();
                    row.put("contratoId",      rs.getInt("id"));
                    row.put("proyecto",        rs.getString("proyecto"));
                    row.put("cliente",         rs.getString("cliente"));
                    row.put("montoRecibido",   rs.getBigDecimal("monto_recibido"));
                    row.put("estrellas",       rs.getObject("estrellas"));
                    row.put("comentario",      rs.getString("comentario"));
                    Timestamp fc = rs.getTimestamp("fecha_completado");
                    row.put("fechaCompletado", fc != null ? fc.toLocalDateTime().toString() : null);
                    lista.add(row);
                }
            }
        }
        return lista;
    }

    /** Top 5 categorías en las que más ha trabajado el freelancer */
    public List<Map<String, Object>> topCategoriasFreelancer(int freelancerId) throws SQLException {
        String sql = """
            SELECT cat.nombre AS categoria,
                   COUNT(c.id)                         AS cantidad_contratos,
                   SUM(c.monto - c.comision_monto)     AS total_ingresos
              FROM contrato c
              JOIN proyecto  p   ON p.id   = c.proyecto_id
              JOIN categoria cat ON cat.id = p.categoria_id
             WHERE c.freelancer_id = ?
               AND c.estado = 'COMPLETADO'
             GROUP BY cat.id, cat.nombre
             ORDER BY cantidad_contratos DESC
             LIMIT 5
            """;
        List<Map<String, Object>> lista = new ArrayList<>();
        try (Connection cn = ConexionBD.getConnection();
             PreparedStatement ps = cn.prepareStatement(sql)) {
            ps.setInt(1, freelancerId);
            try (ResultSet rs = ps.executeQuery()) {
                while (rs.next()) {
                    Map<String, Object> row = new LinkedHashMap<>();
                    row.put("categoria",         rs.getString("categoria"));
                    row.put("cantidadContratos", rs.getInt("cantidad_contratos"));
                    row.put("totalIngresos",     rs.getBigDecimal("total_ingresos"));
                    lista.add(row);
                }
            }
        }
        return lista;
    }

    /** Reporte de propuestas enviadas por el freelancer en un intervalo */
    public List<Map<String, Object>> propuestasFreelancer(int freelancerId, String desde, String hasta) throws SQLException {
        String sql = """
            SELECT pr.id, p.titulo AS proyecto, pr.monto_ofertado,
                   pr.plazo_dias, pr.estado, pr.created_at
              FROM propuesta pr
              JOIN proyecto p ON p.id = pr.proyecto_id
             WHERE pr.freelancer_id = ?
               AND pr.created_at BETWEEN ? AND ?
             ORDER BY pr.created_at DESC
            """;
        List<Map<String, Object>> lista = new ArrayList<>();
        try (Connection cn = ConexionBD.getConnection();
             PreparedStatement ps = cn.prepareStatement(sql)) {
            ps.setInt(1, freelancerId);
            ps.setString(2, desde);
            ps.setString(3, hasta);
            try (ResultSet rs = ps.executeQuery()) {
                while (rs.next()) {
                    Map<String, Object> row = new LinkedHashMap<>();
                    row.put("propuestaId",   rs.getInt("id"));
                    row.put("proyecto",      rs.getString("proyecto"));
                    row.put("montoOfertado", rs.getBigDecimal("monto_ofertado"));
                    row.put("plazoDias",     rs.getInt("plazo_dias"));
                    row.put("estado",        rs.getString("estado"));
                    row.put("fecha",         rs.getTimestamp("created_at").toLocalDateTime().toString());
                    lista.add(row);
                }
            }
        }
        return lista;
    }

    // ─── Helper ──────────────────────────────────────────────────────────────
    private List<Map<String, Object>> ejecutarReporte(String sql, String desde, String hasta) throws SQLException {
        List<Map<String, Object>> lista = new ArrayList<>();
        try (Connection cn = ConexionBD.getConnection();
             PreparedStatement ps = cn.prepareStatement(sql)) {
            ps.setString(1, desde);
            ps.setString(2, hasta);
            try (ResultSet rs = ps.executeQuery()) {
                ResultSetMetaData meta = rs.getMetaData();
                int cols = meta.getColumnCount();
                while (rs.next()) {
                    Map<String, Object> row = new LinkedHashMap<>();
                    for (int i = 1; i <= cols; i++) {
                        row.put(meta.getColumnLabel(i), rs.getObject(i));
                    }
                    lista.add(row);
                }
            }
        }
        return lista;
    }
}