package service;

import dao.ComisionDAO;
import dao.RecargaSaldoDAO;
import dao.UsuarioDAO;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.sql.SQLException;
import java.util.LinkedHashMap;
import java.util.Map;

/**
 * Lógica de negocio para:
 * - saldo de usuarios
 * - recargas
 * - comisiones de plataforma
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

    // ─────────────────────────────────────────────────────────────
    // CONSULTAR SALDO
    // ─────────────────────────────────────────────────────────────

    public BigDecimal consultarSaldo(int usuarioId) throws SQLException {

        validarUsuario(usuarioId);

        BigDecimal saldo = usuarioDAO.obtenerSaldo(usuarioId);

        if (saldo == null) {
            throw new IllegalArgumentException("Usuario no encontrado");
        }

        return saldo.setScale(2, RoundingMode.HALF_UP);
    }

    // ─────────────────────────────────────────────────────────────
    // RECARGAR SALDO
    // ─────────────────────────────────────────────────────────────

    public Map<String, Object> recargar(
            int clienteId,
            Object montoRaw
    ) throws SQLException {

        validarUsuario(clienteId);

        if (montoRaw == null) {
            throw new IllegalArgumentException(
                    "El campo 'monto' es requerido"
            );
        }

        BigDecimal monto;

        try {

            monto = new BigDecimal(montoRaw.toString());

        } catch (Exception e) {

            throw new IllegalArgumentException(
                    "Monto inválido"
            );
        }

        if (monto.compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException(
                    "El monto debe ser mayor a cero"
            );
        }

        if (monto.compareTo(BigDecimal.valueOf(100000)) > 0) {
            throw new IllegalArgumentException(
                    "Monto demasiado alto"
            );
        }

        monto = monto.setScale(2, RoundingMode.HALF_UP);

        int recargaId = recargaDAO.recargar(clienteId, monto);

        BigDecimal nuevoSaldo = usuarioDAO.obtenerSaldo(clienteId);

        Map<String, Object> result = new LinkedHashMap<>();

        result.put("id", recargaId);

        result.put(
                "mensaje",
                "Recarga realizada correctamente"
        );

        result.put(
                "montoRecargado",
                monto
        );

        result.put(
                "nuevoSaldo",
                nuevoSaldo
        );

        System.out.println("[SaldoService.recargar] ✓ Recarga realizada");

        return result;
    }

    // ─────────────────────────────────────────────────────────────
    // SALDO PLATAFORMA
    // ─────────────────────────────────────────────────────────────

    public Map<String, Object> saldoPlataforma() throws SQLException {

        Map<String, Object> data = new LinkedHashMap<>();

        data.put(
                "saldoTotal",
                comisionDAO.saldoPlataformaTotal()
        );

        data.put(
                "historial",
                comisionDAO.historialComisiones()
        );

        return data;
    }

    // ─────────────────────────────────────────────────────────────
    // INFORMACIÓN COMISIONES
    // ─────────────────────────────────────────────────────────────

    public Map<String, Object> infoComision() throws SQLException {

        Map<String, Object> data = new LinkedHashMap<>();

        data.put(
                "vigente",
                comisionDAO.obtenerVigente()
        );

        data.put(
                "historial",
                comisionDAO.historial()
        );

        return data;
    }

    // ─────────────────────────────────────────────────────────────
    // CAMBIAR COMISIÓN
    // ─────────────────────────────────────────────────────────────

    public void cambiarComision(
            Object porcentajeRaw,
            int adminId
    ) throws SQLException {

        validarUsuario(adminId);

        if (porcentajeRaw == null) {
            throw new IllegalArgumentException(
                    "El campo 'porcentaje' es requerido"
            );
        }

        BigDecimal porcentaje;

        try {

            porcentaje = new BigDecimal(
                    porcentajeRaw.toString()
            );

        } catch (Exception e) {

            throw new IllegalArgumentException(
                    "Porcentaje inválido"
            );
        }

        if (porcentaje.compareTo(BigDecimal.ZERO) < 0 ||
                porcentaje.compareTo(BigDecimal.valueOf(100)) > 0) {

            throw new IllegalArgumentException(
                    "El porcentaje debe estar entre 0 y 100"
            );
        }

        porcentaje = porcentaje.setScale(2, RoundingMode.HALF_UP);

        comisionDAO.cambiarPorcentaje(
                porcentaje,
                adminId
        );

        System.out.println(
                "[SaldoService.cambiarComision] ✓ Comisión actualizada"
        );
    }

    // ─────────────────────────────────────────────────────────────
    // HELPERS
    // ─────────────────────────────────────────────────────────────

    private void validarUsuario(int usuarioId) {

        if (usuarioId <= 0) {
            throw new IllegalArgumentException(
                    "ID de usuario inválido"
            );
        }
    }
}