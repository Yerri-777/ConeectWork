package dao;

import config.ConexionBD;
import modelo.RecargaSaldo;

import java.math.BigDecimal;
import java.sql.*;
import java.util.ArrayList;
import java.util.List;


public class RecargaSaldoDAO {

    // ─────────────────────────────────────────────────────────────
    // REGISTRAR RECARGA
    // ─────────────────────────────────────────────────────────────
    /**
     * Registra la recarga y aumenta el saldo del cliente
     * en una transacción atómica.
     */
    public int recargar(int clienteId, BigDecimal monto) throws SQLException {

        if (monto == null || monto.compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("El monto debe ser mayor a 0");
        }

        try (Connection cn = ConexionBD.getConnection()) {

            cn.setAutoCommit(false);

            try {

                // 1. Verificar que el usuario exista y sea CLIENTE
                String sqlValidar = """
                    SELECT id
                      FROM usuario
                     WHERE id = ?
                       AND rol = 'CLIENTE'
                    """;

                try (PreparedStatement ps = cn.prepareStatement(sqlValidar)) {

                    ps.setInt(1, clienteId);

                    try (ResultSet rs = ps.executeQuery()) {

                        if (!rs.next()) {
                            throw new SQLException("Cliente no válido");
                        }
                    }
                }

                // 2. Registrar recarga
                int recargaId;

                String sqlRecarga = """
                    INSERT INTO recarga_saldo (cliente_id, monto)
                    VALUES (?,?)
                    """;

                try (PreparedStatement ps = cn.prepareStatement(
                        sqlRecarga,
                        Statement.RETURN_GENERATED_KEYS)) {

                    ps.setInt(1, clienteId);
                    ps.setBigDecimal(2, monto);

                    ps.executeUpdate();

                    try (ResultSet rs = ps.getGeneratedKeys()) {

                        if (rs.next()) {
                            recargaId = rs.getInt(1);
                        } else {
                            throw new SQLException("No se pudo registrar la recarga");
                        }
                    }
                }

                // 3. Actualizar saldo del usuario
                String sqlSaldo = """
                    UPDATE usuario
                       SET saldo = saldo + ?
                     WHERE id = ?
                    """;

                try (PreparedStatement ps = cn.prepareStatement(sqlSaldo)) {

                    ps.setBigDecimal(1, monto);
                    ps.setInt(2, clienteId);

                    if (ps.executeUpdate() == 0) {
                        throw new SQLException("No se pudo actualizar el saldo");
                    }
                }

                cn.commit();

                return recargaId;

            } catch (Exception e) {

                cn.rollback();

                throw e instanceof SQLException
                        ? (SQLException) e
                        : new SQLException(e.getMessage(), e);
            }
        }
    }

    // ─────────────────────────────────────────────────────────────
    // LISTAR RECARGAS DE CLIENTE
    // ─────────────────────────────────────────────────────────────
    public List<RecargaSaldo> listarPorCliente(int clienteId) throws SQLException {

        String sql = """
            SELECT *
              FROM recarga_saldo
             WHERE cliente_id = ?
             ORDER BY created_at DESC
            """;

        List<RecargaSaldo> lista = new ArrayList<>();

        try (Connection cn = ConexionBD.getConnection();
             PreparedStatement ps = cn.prepareStatement(sql)) {

            ps.setInt(1, clienteId);

            try (ResultSet rs = ps.executeQuery()) {

                while (rs.next()) {
                    lista.add(mapear(rs));
                }
            }
        }

        return lista;
    }

    // ─────────────────────────────────────────────────────────────
    // BUSCAR RECARGA POR ID
    // ─────────────────────────────────────────────────────────────
    public RecargaSaldo buscarPorId(int id) throws SQLException {

        String sql = """
            SELECT *
              FROM recarga_saldo
             WHERE id = ?
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
    // MAPEADOR
    // ─────────────────────────────────────────────────────────────
    private RecargaSaldo mapear(ResultSet rs) throws SQLException {

        RecargaSaldo r = new RecargaSaldo();

        r.setId(rs.getInt("id"));
        r.setClienteId(rs.getInt("cliente_id"));
        r.setMonto(rs.getBigDecimal("monto"));
        r.setCreatedAt(rs.getTimestamp("created_at").toLocalDateTime());

        return r;
    }
}