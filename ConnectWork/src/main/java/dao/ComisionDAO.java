package dao;

import config.ConexionBD;
import modelo.ComisionConfig;

import java.math.BigDecimal;
import java.sql.*;
import java.util.ArrayList;
import java.util.List;

public class ComisionDAO {

    /** Obtiene el porcentaje de comisión vigente */
    public ComisionConfig obtenerVigente() throws SQLException {
        String sql = "SELECT * FROM comision_config WHERE fecha_fin IS NULL LIMIT 1";
        try (Connection cn = ConexionBD.getConnection();
             PreparedStatement ps = cn.prepareStatement(sql);
             ResultSet rs = ps.executeQuery()) {
            if (rs.next()) return mapear(rs);
        }
        return null;
    }

    /**
     * Cambia el porcentaje de comisión:
     * - Cierra el registro vigente (fecha_fin = NOW)
     * - Inserta uno nuevo (aplica solo a contratos futuros)
     */
    public void cambiarPorcentaje(BigDecimal nuevoPct, int adminId) throws SQLException {
        try (Connection cn = ConexionBD.getConnection()) {
            cn.setAutoCommit(false);
            try {
                // Cerrar vigente
                try (PreparedStatement ps = cn.prepareStatement(
                        "UPDATE comision_config SET fecha_fin=NOW() WHERE fecha_fin IS NULL")) {
                    ps.executeUpdate();
                }
                // Insertar nuevo
                try (PreparedStatement ps = cn.prepareStatement(
                        "INSERT INTO comision_config (porcentaje, admin_id) VALUES (?,?)")) {
                    ps.setBigDecimal(1, nuevoPct);
                    ps.setInt(2, adminId);
                    ps.executeUpdate();
                }
                cn.commit();
            } catch (SQLException e) { cn.rollback(); throw e; }
        }
    }

    /** Historial completo de porcentajes */
    public List<ComisionConfig> historial() throws SQLException {
        String sql = "SELECT * FROM comision_config ORDER BY fecha_inicio DESC";
        List<ComisionConfig> lista = new ArrayList<>();
        try (Connection cn = ConexionBD.getConnection();
             PreparedStatement ps = cn.prepareStatement(sql);
             ResultSet rs = ps.executeQuery()) {
            while (rs.next()) lista.add(mapear(rs));
        }
        return lista;
    }

    /** Saldo total acumulado de la plataforma */
    public BigDecimal saldoPlataformaTotal() throws SQLException {
        String sql = "SELECT COALESCE(SUM(monto_comision), 0) AS total FROM saldo_plataforma";
        try (Connection cn = ConexionBD.getConnection();
             PreparedStatement ps = cn.prepareStatement(sql);
             ResultSet rs = ps.executeQuery()) {
            if (rs.next()) return rs.getBigDecimal("total");
        }
        return BigDecimal.ZERO;
    }

    /** Historial de comisiones individuales acumuladas */
    public List<java.util.Map<String, Object>> historialComisiones() throws SQLException {
        String sql = """
            SELECT sp.id, sp.contrato_id, sp.monto_comision, sp.created_at,
                   p.titulo AS proyecto, u_cli.nombre_completo AS cliente,
                   u_fre.nombre_completo AS freelancer
              FROM saldo_plataforma sp
              JOIN contrato c ON c.id = sp.contrato_id
              JOIN proyecto p ON p.id = c.proyecto_id
              JOIN usuario u_cli ON u_cli.id = c.cliente_id
              JOIN usuario u_fre ON u_fre.id = c.freelancer_id
             ORDER BY sp.created_at DESC
            """;
        List<java.util.Map<String, Object>> lista = new ArrayList<>();
        try (Connection cn = ConexionBD.getConnection();
             PreparedStatement ps = cn.prepareStatement(sql);
             ResultSet rs = ps.executeQuery()) {
            while (rs.next()) {
                java.util.Map<String, Object> row = new java.util.LinkedHashMap<>();
                row.put("id",           rs.getInt("id"));
                row.put("contratoId",   rs.getInt("contrato_id"));
                row.put("montoComision",rs.getBigDecimal("monto_comision"));
                row.put("fecha",        rs.getTimestamp("created_at").toLocalDateTime().toString());
                row.put("proyecto",     rs.getString("proyecto"));
                row.put("cliente",      rs.getString("cliente"));
                row.put("freelancer",   rs.getString("freelancer"));
                lista.add(row);
            }
        }
        return lista;
    }

    private ComisionConfig mapear(ResultSet rs) throws SQLException {
        ComisionConfig c = new ComisionConfig();
        c.setId(rs.getInt("id"));
        c.setPorcentaje(rs.getBigDecimal("porcentaje"));
        c.setFechaInicio(rs.getTimestamp("fecha_inicio").toLocalDateTime());
        Timestamp fin = rs.getTimestamp("fecha_fin");
        if (fin != null) c.setFechaFin(fin.toLocalDateTime());
        c.setAdminId(rs.getInt("admin_id"));
        return c;
    }
}