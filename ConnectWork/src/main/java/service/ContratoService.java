package service;

import dao.ContratoDAO;
import dao.EntregaDAO;

import modelo.Contrato;
import modelo.Entrega;

import java.sql.SQLException;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

public class ContratoService {

    private final ContratoDAO contratoDAO;

    private final EntregaDAO entregaDAO;

    public ContratoService() {

        this.contratoDAO =
                new ContratoDAO();

        this.entregaDAO =
                new EntregaDAO();
    }

    // =====================================================
    // ADMIN
    // =====================================================

    public List<Contrato> listarTodos()
            throws SQLException {

        return contratoDAO.listarTodos();
    }

    // =====================================================
    // FREELANCER
    // =====================================================

    public List<Contrato> listarActivosFreelancer(
            int freelancerId
    ) throws SQLException {

        validarId(freelancerId);

        return contratoDAO.listarPorFreelancer(
                freelancerId
        );
    }

    // =====================================================
    // CLIENTE
    // =====================================================

    public List<Contrato> listarTodosCliente(
            int clienteId
    ) throws SQLException {

        validarId(clienteId);

        return contratoDAO.listarPorCliente(
                clienteId
        );
    }

    // =====================================================
    // DETALLE
    // =====================================================

    public Map<String, Object> detalle(
            int contratoId,
            int usuarioId,
            String rol
    ) throws SQLException {

        validarId(contratoId);

        validarId(usuarioId);

        Contrato contrato =
                contratoDAO.buscarPorId(
                        contratoId
                );

        if (contrato == null) {

            throw new IllegalArgumentException(
                    "Contrato no encontrado"
            );
        }

        boolean esAdmin =
                "ADMIN".equalsIgnoreCase(rol);

        boolean esCliente =
                contrato.getClienteId()
                        == usuarioId;

        boolean esFreelancer =
                contrato.getFreelancerId()
                        == usuarioId;

        if (!esAdmin
                && !esCliente
                && !esFreelancer) {

            throw new SecurityException(
                    "No autorizado"
            );
        }

        List<Entrega> entregas =
                entregaDAO.listarPorContrato(
                        contratoId
                );

        Map<String, Object> data =
                new LinkedHashMap<>();

        data.put("contrato", contrato);

        data.put("entregas", entregas);

        return data;
    }

    // =====================================================
    // CANCELAR
    // =====================================================

    public void cancelar(
            int contratoId,
            int clienteId,
            String motivo
    ) throws SQLException {

        validarId(contratoId);

        validarId(clienteId);

        if (motivo == null
                || motivo.isBlank()) {

            throw new IllegalArgumentException(
                    "Motivo requerido"
            );
        }

        motivo = motivo.trim();

        if (motivo.length() < 5) {

            throw new IllegalArgumentException(
                    "Motivo demasiado corto"
            );
        }

        Contrato contrato =
                contratoDAO.buscarPorId(
                        contratoId
                );

        if (contrato == null) {

            throw new IllegalArgumentException(
                    "Contrato no encontrado"
            );
        }

        // ownership
        if (contrato.getClienteId()
                != clienteId) {

            throw new SecurityException(
                    "No puedes cancelar este contrato"
            );
        }

        // estado válido
        if (!"ACTIVO".equalsIgnoreCase(
                contrato.getEstado()
        )) {

            throw new IllegalStateException(
                    "Solo contratos activos pueden cancelarse"
            );
        }

        // entregas pendientes
        List<Entrega> entregas =
                entregaDAO.listarPorContrato(
                        contratoId
                );

        boolean pendientes =
                entregas.stream()

                        .anyMatch(e ->

                                "PENDIENTE"
                                        .equalsIgnoreCase(
                                                e.getEstado()
                                        )
                        );

        if (pendientes) {

            throw new IllegalStateException(
                    "Existen entregas pendientes"
            );
        }

        contratoDAO.cancelar(
                contratoId,
                motivo
        );

        System.out.println(
                "[ContratoService] ✓ Contrato cancelado ID: "
                        + contratoId
        );
    }

    // =====================================================
    // VALIDAR ID
    // =====================================================

    private void validarId(int id) {

        if (id <= 0) {

            throw new IllegalArgumentException(
                    "ID inválido"
            );
        }
    }
}