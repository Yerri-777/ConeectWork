package service;

import dao.SolicitudDAO;
import modelo.SolicitudCategoria;
import modelo.SolicitudHabilidad;

import java.sql.SQLException;
import java.util.List;
import java.util.Map;

/**
 * Lógica de negocio para solicitudes de nuevas habilidades y categorías.
 */
public class SolicitudService {

    private final SolicitudDAO dao;

    public SolicitudService() {
        this.dao = new SolicitudDAO();
    }

    // ── HABILIDADES ─────────────────────────────────────────────────────────
    public int solicitarHabilidad(int freelancerId, Map<String, Object> datos) throws SQLException {
        if (datos.get("nombre") == null || datos.get("nombre").toString().isBlank()) {
            throw new IllegalArgumentException("El campo 'nombre' es requerido");
        }
        SolicitudHabilidad s = new SolicitudHabilidad();
        s.setFreelancerId(freelancerId);
        s.setNombre((String) datos.get("nombre"));
        s.setDescripcion((String) datos.get("descripcion"));
        return dao.crearSolicitudHabilidad(s);
    }

    public List<SolicitudHabilidad> listarSolicitudesHabilidad(String estado) throws SQLException {
        return dao.listarSolicitudesHabilidad(estado);
    }

    public void resolverHabilidad(int id, String accion, int adminId) throws SQLException {
        String estado = resolverAccion(accion);
        boolean ok = dao.resolverSolicitudHabilidad(id, estado, adminId);
        if (!ok) {
            throw new IllegalArgumentException("Solicitud no encontrada o ya procesada");
        }
    }

    // ── CATEGORÍAS ──────────────────────────────────────────────────────────
    public int solicitarCategoria(int clienteId, Map<String, Object> datos) throws SQLException {
        if (datos.get("nombre") == null || datos.get("nombre").toString().isBlank()) {
            throw new IllegalArgumentException("El campo 'nombre' es requerido");
        }
        SolicitudCategoria s = new SolicitudCategoria();
        s.setClienteId(clienteId);
        s.setNombre((String) datos.get("nombre"));
        s.setDescripcion((String) datos.get("descripcion"));
        return dao.crearSolicitudCategoria(s);
    }

    public List<SolicitudCategoria> listarSolicitudesCategoria(String estado) throws SQLException {
        return dao.listarSolicitudesCategoria(estado);
    }

    public void resolverCategoria(int id, String accion, int adminId) throws SQLException {
        String estado = resolverAccion(accion);
        boolean ok = dao.resolverSolicitudCategoria(id, estado, adminId);
        if (!ok) {
            throw new IllegalArgumentException("Solicitud no encontrada o ya procesada");
        }
    }

    private String resolverAccion(String accion) {
        return switch (accion) {
            case "aceptar" ->
                "ACEPTADA";
            case "rechazar" ->
                "RECHAZADA";
            default ->
                throw new IllegalArgumentException("Acción no válida: " + accion);
        };
    }
}
