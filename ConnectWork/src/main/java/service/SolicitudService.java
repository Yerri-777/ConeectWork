package service;

import dao.SolicitudDAO;
import modelo.SolicitudCategoria;
import modelo.SolicitudHabilidad;

import java.sql.SQLException;
import java.util.List;
import java.util.Map;

/**
 * Lógica de negocio para solicitudes de habilidades y categorías.
 * ConnectWork - CUNOC
 */
public class SolicitudService {

    private final SolicitudDAO dao;

    public SolicitudService() {
        this.dao = new SolicitudDAO();
    }

    // ─────────────────────────────────────────────────────────
    // HABILIDADES
    // ─────────────────────────────────────────────────────────

    public int solicitarHabilidad(int freelancerId, Map<String, Object> datos) throws SQLException {

        if (freelancerId <= 0) {
            throw new IllegalArgumentException("Freelancer inválido");
        }

        if (datos == null) {
            throw new IllegalArgumentException("Datos requeridos");
        }

        String nombre = obtenerString(datos, "nombre", true);
        String descripcion = obtenerString(datos, "descripcion", false);

        SolicitudHabilidad s = new SolicitudHabilidad();
        s.setFreelancerId(freelancerId);
        s.setNombre(nombre);
        s.setDescripcion(descripcion);

        int id = dao.crearSolicitudHabilidad(s);

        System.out.println("[SolicitudService.solicitarHabilidad] ✓ ID: " + id);

        return id;
    }

    public List<SolicitudHabilidad> listarSolicitudesHabilidad(String estado) throws SQLException {

        if (estado != null && !estado.isBlank()) {
            estado = estado.trim().toUpperCase();

            if (!estado.equals("PENDIENTE")
                    && !estado.equals("ACEPTADA")
                    && !estado.equals("RECHAZADA")) {

                throw new IllegalArgumentException("Estado inválido");
            }
        }

        return dao.listarSolicitudesHabilidad(estado);
    }

    public void resolverHabilidad(int id, String accion, int adminId) throws SQLException {

        if (id <= 0) {
            throw new IllegalArgumentException("ID inválido");
        }

        if (adminId <= 0) {
            throw new IllegalArgumentException("Administrador inválido");
        }

        String estado = resolverAccion(accion);

        boolean ok = dao.resolverSolicitudHabilidad(id, estado, adminId);

        if (!ok) {
            throw new IllegalArgumentException("Solicitud no encontrada o ya procesada");
        }

        System.out.println("[SolicitudService.resolverHabilidad] ✓ ID: " + id + " -> " + estado);
    }

    // ─────────────────────────────────────────────────────────
    // CATEGORÍAS
    // ─────────────────────────────────────────────────────────

    public int solicitarCategoria(int clienteId, Map<String, Object> datos) throws SQLException {

        if (clienteId <= 0) {
            throw new IllegalArgumentException("Cliente inválido");
        }

        if (datos == null) {
            throw new IllegalArgumentException("Datos requeridos");
        }

        String nombre = obtenerString(datos, "nombre", true);
        String descripcion = obtenerString(datos, "descripcion", false);

        SolicitudCategoria s = new SolicitudCategoria();
        s.setClienteId(clienteId);
        s.setNombre(nombre);
        s.setDescripcion(descripcion);

        int id = dao.crearSolicitudCategoria(s);

        System.out.println("[SolicitudService.solicitarCategoria] ✓ ID: " + id);

        return id;
    }

    public List<SolicitudCategoria> listarSolicitudesCategoria(String estado) throws SQLException {

        if (estado != null && !estado.isBlank()) {

            estado = estado.trim().toUpperCase();

            if (!estado.equals("PENDIENTE")
                    && !estado.equals("ACEPTADA")
                    && !estado.equals("RECHAZADA")) {

                throw new IllegalArgumentException("Estado inválido");
            }
        }

        return dao.listarSolicitudesCategoria(estado);
    }

    public void resolverCategoria(int id, String accion, int adminId) throws SQLException {

        if (id <= 0) {
            throw new IllegalArgumentException("ID inválido");
        }

        if (adminId <= 0) {
            throw new IllegalArgumentException("Administrador inválido");
        }

        String estado = resolverAccion(accion);

        boolean ok = dao.resolverSolicitudCategoria(id, estado, adminId);

        if (!ok) {
            throw new IllegalArgumentException("Solicitud no encontrada o ya procesada");
        }

        System.out.println("[SolicitudService.resolverCategoria] ✓ ID: " + id + " -> " + estado);
    }

    // ─────────────────────────────────────────────────────────
    // HELPERS
    // ─────────────────────────────────────────────────────────

    private String resolverAccion(String accion) {

        if (accion == null || accion.isBlank()) {
            throw new IllegalArgumentException("Acción requerida");
        }

        accion = accion.trim().toLowerCase();

        return switch (accion) {

            case "aceptar" -> "ACEPTADA";

            case "rechazar" -> "RECHAZADA";

            default -> throw new IllegalArgumentException("Acción no válida: " + accion);
        };
    }

    private String obtenerString(Map<String, Object> datos, String key, boolean requerido) {

        Object val = datos.get(key);

        if (val == null) {

            if (requerido) {
                throw new IllegalArgumentException("Campo requerido: " + key);
            }

            return null;
        }

        String texto = val.toString().trim();

        if (requerido && texto.isBlank()) {
            throw new IllegalArgumentException("Campo requerido: " + key);
        }

        return texto.isBlank() ? null : texto;
    }
}