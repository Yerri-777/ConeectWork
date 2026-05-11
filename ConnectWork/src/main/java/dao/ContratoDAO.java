package dao;

import config.ConexionBD;
import modelo.Contrato;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.sql.*;
import java.util.ArrayList;
import java.util.List;


public class ContratoDAO {

    private static final String SQL_BASE = """
        SELECT c.*,
               p.titulo AS titulo_proyecto,
               u_cli.nombre_completo AS nombre_cliente,
               u_fre.nombre_completo AS nombre_freelancer
          FROM contrato c
          JOIN proyecto p
            ON p.id = c.proyecto_id
          JOIN usuario u_cli
            ON u_cli.id = c.cliente_id
          JOIN usuario u_fre
            ON u_fre.id = c.freelancer_id
        """;

    // ─────────────────────────────────────────────────────────
    // CREAR CONTRATO
    // ─────────────────────────────────────────────────────────

    public int crear(
            int propuestaId,
            int proyectoId,
            int clienteId,
            int freelancerId,
            BigDecimal monto
    ) throws SQLException {

        try (Connection cn = ConexionBD.getConnection()) {

            cn.setAutoCommit(false);

            try {

                // Verificar propuesta no usada
                if (existeContratoPorPropuesta(cn, propuestaId)) {
                    throw new IllegalStateException("La propuesta ya tiene contrato");
                }

                // Bloquear saldo cliente
                BigDecimal saldo;

                try (PreparedStatement ps = cn.prepareStatement("""
                    SELECT saldo
                      FROM usuario
                     WHERE id = ?
                     FOR UPDATE
                    """)) {

                    ps.setInt(1, clienteId);

                    try (ResultSet rs = ps.executeQuery()) {

                        if (!rs.next()) {
                            throw new SQLException("Cliente no encontrado");
                        }

                        saldo = rs.getBigDecimal("saldo");
                    }
                }

                // Validar saldo
                if (saldo.compareTo(monto) < 0) {
                    throw new IllegalStateException("SALDO_INSUFICIENTE");
                }

                // Obtener comisión vigente
                BigDecimal porcentaje;

                try (PreparedStatement ps = cn.prepareStatement("""
                    SELECT porcentaje
                      FROM comision_config
                     WHERE fecha_fin IS NULL
                     LIMIT 1
                    """)) {

                    try (ResultSet rs = ps.executeQuery()) {

                        if (!rs.next()) {
                            throw new SQLException("No existe comisión vigente");
                        }

                        porcentaje = rs.getBigDecimal("porcentaje");
                    }
                }

                BigDecimal comisionMonto = monto
                        .multiply(porcentaje)
                        .divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);

                // Crear contrato
                int contratoId;

                try (PreparedStatement ps = cn.prepareStatement("""
                    INSERT INTO contrato (
                        propuesta_id,
                        proyecto_id,
                        cliente_id,
                        freelancer_id,
                        monto,
                        comision_pct,
                        comision_monto
                    ) VALUES (?, ?, ?, ?, ?, ?, ?)
                    """, Statement.RETURN_GENERATED_KEYS)) {

                    ps.setInt(1, propuestaId);
                    ps.setInt(2, proyectoId);
                    ps.setInt(3, clienteId);
                    ps.setInt(4, freelancerId);
                    ps.setBigDecimal(5, monto);
                    ps.setBigDecimal(6, porcentaje);
                    ps.setBigDecimal(7, comisionMonto);

                    int affected = ps.executeUpdate();

                    if (affected == 0) {
                        throw new SQLException("No se pudo crear contrato");
                    }

                    try (ResultSet rs = ps.getGeneratedKeys()) {

                        if (!rs.next()) {
                            throw new SQLException("No se obtuvo ID del contrato");
                        }

                        contratoId = rs.getInt(1);
                    }
                }

                // Descontar saldo cliente
                try (PreparedStatement ps = cn.prepareStatement("""
                    UPDATE usuario
                       SET saldo = saldo - ?
                     WHERE id = ?
                    """)) {

                    ps.setBigDecimal(1, monto);
                    ps.setInt(2, clienteId);
                    ps.executeUpdate();
                }

                // Actualizar proyecto
                try (PreparedStatement ps = cn.prepareStatement("""
                    UPDATE proyecto
                       SET estado = 'EN_PROGRESO'
                     WHERE id = ?
                    """)) {

                    ps.setInt(1, proyectoId);
                    ps.executeUpdate();
                }

                // Aceptar propuesta
                try (PreparedStatement ps = cn.prepareStatement("""
                    UPDATE propuesta
                       SET estado = 'ACEPTADA'
                     WHERE id = ?
                    """)) {

                    ps.setInt(1, propuestaId);
                    ps.executeUpdate();
                }

                cn.commit();

                return contratoId;

            } catch (Exception e) {

                cn.rollback();

                if (e instanceof SQLException sqlException) {
                    throw sqlException;
                }

                throw new SQLException(e.getMessage(), e);
            }
        }
    }

    // ─────────────────────────────────────────────────────────
    // COMPLETAR CONTRATO
    // ─────────────────────────────────────────────────────────

    public void completar(int contratoId) throws SQLException {

        try (Connection cn = ConexionBD.getConnection()) {

            cn.setAutoCommit(false);

            try {

                Contrato contrato = buscarPorIdTx(cn, contratoId);

                if (contrato == null) {
                    throw new SQLException("Contrato no encontrado");
                }

                if (!"ACTIVO".equals(contrato.getEstado())) {
                    throw new IllegalStateException("Solo contratos activos pueden completarse");
                }

                BigDecimal pagoFreelancer = contrato.getMonto()
                        .subtract(contrato.getComisionMonto());

                // Pagar freelancer
                try (PreparedStatement ps = cn.prepareStatement("""
                    UPDATE usuario
                       SET saldo = saldo + ?
                     WHERE id = ?
                    """)) {

                    ps.setBigDecimal(1, pagoFreelancer);
                    ps.setInt(2, contrato.getFreelancerId());

                    ps.executeUpdate();
                }

                // Registrar comisión
                try (PreparedStatement ps = cn.prepareStatement("""
                    INSERT INTO saldo_plataforma (
                        contrato_id,
                        monto_comision
                    ) VALUES (?, ?)
                    """)) {

                    ps.setInt(1, contratoId);
                    ps.setBigDecimal(2, contrato.getComisionMonto());

                    ps.executeUpdate();
                }

                // Completar contrato
                try (PreparedStatement ps = cn.prepareStatement("""
                    UPDATE contrato
                       SET estado = 'COMPLETADO',
                           fecha_completado = NOW()
                     WHERE id = ?
                    """)) {

                    ps.setInt(1, contratoId);

                    ps.executeUpdate();
                }

                // Completar proyecto
                try (PreparedStatement ps = cn.prepareStatement("""
                    UPDATE proyecto
                       SET estado = 'COMPLETADO'
                     WHERE id = ?
                    """)) {

                    ps.setInt(1, contrato.getProyectoId());

                    ps.executeUpdate();
                }

                cn.commit();

            } catch (Exception e) {

                cn.rollback();

                if (e instanceof SQLException sqlException) {
                    throw sqlException;
                }

                throw new SQLException(e.getMessage(), e);
            }
        }
    }

    // ─────────────────────────────────────────────────────────
    // CANCELAR CONTRATO
    // ─────────────────────────────────────────────────────────

    public void cancelar(int contratoId, String motivo) throws SQLException {

        try (Connection cn = ConexionBD.getConnection()) {

            cn.setAutoCommit(false);

            try {

                Contrato contrato = buscarPorIdTx(cn, contratoId);

                if (contrato == null) {
                    throw new SQLException("Contrato no encontrado");
                }

                if (!"ACTIVO".equals(contrato.getEstado())) {
                    throw new IllegalStateException("Solo contratos activos pueden cancelarse");
                }

                // Reembolso cliente
                try (PreparedStatement ps = cn.prepareStatement("""
                    UPDATE usuario
                       SET saldo = saldo + ?
                     WHERE id = ?
                    """)) {

                    ps.setBigDecimal(1, contrato.getMonto());
                    ps.setInt(2, contrato.getClienteId());

                    ps.executeUpdate();
                }

                // Cancelar contrato
                try (PreparedStatement ps = cn.prepareStatement("""
                    UPDATE contrato
                       SET estado = 'CANCELADO',
                           motivo_cancelacion = ?
                     WHERE id = ?
                    """)) {

                    ps.setString(1, motivo);
                    ps.setInt(2, contratoId);

                    ps.executeUpdate();
                }

                // Cancelar proyecto
                try (PreparedStatement ps = cn.prepareStatement("""
                    UPDATE proyecto
                       SET estado = 'CANCELADO'
                     WHERE id = ?
                    """)) {

                    ps.setInt(1, contrato.getProyectoId());

                    ps.executeUpdate();
                }

                cn.commit();

            } catch (Exception e) {

                cn.rollback();

                if (e instanceof SQLException sqlException) {
                    throw sqlException;
                }

                throw new SQLException(e.getMessage(), e);
            }
        }
    }

    // ─────────────────────────────────────────────────────────
    // CONSULTAS
    // ─────────────────────────────────────────────────────────

    public List<Contrato> listarTodos() throws SQLException {

        String sql = SQL_BASE + """
             ORDER BY c.created_at DESC
            """;

        return ejecutarLista(sql);
    }

    public Contrato buscarPorId(int id) throws SQLException {

        String sql = SQL_BASE + """
             WHERE c.id = ?
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

    public Contrato buscarPorProyecto(int proyectoId) throws SQLException {

        String sql = SQL_BASE + """
             WHERE c.proyecto_id = ?
               AND c.estado = 'ACTIVO'
            """;

        try (Connection cn = ConexionBD.getConnection();
             PreparedStatement ps = cn.prepareStatement(sql)) {

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

        String sql = SQL_BASE + """
             WHERE c.freelancer_id = ?
             ORDER BY c.created_at DESC
            """;

        return ejecutarLista(sql, freelancerId);
    }

    public List<Contrato> listarPorCliente(int clienteId) throws SQLException {

        String sql = SQL_BASE + """
             WHERE c.cliente_id = ?
             ORDER BY c.created_at DESC
            """;

        return ejecutarLista(sql, clienteId);
    }

    // ─────────────────────────────────────────────────────────
    // HELPERS
    // ─────────────────────────────────────────────────────────

    private boolean existeContratoPorPropuesta(Connection cn, int propuestaId) throws SQLException {

        String sql = """
            SELECT 1
              FROM contrato
             WHERE propuesta_id = ?
             LIMIT 1
            """;

        try (PreparedStatement ps = cn.prepareStatement(sql)) {

            ps.setInt(1, propuestaId);

            try (ResultSet rs = ps.executeQuery()) {
                return rs.next();
            }
        }
    }

    private Contrato buscarPorIdTx(Connection cn, int id) throws SQLException {

        String sql = SQL_BASE + """
             WHERE c.id = ?
             FOR UPDATE
            """;

        try (PreparedStatement ps = cn.prepareStatement(sql)) {

            ps.setInt(1, id);

            try (ResultSet rs = ps.executeQuery()) {

                if (rs.next()) {
                    return mapear(rs);
                }
            }
        }

        return null;
    }

    private List<Contrato> ejecutarLista(String sql, Object... params) throws SQLException {

        List<Contrato> lista = new ArrayList<>();

        try (Connection cn = ConexionBD.getConnection();
             PreparedStatement ps = cn.prepareStatement(sql)) {

            for (int i = 0; i < params.length; i++) {
                ps.setObject(i + 1, params[i]);
            }

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

        Timestamp created = rs.getTimestamp("created_at");

        if (created != null) {
            c.setCreatedAt(created.toLocalDateTime());
        }

        Timestamp completado = rs.getTimestamp("fecha_completado");

        if (completado != null) {
            c.setFechaCompletado(completado.toLocalDateTime());
        }

        return c;
    }
}