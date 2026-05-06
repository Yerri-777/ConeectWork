package service;

import dao.CategoriaDAO;
import modelo.Categoria;

import java.sql.SQLException;
import java.util.List;

/**
 * Lógica de negocio para categorías de servicios.
 */
public class CategoriaService {

    private final CategoriaDAO dao;

    public CategoriaService() {
        this.dao = new CategoriaDAO();
    }

    public int crear(Categoria c) throws SQLException {
        if (c.getNombre() == null || c.getNombre().isBlank()) {
            throw new IllegalArgumentException("El nombre de la categoría es requerido");
        }
        return dao.crear(c);
    }

    public void actualizar(Categoria c) throws SQLException {
        if (c.getNombre() == null || c.getNombre().isBlank()) {
            throw new IllegalArgumentException("El nombre de la categoría es requerido");
        }
        boolean ok = dao.actualizar(c);
        if (!ok) {
            throw new IllegalArgumentException("Categoría no encontrada");
        }
    }

    public void cambiarEstado(int id, boolean activo) throws SQLException {
        boolean ok = dao.cambiarEstado(id, activo);
        if (!ok) {
            throw new IllegalArgumentException("Categoría no encontrada");
        }
    }

    public List<Categoria> listar(boolean soloActivas) throws SQLException {
        return dao.listar(soloActivas);
    }

    public Categoria buscarPorId(int id) throws SQLException {
        Categoria c = dao.buscarPorId(id);
        if (c == null) {
            throw new IllegalArgumentException("Categoría no encontrada");
        }
        return c;
    }
}
