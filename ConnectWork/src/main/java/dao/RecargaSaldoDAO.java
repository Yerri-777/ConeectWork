package dao;

import config.ConexionBD;
import modelo.RecargaSaldo;

import java.math.BigDecimal;
import java.sql.*;
import java.util.ArrayList;
import java.util.List;

public class RecargaSaldoDAO {

    /** Registra la recarga y actualiza el saldo del cliente en una transacción */
    public int recargar(int clienteId, BigDecimal monto) throws SQLException {
        try (Connection cn = ConexionBD.getConnection()) {
            cn.setAutoCommit(false);
            try {
                // 1. Insertar registro de recarga
                int id;
                try (PreparedStatement ps = cn.prepareStatement(
                        "INSERT INTO recarga_saldo (cliente_id, monto) VALUES (?,?)",
                        Statement.RETURN_GENERATED_KEYS)) {
                    ps.setInt(1, clienteId);
                    ps.setBigDecimal(2, monto);
                    ps.executeUpdate();
                    try (ResultSet rs = ps.getGeneratedKeys()) { rs.next(); id = rs.getInt(1); }
                }
                // 2. Actualizar saldo
                try (PreparedStatement ps = cn.prepareStatement(
                        "UPDATE usuario SET saldo = saldo + ? WHERE id=? AND rol='CLIENTE'")) {
                    ps.setBigDecimal(1, monto);
                    ps.setInt(2, clienteId);
                    ps.executeUpdate();
                }
                cn.commit();
                return id;
            } catch (SQLException e) { cn.rollback(); throw e; }
        }
    }

    public List<RecargaSaldo> listarPorCliente(int clienteId) throws SQLException {
        String sql = "SELECT * FROM recarga_saldo WHERE cliente_id=? ORDER BY created_at DESC";
        List<RecargaSaldo> lista = new ArrayList<>();
        try (Connection cn = ConexionBD.getConnection();
             PreparedStatement ps = cn.prepareStatement(sql)) {
            ps.setInt(1, clienteId);
            try (ResultSet rs = ps.executeQuery()) {
                while (rs.next()) lista.add(mapear(rs));
            }
        }
        return lista;
    }

    private RecargaSaldo mapear(ResultSet rs) throws SQLException {
        RecargaSaldo r = new RecargaSaldo();
        r.setId(rs.getInt("id"));
        r.setClienteId(rs.getInt("cliente_id"));
        r.setMonto(rs.getBigDecimal("monto"));
        r.setCreatedAt(rs.getTimestamp("created_at").toLocalDateTime());
        return r;
    }
}