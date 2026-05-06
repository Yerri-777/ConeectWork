package service;

import dao.HabilidadDAO;
import dao.ProyectoDAO;
import modelo.Proyecto;

import java.math.BigDecimal;
import java.sql.SQLException;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

/**
 * Lógica de negocio para proyectos.
 */
public class ProyectoService {

    private final ProyectoDAO  proyectoDAO;
    private final HabilidadDAO habilidadDAO;

    public ProyectoService() {
        this.proyectoDAO  = new ProyectoDAO();
        this.habilidadDAO = new HabilidadDAO();
    }

    // ─── Publicar ────────────────────────────────────────────────────────────
    public int publicar(int clienteId, Map<String, Object> datos) throws SQLException {
        validarCamposProyecto(datos);

        Proyecto p = mapearDesdeBody(datos);
        p.setClienteId(clienteId);
        int id = proyectoDAO.crear(p);

        // Enriquecer la respuesta inmediata con habilidades
        return id;
    }

    // ─── Editar ──────────────────────────────────────────────────────────────
    public void editar(int proyectoId, int clienteId, Map<String, Object> datos) throws SQLException {
        validarCamposProyecto(datos);
        Proyecto p = mapearDesdeBody(datos);
        p.setId(proyectoId);
        p.setClienteId(clienteId);
        boolean ok = proyectoDAO.actualizar(p);
        if (!ok) throw new IllegalStateException("No se puede editar: el proyecto no está ABIERTO o no te pertenece");
    }

    // ─── Cancelar proyecto ABIERTO ───────────────────────────────────────────
    public void cancelar(int proyectoId, int clienteId) throws SQLException {
        Proyecto p = proyectoDAO.buscarPorId(proyectoId);
        if (p == null) throw new IllegalArgumentException("Proyecto no encontrado");
        if (p.getClienteId() != clienteId) throw new SecurityException("No autorizado");
        if (!"ABIERTO".equals(p.getEstado()))
            throw new IllegalStateException("Solo se puede cancelar un proyecto en estado ABIERTO");
        proyectoDAO.cambiarEstado(proyectoId, "CANCELADO");
    }

    // ─── Listar ──────────────────────────────────────────────────────────────
    public List<Proyecto> listarDeCliente(int clienteId) throws SQLException {
        List<Proyecto> lista = proyectoDAO.listarPorCliente(clienteId);
        enriquecerHabilidades(lista);
        return lista;
    }

    public List<Proyecto> listarAbiertos(Integer categoriaId, Integer habilidadId,
                                          BigDecimal presMin, BigDecimal presMax) throws SQLException {
        List<Proyecto> lista = proyectoDAO.listarAbiertos(categoriaId, habilidadId, presMin, presMax);
        enriquecerHabilidades(lista);
        return lista;
    }

    public Proyecto buscarConHabilidades(int id) throws SQLException {
        Proyecto p = proyectoDAO.buscarPorId(id);
        if (p == null) throw new IllegalArgumentException("Proyecto no encontrado");
        p.setHabilidades(habilidadDAO.listarPorProyecto(id));
        return p;
    }

    // ─── Helpers ─────────────────────────────────────────────────────────────
    private void validarCamposProyecto(Map<String, Object> datos) {
        String[] campos = {"titulo","descripcion","categoriaId","presupuestoMax","fechaLimite","habilidadesIds"};
        for (String c : campos) {
            if (datos.get(c) == null)
                throw new IllegalArgumentException("Campo requerido: " + c);
        }
        List<?> habs = (List<?>) datos.get("habilidadesIds");
        if (habs.isEmpty())
            throw new IllegalArgumentException("Debe especificar al menos una habilidad requerida");
    }

    private Proyecto mapearDesdeBody(Map<String, Object> datos) {
        Proyecto p = new Proyecto();
        p.setTitulo((String) datos.get("titulo"));
        p.setDescripcion((String) datos.get("descripcion"));
        p.setCategoriaId(((Number) datos.get("categoriaId")).intValue());
        p.setPresupuestoMax(new BigDecimal(datos.get("presupuestoMax").toString()));
        p.setFechaLimite(LocalDate.parse((String) datos.get("fechaLimite")));
        List<Integer> habs = new ArrayList<>();
        for (Object h : (List<?>) datos.get("habilidadesIds")) habs.add(((Number) h).intValue());
        p.setHabilidadesIds(habs);
        return p;
    }

    private void enriquecerHabilidades(List<Proyecto> lista) throws SQLException {
        for (Proyecto p : lista)
            p.setHabilidades(habilidadDAO.listarPorProyecto(p.getId()));
    }
}