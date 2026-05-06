package dao;

import config.ConexionBD;
import modelo.Contrato;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.sql.*;
import java.util.ArrayList;
import java.util.List;

public class ContratoDAO {

    // ─── Crear contrato al aceptar una propuesta ──────────────────────────────
    /**
     * Operación atómica: crea el contrato, bloquea el saldo del cliente
     * (descuenta), cambia estado del proyecto a EN_PROGRESO, marca la propuesta
     * como ACEPTADA.
     */
    public int crear(int propuestaId, int proyectoId,
            int clienteId, int freelancerId,
            BigDecimal monto) throws SQLException {

        try (Connection cn = ConexionBD.getConnection()) {
            cn.setAutoCommit(false);
            try {
                // 1. Verificar saldo suficiente con FOR UPDATE
                BigDecimal saldo;
                try (PreparedStatement ps = cn.prepareStatement(
                        "SELECT saldo FROM usuario WHERE id=? FOR UPDATE")) {
                    ps.setInt(1, clienteId);
                    try (ResultSet rs = ps.executeQuery()) {
                        rs.next();
                        saldo = rs.getBigDecimal("saldo");
                    }
                }
                if (saldo.compareTo(monto) < 0) {
                    cn.rollback();
                    throw new IllegalStateException("SALDO_INSUFICIENTE");
                }

                // 2. Obtener comisión vigente
                BigDecimal pct;
                try (PreparedStatement ps = cn.prepareStatement(
                        "SELECT porcentaje FROM comision_config WHERE fecha_fin IS NULL LIMIT 1")) {
                    try (ResultSet rs = ps.executeQuery()) {
                        rs.next();
                        pct = rs.getBigDecimal("porcentaje");
                    }
                }
                BigDecimal comisionMonto = monto
                        .multiply(pct)
                        .divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);

                // 3. Insertar contrato
                int contratoId;
                try (PreparedStatement ps = cn.prepareStatement(
                        """
                        INSERT INTO contrato (propuesta_id, proyecto_id, cliente_id, freelancer_id,
                                             monto, comision_pct, comision_monto)
                        VALUES (?,?,?,?,?,?,?)
                        """, Statement.RETURN_GENERATED_KEYS)) {
                    ps.setInt(1, propuestaId);
                    ps.setInt(2, proyectoId);
                    ps.setInt(3, clienteId);
                    ps.setInt(4, freelancerId);
                    ps.setBigDecimal(5, monto);
                    ps.setBigDecimal(6, pct);
                    ps.setBigDecimal(7, comisionMonto);
                    ps.executeUpdate();
                    try (ResultSet rs = ps.getGeneratedKeys()) {
                        rs.next();
                        contratoId = rs.getInt(1);
                    }
                }

                // 4. Descontar saldo del cliente (bloqueo)
                try (PreparedStatement ps = cn.prepareStatement(
                        "UPDATE usuario SET saldo = saldo - ? WHERE id=?")) {
                    ps.setBigDecimal(1, monto);
                    ps.setInt(2, clienteId);
                    ps.executeUpdate();
                }

                // 5. Cambiar estado del proyecto a EN_PROGRESO
                try (PreparedStatement ps = cn.prepareStatement(
                        "UPDATE proyecto SET estado='EN_PROGRESO' WHERE id=?")) {
                    ps.setInt(1, proyectoId);
                    ps.executeUpdate();
                }

                // 6. Marcar propuesta como ACEPTADA
                try (PreparedStatement ps = cn.prepareStatement(
                        "UPDATE propuesta SET estado='ACEPTADA' WHERE id=?")) {
                    ps.setInt(1, propuestaId);
                    ps.executeUpdate();
                }

                cn.commit();
                return contratoId;

            } catch (Exception e) {
                cn.rollback();
                throw e instanceof SQLException ? (SQLException) e : new SQLException(e.getMessage(), e);
            }
        }
    }

    // ─── Completar contrato ───────────────────────────────────────────────────
    /**
     * Libera el pago al freelancer (monto - comisión), registra comisión en
     * saldo_plataforma, cierra el contrato y marca proyecto COMPLETADO.
     */
    public void completar(int contratoId) throws SQLException {
        try (Connection cn = ConexionBD.getConnection()) {
            cn.setAutoCommit(false);
            try {
                Contrato c = buscarPorId(contratoId);   // lectura simple, fuera de tx
                if (c == null) {
                    throw new SQLException("Contrato no encontrado");
                }

                BigDecimal montoFreelancer = c.getMonto().subtract(c.getComisionMonto());

                // 1. Acreditar al freelancer
                try (PreparedStatement ps = cn.prepareStatement(
                        "UPDATE usuario SET saldo = saldo + ? WHERE id=?")) {
                    ps.setBigDecimal(1, montoFreelancer);
                    ps.setInt(2, c.getFreelancerId());
                    ps.executeUpdate();
                }

                // 2. Registrar comisión de plataforma
                try (PreparedStatement ps = cn.prepareStatement(
                        "INSERT INTO saldo_plataforma (contrato_id, monto_comision) VALUES (?,?)")) {
                    ps.setInt(1, contratoId);
                    ps.setBigDecimal(2, c.getComisionMonto());
                    ps.executeUpdate();
                }

                // 3. Cerrar contrato
                try (PreparedStatement ps = cn.prepareStatement(
                        "UPDATE contrato SET estado='COMPLETADO', fecha_completado=NOW() WHERE id=?")) {
                    ps.setInt(1, contratoId);
                    ps.executeUpdate();
                }

                // 4. Cambiar estado proyecto
                try (PreparedStatement ps = cn.prepareStatement(
                        "UPDATE proyecto SET estado='COMPLETADO' WHERE id=?")) {
                    ps.setInt(1, c.getProyectoId());
                    ps.executeUpdate();
                }

                cn.commit();

            } catch (SQLException e) {
                cn.rollback();
                throw e;
            }
        }
    }

    // ─── Cancelar contrato ────────────────────────────────────────────────────
    /**
     * Devuelve el saldo bloqueado al cliente, cierra contrato y marca proyecto
     * CANCELADO.
     */
    public void cancelar(int contratoId, String motivo) throws SQLException {
        try (Connection cn = ConexionBD.getConnection()) {
            cn.setAutoCommit(false);
            try {
                Contrato c = buscarPorId(contratoId);
                if (c == null) {
                    throw new SQLException("Contrato no encontrado");
                }

                // 1. Reembolso al cliente
                try (PreparedStatement ps = cn.prepareStatement(
                        "UPDATE usuario SET saldo = saldo + ? WHERE id=?")) {
                    ps.setBigDecimal(1, c.getMonto());
                    ps.setInt(2, c.getClienteId());
                    ps.executeUpdate();
                }

                // 2. Cerrar contrato
                try (PreparedStatement ps = cn.prepareStatement(
                        "UPDATE contrato SET estado='CANCELADO', motivo_cancelacion=? WHERE id=?")) {
                    ps.setString(1, motivo);
                    ps.setInt(2, contratoId);
                    ps.executeUpdate();
                }

                // 3. Cambiar estado proyecto
                try (PreparedStatement ps = cn.prepareStatement(
                        "UPDATE proyecto SET estado='CANCELADO' WHERE id=?")) {
                    ps.setInt(1, c.getProyectoId());
                    ps.executeUpdate();
                }

                cn.commit();

            } catch (SQLException e) {
                cn.rollback();
                throw e;
            }
        }
    }

    // ─── Consultas ────────────────────────────────────────────────────────────
    public Contrato buscarPorId(int id) throws SQLException {
        String sql = """
            SELECT c.*,
                   p.titulo AS titulo_proyecto,
                   u_cli.nombre_completo AS nombre_cliente,
                   u_fre.nombre_completo AS nombre_freelancer
              FROM contrato c
              JOIN proyecto p      ON p.id  = c.proyecto_id
              JOIN usuario  u_cli  ON u_cli.id = c.cliente_id
              JOIN usuario  u_fre  ON u_fre.id = c.freelancer_id
             WHERE c.id = ?
            """;
        try (Connection cn = ConexionBD.getConnection(); PreparedStatement ps = cn.prepareStatement(sql)) {
            ps.setInt(1, id);
            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) {
                    return mapear(rs);
                }
            }
        }
        return null;
    }

    public Contrato buscarPorProyecto(int proyectoId) throws SQLException {
        String sql = """
            SELECT c.*,
                   p.titulo AS titulo_proyecto,
                   u_cli.nombre_completo AS nombre_cliente,
                   u_fre.nombre_completo AS nombre_freelancer
              FROM contrato c
              JOIN proyecto p      ON p.id  = c.proyecto_id
              JOIN usuario  u_cli  ON u_cli.id = c.cliente_id
              JOIN usuario  u_fre  ON u_fre.id = c.freelancer_id
             WHERE c.proyecto_id = ? AND c.estado = 'ACTIVO'
            """;
        try (Connection cn = ConexionBD.getConnection(); PreparedStatement ps = cn.prepareStatement(sql)) {
            ps.setInt(1, proyectoId);
            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) {
                    return mapear(rs);
                }
            }
        }
        return null;
    }

    public List<Contrato> listarPorFreelancer(int freelancerId) throws SQLException {
        String sql = """
            SELECT c.*,
                   p.titulo AS titulo_proyecto,
                   u_cli.nombre_completo AS nombre_cliente,
                   u_fre.nombre_completo AS nombre_freelancer
              FROM contrato c
              JOIN proyecto p      ON p.id  = c.proyecto_id
              JOIN usuario  u_cli  ON u_cli.id = c.cliente_id
              JOIN usuario  u_fre  ON u_fre.id = c.freelancer_id
             WHERE c.freelancer_id = ? AND c.estado = 'ACTIVO'
             ORDER BY c.created_at DESC
            """;
        return ejecutarLista(sql, freelancerId);
    }

    public List<Contrato> listarPorCliente(int clienteId) throws SQLException {
        String sql = """
            SELECT c.*,
                   p.titulo AS titulo_proyecto,
                   u_cli.nombre_completo AS nombre_cliente,
                   u_fre.nombre_completo AS nombre_freelancer
              FROM contrato c
              JOIN proyecto p      ON p.id  = c.proyecto_id
              JOIN usuario  u_cli  ON u_cli.id = c.cliente_id
              JOIN usuario  u_fre  ON u_fre.id = c.freelancer_id
             WHERE c.cliente_id = ?
             ORDER BY c.created_at DESC
            """;
        return ejecutarLista(sql, clienteId);
    }

    private List<Contrato> ejecutarLista(String sql, int param) throws SQLException {
        List<Contrato> lista = new ArrayList<>();
        try (Connection cn = ConexionBD.getConnection(); PreparedStatement ps = cn.prepareStatement(sql)) {
            ps.setInt(1, param);
            try (ResultSet rs = ps.executeQuery()) {
                while (rs.next()) {
                    lista.add(mapear(rs));
                }
            }
        }
        return lista;
    }

    private Contrato mapear(ResultSet rs) throws SQLException {
        Contrato c = new Contrato();
        c.setId(rs.getInt("id"));
        c.setPropuestaId(rs.getInt("propuesta_id"));
        c.setProyectoId(rs.getInt("proyecto_id"));
        c.setTituloProyecto(rs.getString("titulo_proyecto"));
        c.setClienteId(rs.getInt("cliente_id"));
        c.setNombreCliente(rs.getString("nombre_cliente"));
        c.setFreelancerId(rs.getInt("freelancer_id"));
        c.setNombreFreelancer(rs.getString("nombre_freelancer"));
        c.setMonto(rs.getBigDecimal("monto"));
        c.setComisionPct(rs.getBigDecimal("comision_pct"));
        c.setComisionMonto(rs.getBigDecimal("comision_monto"));
        c.setEstado(rs.getString("estado"));
        c.setMotivoCancelacion(rs.getString("motivo_cancelacion"));
        c.setCreatedAt(rs.getTimestamp("created_at").toLocalDateTime());
        Timestamp fc = rs.getTimestamp("fecha_completado");
        if (fc != null) {
            c.setFechaCompletado(fc.toLocalDateTime());
        }
        return c;
    }
}
