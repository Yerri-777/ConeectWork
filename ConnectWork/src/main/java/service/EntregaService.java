package service;

import dao.CalificacionDAO;
import dao.ContratoDAO;
import dao.EntregaDAO;
import dao.PerfilDAO;
import dao.ProyectoDAO;
import modelo.Calificacion;
import modelo.Contrato;
import modelo.Entrega;

import java.sql.SQLException;
import java.util.Map;

/**
 * Lógica de negocio para entregas y calificaciones.
 */
public class EntregaService {

    private final EntregaDAO entregaDAO;
    private final ContratoDAO contratoDAO;
    private final ProyectoDAO proyectoDAO;
    private final CalificacionDAO calificacionDAO;
    private final PerfilDAO perfilDAO;

    public EntregaService() {
        this.entregaDAO = new EntregaDAO();
        this.contratoDAO = new ContratoDAO();
        this.proyectoDAO = new ProyectoDAO();
        this.calificacionDAO = new CalificacionDAO();
        this.perfilDAO = new PerfilDAO();
    }

    // ─── Subir entrega ────────────────────────────────────────────────────────
    public int subir(int freelancerId, Map<String, Object> datos) throws SQLException {
        if (datos.get("contratoId") == null || datos.get("descripcion") == null
                || datos.get("archivosUrl") == null) {
            throw new IllegalArgumentException("contratoId, descripcion y archivosUrl son requeridos");
        }

        int contratoId = ((Number) datos.get("contratoId")).intValue();
        Contrato contrato = contratoDAO.buscarPorId(contratoId);
        if (contrato == null) {
            throw new IllegalArgumentException("Contrato no encontrado");
        }
        if (contrato.getFreelancerId() != freelancerId) {
            throw new SecurityException("No es tu contrato");
        }
        if (!"ACTIVO".equals(contrato.getEstado())) {
            throw new IllegalStateException("El contrato no está activo");
        }

        Entrega e = new Entrega();
        e.setContratoId(contratoId);
        e.setDescripcion((String) datos.get("descripcion"));
        e.setArchivosUrl((String) datos.get("archivosUrl"));

        int id = entregaDAO.crear(e);
        proyectoDAO.cambiarEstado(contrato.getProyectoId(), "ENTREGA_PENDIENTE");
        return id;
    }

    // ─── Aprobar entrega → completa contrato ─────────────────────────────────
    public int aprobar(int entregaId, int clienteId) throws SQLException {
        Entrega entrega = entregaDAO.buscarPorId(entregaId);
        if (entrega == null) {
            throw new IllegalArgumentException("Entrega no encontrada");
        }
        if (!"PENDIENTE".equals(entrega.getEstado())) {
            throw new IllegalStateException("La entrega ya fue procesada");
        }

        Contrato contrato = contratoDAO.buscarPorId(entrega.getContratoId());
        if (contrato == null) {
            throw new IllegalArgumentException("Contrato no encontrado");
        }
        if (contrato.getClienteId() != clienteId) {
            throw new SecurityException("No es tu contrato");
        }

        entregaDAO.aprobar(entregaId);
        contratoDAO.completar(contrato.getId());

        return contrato.getId();   // devuelve contratoId para que el cliente pueda calificar
    }

    // ─── Rechazar entrega → vuelve a EN_PROGRESO ─────────────────────────────
    public void rechazar(int entregaId, int clienteId, String motivo) throws SQLException {
        if (motivo == null || motivo.isBlank()) {
            throw new IllegalArgumentException("El motivo de rechazo es obligatorio");
        }

        Entrega entrega = entregaDAO.buscarPorId(entregaId);
        if (entrega == null) {
            throw new IllegalArgumentException("Entrega no encontrada");
        }
        if (!"PENDIENTE".equals(entrega.getEstado())) {
            throw new IllegalStateException("La entrega ya fue procesada");
        }

        Contrato contrato = contratoDAO.buscarPorId(entrega.getContratoId());
        if (contrato == null) {
            throw new IllegalArgumentException("Contrato no encontrado");
        }
        if (contrato.getClienteId() != clienteId) {
            throw new SecurityException("No es tu contrato");
        }

        entregaDAO.rechazar(entregaId, motivo);
        proyectoDAO.cambiarEstado(contrato.getProyectoId(), "EN_PROGRESO");
    }

    // ─── Calificar freelancer ─────────────────────────────────────────────────
    public void calificar(int contratoId, int clienteId, Map<String, Object> datos) throws SQLException {
        if (datos.get("estrellas") == null) {
            throw new IllegalArgumentException("El campo 'estrellas' es requerido");
        }

        Contrato contrato = contratoDAO.buscarPorId(contratoId);
        if (contrato == null) {
            throw new IllegalArgumentException("Contrato no encontrado");
        }
        if (contrato.getClienteId() != clienteId) {
            throw new SecurityException("No es tu contrato");
        }
        if (!"COMPLETADO".equals(contrato.getEstado())) {
            throw new IllegalStateException("Solo se puede calificar contratos completados");
        }
        if (calificacionDAO.yaCalificado(contratoId)) {
            throw new IllegalStateException("Ya calificaste este contrato");
        }

        int estrellas = ((Number) datos.get("estrellas")).intValue();
        if (estrellas < 1 || estrellas > 5) {
            throw new IllegalArgumentException("Las estrellas deben ser entre 1 y 5");
        }

        Calificacion cal = new Calificacion();
        cal.setContratoId(contratoId);
        cal.setClienteId(clienteId);
        cal.setFreelancerId(contrato.getFreelancerId());
        cal.setEstrellas(estrellas);
        cal.setComentario((String) datos.get("comentario"));

        calificacionDAO.crear(cal);
        perfilDAO.recalcularCalificacion(contrato.getFreelancerId());
    }
}
