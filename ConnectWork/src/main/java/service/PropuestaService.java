package service;

import dao.ContratoDAO;
import dao.PropuestaDAO;
import dao.ProyectoDAO;
import modelo.Propuesta;
import modelo.Proyecto;

import java.math.BigDecimal;
import java.sql.SQLException;
import java.util.List;
import java.util.Map;

public class PropuestaService {

    private final PropuestaDAO propuestaDAO;
    private final ProyectoDAO proyectoDAO;
    private final ContratoDAO contratoDAO;

    public PropuestaService() {
        this.propuestaDAO = new PropuestaDAO();
        this.proyectoDAO = new ProyectoDAO();
        this.contratoDAO = new ContratoDAO();
    }

    // ─────────────────────────────────────────────────────────────
    // ENVIAR PROPUESTA
    // ─────────────────────────────────────────────────────────────
    public int enviar(int freelancerId, Map<String, Object> datos) throws SQLException {

        if (datos == null) {
            throw new IllegalArgumentException("Datos requeridos");
        }

        if (datos.get("proyectoId") == null) {
            throw new IllegalArgumentException("proyectoId es requerido");
        }

        if (datos.get("montoOfertado") == null) {
            throw new IllegalArgumentException("montoOfertado es requerido");
        }

        if (datos.get("plazoDias") == null) {
            throw new IllegalArgumentException("plazoDias es requerido");
        }

        int proyectoId = ((Number) datos.get("proyectoId")).intValue();

        Proyecto proyecto = proyectoDAO.buscarPorId(proyectoId);

        if (proyecto == null) {
            throw new IllegalArgumentException("Proyecto no encontrado");
        }

        if (!"ABIERTO".equals(proyecto.getEstado())) {
            throw new IllegalStateException("El proyecto no está disponible");
        }

        if (proyecto.getClienteId() == freelancerId) {
            throw new IllegalStateException("No puedes ofertar en tu propio proyecto");
        }

        boolean cumple = propuestaDAO.freelancerCumpleHabilidades(freelancerId, proyectoId);

        if (!cumple) {
            throw new IllegalStateException("No cumples las habilidades requeridas");
        }

        BigDecimal monto = new BigDecimal(datos.get("montoOfertado").toString());

        if (monto.compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("El monto debe ser mayor a 0");
        }

        if (monto.compareTo(proyecto.getPresupuestoMax()) > 0) {
            throw new IllegalArgumentException("La propuesta excede el presupuesto máximo");
        }

        int plazoDias = ((Number) datos.get("plazoDias")).intValue();

        if (plazoDias <= 0) {
            throw new IllegalArgumentException("El plazo debe ser mayor a 0");
        }

        Propuesta propuesta = new Propuesta();
        propuesta.setProyectoId(proyectoId);
        propuesta.setFreelancerId(freelancerId);
        propuesta.setMontoOfertado(monto);
        propuesta.setPlazoDias(plazoDias);
        propuesta.setCartaPresentacion((String) datos.get("cartaPresentacion"));

        int id = propuestaDAO.enviar(propuesta);

        System.out.println("[PropuestaService.enviar] ✓ Propuesta enviada ID: " + id);

        return id;
    }

    // ─────────────────────────────────────────────────────────────
    // RETIRAR PROPUESTA
    // ─────────────────────────────────────────────────────────────
    public void retirar(int propuestaId, int freelancerId) throws SQLException {

        if (propuestaId <= 0) {
            throw new IllegalArgumentException("ID inválido");
        }

        boolean ok = propuestaDAO.retirar(propuestaId, freelancerId);

        if (!ok) {
            throw new IllegalStateException("No se puede retirar la propuesta");
        }

        System.out.println("[PropuestaService.retirar] ✓ Propuesta retirada");
    }

    // ─────────────────────────────────────────────────────────────
    // ACEPTAR PROPUESTA
    // ─────────────────────────────────────────────────────────────
    public Map<String, Object> aceptar(int propuestaId, int clienteId) throws SQLException {

        Propuesta propuesta = propuestaDAO.buscarPorId(propuestaId);

        if (propuesta == null) {
            throw new IllegalArgumentException("Propuesta no encontrada");
        }

        Proyecto proyecto = proyectoDAO.buscarPorId(propuesta.getProyectoId());

        if (proyecto == null) {
            throw new IllegalArgumentException("Proyecto no encontrado");
        }

        if (proyecto.getClienteId() != clienteId) {
            throw new SecurityException("No autorizado");
        }

        if (!"ABIERTO".equals(proyecto.getEstado())) {
            throw new IllegalStateException("El proyecto ya no está disponible");
        }

        int contratoId = contratoDAO.crear(
                propuestaId,
                propuesta.getProyectoId(),
                clienteId,
                propuesta.getFreelancerId(),
                propuesta.getMontoOfertado()
        );

        propuestaDAO.rechazarOtras(propuesta.getProyectoId(), propuestaId);

        System.out.println("[PropuestaService.aceptar] ✓ Contrato generado ID: " + contratoId);

        return Map.of(
                "contratoId", contratoId,
                "mensaje", "Contrato generado correctamente"
        );
    }

    // ─────────────────────────────────────────────────────────────
    // RECHAZAR PROPUESTA
    // ─────────────────────────────────────────────────────────────
    public void rechazar(int propuestaId, int clienteId) throws SQLException {

        Propuesta propuesta = propuestaDAO.buscarPorId(propuestaId);

        if (propuesta == null) {
            throw new IllegalArgumentException("Propuesta no encontrada");
        }

        Proyecto proyecto = proyectoDAO.buscarPorId(propuesta.getProyectoId());

        if (proyecto == null) {
            throw new IllegalArgumentException("Proyecto no encontrado");
        }

        if (proyecto.getClienteId() != clienteId) {
            throw new SecurityException("No autorizado");
        }

        propuestaDAO.cambiarEstado(propuestaId, "RECHAZADA");

        System.out.println("[PropuestaService.rechazar] ✓ Propuesta rechazada");
    }

    // ─────────────────────────────────────────────────────────────
    // LISTAR PROPUESTAS DE PROYECTO
    // ─────────────────────────────────────────────────────────────
    public List<Propuesta> listarPorProyecto(int proyectoId, int usuarioId) throws SQLException {

        if (proyectoId <= 0) {
            throw new IllegalArgumentException("ID de proyecto inválido");
        }

        return propuestaDAO.listarPorProyecto(proyectoId);
    }

    // ─────────────────────────────────────────────────────────────
    // LISTAR PROPUESTAS DEL FREELANCER
    // ─────────────────────────────────────────────────────────────
    public List<Propuesta> listarMias(int freelancerId) throws SQLException {
        return propuestaDAO.listarPorFreelancer(freelancerId);
    }

    // ─────────────────────────────────────────────────────────────
    // ADMIN
    // ─────────────────────────────────────────────────────────────
    public List<Propuesta> listarPorProyectoAdmin(int proyectoId) throws SQLException {
        return propuestaDAO.listarPorProyecto(proyectoId);
    }
}