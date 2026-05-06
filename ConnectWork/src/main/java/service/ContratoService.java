package service;

import dao.ContratoDAO;
import dao.EntregaDAO;
import modelo.Contrato;
import modelo.Entrega;

import java.sql.SQLException;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 * Lógica de negocio para contratos.
 */
public class ContratoService {

    private final ContratoDAO contratoDAO;
    private final EntregaDAO entregaDAO;

    public ContratoService() {
        this.contratoDAO = new ContratoDAO();
        this.entregaDAO = new EntregaDAO();
    }

    public List<Contrato> listarActivosFreelancer(int freelancerId) throws SQLException {
        return contratoDAO.listarPorFreelancer(freelancerId);
    }

    public List<Contrato> listarTodosCliente(int clienteId) throws SQLException {
        return contratoDAO.listarPorCliente(clienteId);
    }

    public Map<String, Object> detalle(int contratoId, int usuarioId, String rol) throws SQLException {
        Contrato c = contratoDAO.buscarPorId(contratoId);
        if (c == null) {
            throw new IllegalArgumentException("Contrato no encontrado");
        }

        boolean esAdmin = "ADMIN".equals(rol);
        boolean esCliente = c.getClienteId() == usuarioId;
        boolean esFreelancer = c.getFreelancerId() == usuarioId;
        if (!esAdmin && !esCliente && !esFreelancer) {
            throw new SecurityException("No autorizado para ver este contrato");
        }

        List<Entrega> entregas = entregaDAO.listarPorContrato(contratoId);
        Map<String, Object> data = new LinkedHashMap<>();
        data.put("contrato", c);
        data.put("entregas", entregas);
        return data;
    }

    public void cancelar(int contratoId, int clienteId, String motivo) throws SQLException {
        if (motivo == null || motivo.isBlank()) {
            throw new IllegalArgumentException("El motivo de cancelación es obligatorio");
        }

        Contrato c = contratoDAO.buscarPorId(contratoId);
        if (c == null) {
            throw new IllegalArgumentException("Contrato no encontrado");
        }
        if (c.getClienteId() != clienteId) {
            throw new SecurityException("No es tu contrato");
        }
        if (!"ACTIVO".equals(c.getEstado())) {
            throw new IllegalStateException("Solo se pueden cancelar contratos activos");
        }

        contratoDAO.cancelar(contratoId, motivo);
    }
}
