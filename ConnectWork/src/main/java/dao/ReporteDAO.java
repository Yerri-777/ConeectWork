package dao;

import config.ConexionBD;

import java.math.BigDecimal;
import java.sql.*;
import java.util.*;

public class ReporteDAO {

    // ════════════════════════════════════════════════════════════════════════
    // REPORTES ADMIN
    // ════════════════════════════════════════════════════════════════════════

    public List<Map<String, Object>> topFreelancers(
            String desde,
            String hasta
    ) throws SQLException {

        String sql = """
            SELECT 
                u.id,
                u.nombre_completo,
                COUNT(c.id) AS contratos_completados,
                COALESCE(SUM(c.monto - c.comision_monto),0) AS total_generado,
                COALESCE(SUM(c.comision_monto),0) AS comision_plataforma
            FROM contrato c
            INNER JOIN usuario u
                    ON u.id = c.freelancer_id
            WHERE c.estado = 'COMPLETADO'
              AND c.fecha_completado BETWEEN ? AND ?
            GROUP BY u.id, u.nombre_completo
            ORDER BY total_generado DESC
            LIMIT 5
            """;

        return ejecutarReporte(sql, desde, hasta);
    }

    public List<Map<String, Object>> topCategorias(
            String desde,
            String hasta
    ) throws SQLException {

        String sql = """
            SELECT 
                cat.id,
                cat.nombre,
                COUNT(c.id) AS total_contratos,
                COALESCE(SUM(c.comision_monto),0) AS comisiones_generadas
            FROM contrato c
            INNER JOIN proyecto p
                    ON p.id = c.proyecto_id
            INNER JOIN categoria cat
                    ON cat.id = p.categoria_id
            WHERE c.estado = 'COMPLETADO'
              AND c.fecha_completado BETWEEN ? AND ?
            GROUP BY cat.id, cat.nombre
            ORDER BY total_contratos DESC
            LIMIT 5
            """;

        return ejecutarReporte(sql, desde, hasta);
    }

    public Map<String, Object> totalIngresos(
            String desde,
            String hasta
    ) throws SQLException {

        String sql = """
            SELECT
                COUNT(id) AS contratos_completados,
                COALESCE(SUM(monto_comision),0) AS total_comisiones
            FROM saldo_plataforma
            WHERE created_at BETWEEN ? AND ?
            """;

        Map<String, Object> row = new LinkedHashMap<>();

        try (
                Connection cn = ConexionBD.getConnection();
                PreparedStatement ps = cn.prepareStatement(sql)
        ) {

            ps.setString(1, desde);
            ps.setString(2, hasta);

            try (ResultSet rs = ps.executeQuery()) {

                if (rs.next()) {

                    row.put(
                            "contratosCompletados",
                            rs.getInt("contratos_completados")
                    );

                    row.put(
                            "totalComisiones",
                            rs.getBigDecimal("total_comisiones")
                    );
                }
            }
        }

        return row;
    }

    // ════════════════════════════════════════════════════════════════════════
    // CONTADORES ADMIN
    // ════════════════════════════════════════════════════════════════════════

    public int contarFreelancers() throws SQLException {
        return ejecutarCount(
                "SELECT COUNT(*) FROM usuario WHERE rol='FREELANCER'"
        );
    }

    public int contarClientes() throws SQLException {
        return ejecutarCount(
                "SELECT COUNT(*) FROM usuario WHERE rol='CLIENTE'"
        );
    }

    public int contarContratosActivos() throws SQLException {
        return ejecutarCount(
                "SELECT COUNT(*) FROM contrato WHERE estado='ACTIVO'"
        );
    }

    public int contarContratosCompletados() throws SQLException {
        return ejecutarCount(
                "SELECT COUNT(*) FROM contrato WHERE estado='COMPLETADO'"
        );
    }

    public int contarProyectosTotales() throws SQLException {
        return ejecutarCount(
                "SELECT COUNT(*) FROM proyecto"
        );
    }

    public int contarCategorias() throws SQLException {
        return ejecutarCount(
                "SELECT COUNT(*) FROM categoria WHERE activo = 1"
        );
    }

    public int contarHabilidades() throws SQLException {
        return ejecutarCount(
                "SELECT COUNT(*) FROM habilidad WHERE activo = 1"
        );
    }

    // ════════════════════════════════════════════════════════════════════════
    // REPORTES CLIENTE
    // ════════════════════════════════════════════════════════════════════════

    public List<Map<String, Object>> historialProyectosCliente(
            int clienteId,
            String desde,
            String hasta
    ) throws SQLException {

        String sql = """
            SELECT
                p.id,
                p.titulo,
                p.estado,
                p.created_at,
                c.monto,
                c.fecha_completado,
                u.nombre_completo AS freelancer
            FROM proyecto p
            LEFT JOIN contrato c
                   ON c.proyecto_id = p.id
            LEFT JOIN usuario u
                   ON u.id = c.freelancer_id
            WHERE p.cliente_id = ?
              AND p.created_at BETWEEN ? AND ?
            ORDER BY p.created_at DESC
            """;

        List<Map<String, Object>> lista = new ArrayList<>();

        try (
                Connection cn = ConexionBD.getConnection();
                PreparedStatement ps = cn.prepareStatement(sql)
        ) {

            ps.setInt(1, clienteId);
            ps.setString(2, desde);
            ps.setString(3, hasta);

            try (ResultSet rs = ps.executeQuery()) {

                while (rs.next()) {

                    Map<String, Object> row = new LinkedHashMap<>();

                    row.put("id", rs.getInt("id"));
                    row.put("titulo", rs.getString("titulo"));
                    row.put("estado", rs.getString("estado"));

                    Timestamp created = rs.getTimestamp("created_at");

                    row.put(
                            "createdAt",
                            created != null
                                    ? created.toLocalDateTime().toString()
                                    : null
                    );

                    row.put("monto", rs.getBigDecimal("monto"));
                    row.put("freelancer", rs.getString("freelancer"));

                    Timestamp fechaCompletado =
                            rs.getTimestamp("fecha_completado");

                    row.put(
                            "fechaCompletado",
                            fechaCompletado != null
                                    ? fechaCompletado.toLocalDateTime().toString()
                                    : null
                    );

                    lista.add(row);
                }
            }
        }

        return lista;
    }

    public List<Map<String, Object>> historialRecargasCliente(
            int clienteId,
            String desde,
            String hasta
    ) throws SQLException {

        String sql = """
            SELECT
                id,
                monto,
                created_at
            FROM recarga_saldo
            WHERE cliente_id = ?
              AND created_at BETWEEN ? AND ?
            ORDER BY created_at DESC
            """;

        List<Map<String, Object>> lista = new ArrayList<>();

        try (
                Connection cn = ConexionBD.getConnection();
                PreparedStatement ps = cn.prepareStatement(sql)
        ) {

            ps.setInt(1, clienteId);
            ps.setString(2, desde);
            ps.setString(3, hasta);

            try (ResultSet rs = ps.executeQuery()) {

                while (rs.next()) {

                    Map<String, Object> row = new LinkedHashMap<>();

                    row.put("id", rs.getInt("id"));
                    row.put("monto", rs.getBigDecimal("monto"));

                    Timestamp fecha = rs.getTimestamp("created_at");

                    row.put(
                            "fecha",
                            fecha != null
                                    ? fecha.toLocalDateTime().toString()
                                    : null
                    );

                    lista.add(row);
                }
            }
        }

        return lista;
    }

    public List<Map<String, Object>> gastoPorCategoriaCliente(
            int clienteId,
            String desde,
            String hasta
    ) throws SQLException {

        String sql = """
            SELECT
                cat.nombre AS categoria,
                COUNT(c.id) AS cantidad_contratos,
                COALESCE(SUM(c.monto),0) AS total_gastado
            FROM contrato c
            INNER JOIN proyecto p
                    ON p.id = c.proyecto_id
            INNER JOIN categoria cat
                    ON cat.id = p.categoria_id
            WHERE c.cliente_id = ?
              AND c.estado = 'COMPLETADO'
              AND c.fecha_completado BETWEEN ? AND ?
            GROUP BY cat.id, cat.nombre
            ORDER BY total_gastado DESC
            """;

        List<Map<String, Object>> lista = new ArrayList<>();

        try (
                Connection cn = ConexionBD.getConnection();
                PreparedStatement ps = cn.prepareStatement(sql)
        ) {

            ps.setInt(1, clienteId);
            ps.setString(2, desde);
            ps.setString(3, hasta);

            try (ResultSet rs = ps.executeQuery()) {

                while (rs.next()) {

                    Map<String, Object> row = new LinkedHashMap<>();

                    row.put("categoria", rs.getString("categoria"));

                    row.put(
                            "cantidadContratos",
                            rs.getInt("cantidad_contratos")
                    );

                    row.put(
                            "totalGastado",
                            rs.getBigDecimal("total_gastado")
                    );

                    lista.add(row);
                }
            }
        }

        return lista;
    }

    // ════════════════════════════════════════════════════════════════════════
    // REPORTES FREELANCER
    // ════════════════════════════════════════════════════════════════════════

    public List<Map<String, Object>> historialContratosFreelancer(
            int freelancerId,
            String desde,
            String hasta
    ) throws SQLException {

        String sql = """
            SELECT
                c.id,
                p.titulo AS proyecto,
                u.nombre_completo AS cliente,
                (c.monto - c.comision_monto) AS monto_recibido,
                cal.estrellas,
                cal.comentario,
                c.fecha_completado
            FROM contrato c
            INNER JOIN proyecto p
                    ON p.id = c.proyecto_id
            INNER JOIN usuario u
                    ON u.id = c.cliente_id
            LEFT JOIN calificacion cal
                   ON cal.contrato_id = c.id
            WHERE c.freelancer_id = ?
              AND c.estado = 'COMPLETADO'
              AND c.fecha_completado BETWEEN ? AND ?
            ORDER BY c.fecha_completado DESC
            """;

        List<Map<String, Object>> lista = new ArrayList<>();

        try (
                Connection cn = ConexionBD.getConnection();
                PreparedStatement ps = cn.prepareStatement(sql)
        ) {

            ps.setInt(1, freelancerId);
            ps.setString(2, desde);
            ps.setString(3, hasta);

            try (ResultSet rs = ps.executeQuery()) {

                while (rs.next()) {

                    Map<String, Object> row = new LinkedHashMap<>();

                    row.put("contratoId", rs.getInt("id"));
                    row.put("proyecto", rs.getString("proyecto"));
                    row.put("cliente", rs.getString("cliente"));

                    row.put(
                            "montoRecibido",
                            rs.getBigDecimal("monto_recibido")
                    );

                    row.put("estrellas", rs.getObject("estrellas"));
                    row.put("comentario", rs.getString("comentario"));

                    Timestamp fecha = rs.getTimestamp("fecha_completado");

                    row.put(
                            "fechaCompletado",
                            fecha != null
                                    ? fecha.toLocalDateTime().toString()
                                    : null
                    );

                    lista.add(row);
                }
            }
        }

        return lista;
    }

    public List<Map<String, Object>> topCategoriasFreelancer(
            int freelancerId
    ) throws SQLException {

        String sql = """
            SELECT
                cat.nombre AS categoria,
                COUNT(c.id) AS cantidad_contratos,
                COALESCE(SUM(c.monto - c.comision_monto),0) AS total_ingresos
            FROM contrato c
            INNER JOIN proyecto p
                    ON p.id = c.proyecto_id
            INNER JOIN categoria cat
                    ON cat.id = p.categoria_id
            WHERE c.freelancer_id = ?
              AND c.estado = 'COMPLETADO'
            GROUP BY cat.id, cat.nombre
            ORDER BY cantidad_contratos DESC
            LIMIT 5
            """;

        List<Map<String, Object>> lista = new ArrayList<>();

        try (
                Connection cn = ConexionBD.getConnection();
                PreparedStatement ps = cn.prepareStatement(sql)
        ) {

            ps.setInt(1, freelancerId);

            try (ResultSet rs = ps.executeQuery()) {

                while (rs.next()) {

                    Map<String, Object> row = new LinkedHashMap<>();

                    row.put("categoria", rs.getString("categoria"));

                    row.put(
                            "cantidadContratos",
                            rs.getInt("cantidad_contratos")
                    );

                    row.put(
                            "totalIngresos",
                            rs.getBigDecimal("total_ingresos")
                    );

                    lista.add(row);
                }
            }
        }

        return lista;
    }

    public List<Map<String, Object>> propuestasFreelancer(
            int freelancerId,
            String desde,
            String hasta
    ) throws SQLException {

        String sql = """
            SELECT
                pr.id,
                p.titulo AS proyecto,
                pr.monto_ofertado,
                pr.plazo_dias,
                pr.estado,
                pr.created_at
            FROM propuesta pr
            INNER JOIN proyecto p
                    ON p.id = pr.proyecto_id
            WHERE pr.freelancer_id = ?
              AND pr.created_at BETWEEN ? AND ?
            ORDER BY pr.created_at DESC
            """;

        List<Map<String, Object>> lista = new ArrayList<>();

        try (
                Connection cn = ConexionBD.getConnection();
                PreparedStatement ps = cn.prepareStatement(sql)
        ) {

            ps.setInt(1, freelancerId);
            ps.setString(2, desde);
            ps.setString(3, hasta);

            try (ResultSet rs = ps.executeQuery()) {

                while (rs.next()) {

                    Map<String, Object> row = new LinkedHashMap<>();

                    row.put("propuestaId", rs.getInt("id"));
                    row.put("proyecto", rs.getString("proyecto"));

                    row.put(
                            "montoOfertado",
                            rs.getBigDecimal("monto_ofertado")
                    );

                    row.put("plazoDias", rs.getInt("plazo_dias"));
                    row.put("estado", rs.getString("estado"));

                    Timestamp fecha = rs.getTimestamp("created_at");

                    row.put(
                            "fecha",
                            fecha != null
                                    ? fecha.toLocalDateTime().toString()
                                    : null
                    );

                    lista.add(row);
                }
            }
        }

        return lista;
    }

    // ════════════════════════════════════════════════════════════════════════
    // MÉTRICAS FREELANCER
    // ════════════════════════════════════════════════════════════════════════

    public int contarContratosCompletadosFreelancer(
            int freelancerId
    ) throws SQLException {

        String sql = """
            SELECT COUNT(*) AS total
            FROM contrato
            WHERE freelancer_id = ?
              AND estado = 'COMPLETADO'
            """;

        return ejecutarCount(sql, freelancerId);
    }

    public int contarContratosActivosFreelancer(
            int freelancerId
    ) throws SQLException {

        String sql = """
            SELECT COUNT(*) AS total
            FROM contrato
            WHERE freelancer_id = ?
              AND estado = 'ACTIVO'
            """;

        return ejecutarCount(sql, freelancerId);
    }

    public int contarPropuestasFreelancer(
            int freelancerId
    ) throws SQLException {

        String sql = """
            SELECT COUNT(*) AS total
            FROM propuesta
            WHERE freelancer_id = ?
            """;

        return ejecutarCount(sql, freelancerId);
    }

    public int contarPropuestasAceptadasFreelancer(
            int freelancerId
    ) throws SQLException {

        String sql = """
            SELECT COUNT(*) AS total
            FROM propuesta
            WHERE freelancer_id = ?
              AND estado = 'ACEPTADA'
            """;

        return ejecutarCount(sql, freelancerId);
    }

    public BigDecimal calcularIngresosFreelancer(
            int freelancerId
    ) throws SQLException {

        String sql = """
            SELECT
                COALESCE(SUM(monto - comision_monto),0) AS total
            FROM contrato
            WHERE freelancer_id = ?
              AND estado = 'COMPLETADO'
            """;

        try (
                Connection cn = ConexionBD.getConnection();
                PreparedStatement ps = cn.prepareStatement(sql)
        ) {

            ps.setInt(1, freelancerId);

            try (ResultSet rs = ps.executeQuery()) {

                if (rs.next()) {
                    return rs.getBigDecimal("total");
                }
            }
        }

        return BigDecimal.ZERO;
    }

    public Double obtenerRatingFreelancer(
            int freelancerId
    ) throws SQLException {

        String sql = """
            SELECT AVG(cal.estrellas) AS rating_promedio
            FROM calificacion cal
            INNER JOIN contrato c
                    ON c.id = cal.contrato_id
            WHERE c.freelancer_id = ?
            """;

        try (
                Connection cn = ConexionBD.getConnection();
                PreparedStatement ps = cn.prepareStatement(sql)
        ) {

            ps.setInt(1, freelancerId);

            try (ResultSet rs = ps.executeQuery()) {

                if (rs.next()) {

                    double rating =
                            rs.getDouble("rating_promedio");

                    return rs.wasNull()
                            ? 0.0
                            : rating;
                }
            }
        }

        return 0.0;
    }

    // ════════════════════════════════════════════════════════════════════════
    // HELPERS
    // ════════════════════════════════════════════════════════════════════════

    private List<Map<String, Object>> ejecutarReporte(
            String sql,
            String desde,
            String hasta
    ) throws SQLException {

        List<Map<String, Object>> lista =
                new ArrayList<>();

        try (
                Connection cn = ConexionBD.getConnection();
                PreparedStatement ps = cn.prepareStatement(sql)
        ) {

            ps.setString(1, desde);
            ps.setString(2, hasta);

            try (ResultSet rs = ps.executeQuery()) {

                ResultSetMetaData meta =
                        rs.getMetaData();

                int columnas =
                        meta.getColumnCount();

                while (rs.next()) {

                    Map<String, Object> row =
                            new LinkedHashMap<>();

                    for (int i = 1; i <= columnas; i++) {

                        row.put(
                                meta.getColumnLabel(i),
                                rs.getObject(i)
                        );
                    }

                    lista.add(row);
                }
            }
        }

        return lista;
    }

    private int ejecutarCount(String sql)
            throws SQLException {

        try (
                Connection cn = ConexionBD.getConnection();
                Statement st = cn.createStatement();
                ResultSet rs = st.executeQuery(sql)
        ) {

            if (rs.next()) {
                return rs.getInt(1);
            }
        }

        return 0;
    }

    private int ejecutarCount(
            String sql,
            int parametro
    ) throws SQLException {

        try (
                Connection cn = ConexionBD.getConnection();
                PreparedStatement ps = cn.prepareStatement(sql)
        ) {

            ps.setInt(1, parametro);

            try (ResultSet rs = ps.executeQuery()) {

                if (rs.next()) {
                    return rs.getInt(1);
                }
            }
        }

        return 0;
    }
}