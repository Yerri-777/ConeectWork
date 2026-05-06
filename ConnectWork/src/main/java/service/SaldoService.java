package service;

import dao.ComisionDAO;
import dao.RecargaSaldoDAO;
import dao.UsuarioDAO;

import java.math.BigDecimal;
import java.sql.SQLException;
import java.util.LinkedHashMap;
import java.util.Map;

/**
 * Lógica de negocio para saldo de usuarios y comisiones de plataforma.
 */
public class SaldoService {

    private final UsuarioDAO usuarioDAO;
    private final RecargaSaldoDAO recargaDAO;
    private final ComisionDAO comisionDAO;

    public SaldoService() {
        this.usuarioDAO = new UsuarioDAO();
        this.recargaDAO = new RecargaSaldoDAO();
        this.comisionDAO = new ComisionDAO();
    }

    public BigDecimal consultarSaldo(int usuarioId) throws SQLException {
        BigDecimal saldo = usuarioDAO.consultarSaldo(usuarioId);
        if (saldo == null) {
            throw new IllegalArgumentException("Usuario no encontrado");
        }
        return saldo;
    }

    public Map<String, Object> recargar(int clienteId, Object montoRaw) throws SQLException {
        if (montoRaw == null) {
            throw new IllegalArgumentException("El campo 'monto' es requerido");
        }
        BigDecimal monto = new BigDecimal(montoRaw.toString());
        if (monto.compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("El monto debe ser mayor a cero");
        }

        int id = recargaDAO.recargar(clienteId, monto);
        BigDecimal nuevoSaldo = usuarioDAO.consultarSaldo(clienteId);

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("id", id);
        result.put("mensaje", "Recarga realizada correctamente");
        result.put("nuevoSaldo", nuevoSaldo);
        return result;
    }

    public Map<String, Object> saldoPlataforma() throws SQLException {
        Map<String, Object> data = new LinkedHashMap<>();
        data.put("saldoTotal", comisionDAO.saldoPlataformaTotal());
        data.put("historial", comisionDAO.historialComisiones());
        return data;
    }

    public Map<String, Object> infoComision() throws SQLException {
        Map<String, Object> data = new LinkedHashMap<>();
        data.put("vigente", comisionDAO.obtenerVigente());
        data.put("historial", comisionDAO.historial());
        return data;
    }

    public void cambiarComision(Object pctRaw, int adminId) throws SQLException {
        if (pctRaw == null) {
            throw new IllegalArgumentException("El campo 'porcentaje' es requerido");
        }
        BigDecimal pct = new BigDecimal(pctRaw.toString());
        if (pct.compareTo(BigDecimal.ZERO) < 0 || pct.compareTo(BigDecimal.valueOf(100)) > 0) {
            throw new IllegalArgumentException("El porcentaje debe estar entre 0 y 100");
        }
        comisionDAO.cambiarPorcentaje(pct, adminId);
    }
}
