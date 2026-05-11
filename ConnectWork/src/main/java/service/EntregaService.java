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
 * Lógica de negocio de entregas y calificaciones.
 * ConnectWork - CUNOC
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

    /**
     * Freelancer sube entrega
     */
    public int subir(
            int freelancerId,
            Map<String, Object> datos
    ) throws SQLException {

        validarId(freelancerId);

        if (datos == null || datos.isEmpty()) {

            throw new IllegalArgumentException(
                    "Datos requeridos"
            );
        }

        // ───────────────── CAMPOS ─────────────────

        Object contratoIdObj =
                datos.get("contratoId");

        String descripcion =
                obtenerTexto(datos.get("descripcion"));

        String archivosUrl =
                obtenerTexto(datos.get("archivosUrl"));

        if (contratoIdObj == null) {

            throw new IllegalArgumentException(
                    "contratoId requerido"
            );
        }

        if (descripcion == null || descripcion.isBlank()) {

            throw new IllegalArgumentException(
                    "Descripción requerida"
            );
        }

        if (archivosUrl == null || archivosUrl.isBlank()) {

            throw new IllegalArgumentException(
                    "archivosUrl requerido"
            );
        }

        int contratoId =
                ((Number) contratoIdObj).intValue();

        // ───────────────── CONTRATO ─────────────────

        Contrato contrato =
                contratoDAO.buscarPorId(contratoId);

        if (contrato == null) {

            throw new IllegalArgumentException(
                    "Contrato no encontrado"
            );
        }

        if (contrato.getFreelancerId() != freelancerId) {

            throw new SecurityException(
                    "No es tu contrato"
            );
        }

        if (!"ACTIVO".equalsIgnoreCase(
                contrato.getEstado())) {

            throw new IllegalStateException(
                    "El contrato no está activo"
            );
        }

        // ───────────────── VALIDAR ENTREGAS ─────────────────

        boolean pendiente =
                entregaDAO.listarPorContrato(contratoId)
                        .stream()
                        .anyMatch(e ->
                                "PENDIENTE".equalsIgnoreCase(
                                        e.getEstado()
                                )
                        );

        if (pendiente) {

            throw new IllegalStateException(
                    "Ya existe una entrega pendiente"
            );
        }

        // ───────────────── CREAR ENTREGA ─────────────────

        Entrega e = new Entrega();

        e.setContratoId(contratoId);

        e.setDescripcion(
                descripcion.trim()
        );

        e.setArchivosUrl(
                archivosUrl.trim()
        );

        int id = entregaDAO.crear(e);

        proyectoDAO.cambiarEstado(
                contrato.getProyectoId(),
                "ENTREGA_PENDIENTE"
        );

        System.out.println(
                "[EntregaService.subir] ✓ Entrega ID: " + id
        );

        return id;
    }

    /**
     * Aprobar entrega
     */
    public int aprobar(
            int entregaId,
            int clienteId
    ) throws SQLException {

        validarId(entregaId);

        validarId(clienteId);

        Entrega entrega =
                entregaDAO.buscarPorId(entregaId);

        if (entrega == null) {

            throw new IllegalArgumentException(
                    "Entrega no encontrada"
            );
        }

        if (!"PENDIENTE".equalsIgnoreCase(
                entrega.getEstado())) {

            throw new IllegalStateException(
                    "La entrega ya fue procesada"
            );
        }

        Contrato contrato =
                contratoDAO.buscarPorId(
                        entrega.getContratoId()
                );

        if (contrato == null) {

            throw new IllegalArgumentException(
                    "Contrato no encontrado"
            );
        }

        if (contrato.getClienteId() != clienteId) {

            throw new SecurityException(
                    "No es tu contrato"
            );
        }

        entregaDAO.aprobar(entregaId);

        contratoDAO.completar(
                contrato.getId()
        );

        proyectoDAO.cambiarEstado(
                contrato.getProyectoId(),
                "COMPLETADO"
        );

        System.out.println(
                "[EntregaService.aprobar] ✓ Contrato completado ID: "
                        + contrato.getId()
        );

        return contrato.getId();
    }

    /**
     * Rechazar entrega
     */
    public void rechazar(
            int entregaId,
            int clienteId,
            String motivo
    ) throws SQLException {

        validarId(entregaId);

        validarId(clienteId);

        if (motivo == null || motivo.isBlank()) {

            throw new IllegalArgumentException(
                    "Motivo requerido"
            );
        }

        Entrega entrega =
                entregaDAO.buscarPorId(entregaId);

        if (entrega == null) {

            throw new IllegalArgumentException(
                    "Entrega no encontrada"
            );
        }

        if (!"PENDIENTE".equalsIgnoreCase(
                entrega.getEstado())) {

            throw new IllegalStateException(
                    "La entrega ya fue procesada"
            );
        }

        Contrato contrato =
                contratoDAO.buscarPorId(
                        entrega.getContratoId()
                );

        if (contrato == null) {

            throw new IllegalArgumentException(
                    "Contrato no encontrado"
            );
        }

        if (contrato.getClienteId() != clienteId) {

            throw new SecurityException(
                    "No es tu contrato"
            );
        }

        entregaDAO.rechazar(
                entregaId,
                motivo.trim()
        );

        proyectoDAO.cambiarEstado(
                contrato.getProyectoId(),
                "EN_PROGRESO"
        );

        System.out.println(
                "[EntregaService.rechazar] ✓ Entrega rechazada ID: "
                        + entregaId
        );
    }

    /**
     * Calificar freelancer
     */
    public void calificar(
            int contratoId,
            int clienteId,
            Map<String, Object> datos
    ) throws SQLException {

        validarId(contratoId);

        validarId(clienteId);

        if (datos == null) {

            throw new IllegalArgumentException(
                    "Datos requeridos"
            );
        }

        Object estrellasObj =
                datos.get("estrellas");

        if (estrellasObj == null) {

            throw new IllegalArgumentException(
                    "Las estrellas son requeridas"
            );
        }

        int estrellas =
                ((Number) estrellasObj).intValue();

        if (estrellas < 1 || estrellas > 5) {

            throw new IllegalArgumentException(
                    "Las estrellas deben estar entre 1 y 5"
            );
        }

        Contrato contrato =
                contratoDAO.buscarPorId(contratoId);

        if (contrato == null) {

            throw new IllegalArgumentException(
                    "Contrato no encontrado"
            );
        }

        if (contrato.getClienteId() != clienteId) {

            throw new SecurityException(
                    "No es tu contrato"
            );
        }

        if (!"COMPLETADO".equalsIgnoreCase(
                contrato.getEstado())) {

            throw new IllegalStateException(
                    "Solo se califican contratos completados"
            );
        }

        if (calificacionDAO.yaCalificado(
                contratoId)) {

            throw new IllegalStateException(
                    "Ya calificaste este contrato"
            );
        }

        Calificacion cal = new Calificacion();

        cal.setContratoId(contratoId);

        cal.setClienteId(clienteId);

        cal.setFreelancerId(
                contrato.getFreelancerId()
        );

        cal.setEstrellas(estrellas);

        cal.setComentario(
                obtenerTexto(datos.get("comentario"))
        );

        calificacionDAO.crear(cal);

        // recalcular promedio freelancer
        perfilDAO.recalcularCalificacion(
                contrato.getFreelancerId()
        );

        System.out.println(
                "[EntregaService.calificar] ✓ Calificación registrada"
        );
    }

    /**
     * Validar ID
     */
    private void validarId(int id) {

        if (id <= 0) {

            throw new IllegalArgumentException(
                    "ID inválido"
            );
        }
    }

    /**
     * Obtener texto seguro
     */
    private String obtenerTexto(Object obj) {

        if (obj == null) {
            return null;
        }

        return obj.toString().trim();
    }
}