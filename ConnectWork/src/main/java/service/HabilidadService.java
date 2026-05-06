package service;

import dao.HabilidadDAO;
import modelo.Habilidad;

import java.sql.SQLException;
import java.util.List;

/**
 * Lógica de negocio para habilidades del catálogo.
 */
public class HabilidadService {

    private final HabilidadDAO dao;

    public HabilidadService() {
        this.dao = new HabilidadDAO();
    }

    public int crear(Habilidad h) throws SQLException {
        if (h.getNombre() == null || h.getNombre().isBlank()) {
            throw new IllegalArgumentException("El nombre de la habilidad es requerido");
        }
        if (h.getCategoriaId() <= 0) {
            throw new IllegalArgumentException("categoriaId es requerido");
        }
        return dao.crear(h);
    }

    public void actualizar(Habilidad h) throws SQLException {
        if (h.getNombre() == null || h.getNombre().isBlank()) {
            throw new IllegalArgumentException("El nombre de la habilidad es requerido");
        }
        boolean ok = dao.actualizar(h);
        if (!ok) {
            throw new IllegalArgumentException("Habilidad no encontrada");
        }
    }

    public void cambiarEstado(int id, boolean activo) throws SQLException {
        boolean ok = dao.cambiarEstado(id, activo);
        if (!ok) {
            throw new IllegalArgumentException("Habilidad no encontrada");
        }
    }

    public List<Habilidad> listar(Integer categoriaId, boolean soloActivas) throws SQLException {
        return dao.listar(categoriaId, soloActivas);
    }

    public List<Habilidad> listarPorFreelancer(int usuarioId) throws SQLException {
        return dao.listarPorFreelancer(usuarioId);
    }

    public List<Habilidad> listarPorProyecto(int proyectoId) throws SQLException {
        return dao.listarPorProyecto(proyectoId);
    }
}
