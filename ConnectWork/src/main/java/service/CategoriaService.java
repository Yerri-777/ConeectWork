package service;

import dao.CategoriaDAO;

import modelo.Categoria;

import java.sql.SQLException;
import java.util.List;

public class CategoriaService {

    private final CategoriaDAO dao;

    public CategoriaService() {

        this.dao =
                new CategoriaDAO();
    }

    // =====================================================
    // CREAR
    // =====================================================

    public int crear(Categoria c)
            throws SQLException {

        validarCategoria(c);

        List<Categoria> existentes =
                dao.listar(false);

        boolean existe =
                existentes.stream()

                        .anyMatch(cat ->

                                cat.getNombre() != null
                                        && cat.getNombre()
                                        .trim()
                                        .equalsIgnoreCase(
                                                c.getNombre().trim()
                                        )
                        );

        if (existe) {

            throw new IllegalArgumentException(
                    "Ya existe una categoría con ese nombre"
            );
        }

        c.setNombre(
                c.getNombre().trim()
        );

        int id =
                dao.crear(c);

        System.out.println(
                "[CategoriaService] ✓ Creada ID: "
                        + id
        );

        return id;
    }

    // =====================================================
    // ACTUALIZAR
    // =====================================================

    public void actualizar(Categoria c)
            throws SQLException {

        validarCategoria(c);

        validarId(c.getId());

        Categoria existente =
                dao.buscarPorId(c.getId());

        if (existente == null) {

            throw new IllegalArgumentException(
                    "Categoría no encontrada"
            );
        }

        c.setNombre(
                c.getNombre().trim()
        );

        boolean ok =
                dao.actualizar(c);

        if (!ok) {

            throw new IllegalArgumentException(
                    "No se pudo actualizar"
            );
        }

        System.out.println(
                "[CategoriaService] ✓ Actualizada ID: "
                        + c.getId()
        );
    }

    // =====================================================
    // CAMBIAR ESTADO
    // =====================================================

    public void cambiarEstado(
            int id,
            boolean activo
    ) throws SQLException {

        validarId(id);

        Categoria categoria =
                dao.buscarPorId(id);

        if (categoria == null) {

            throw new IllegalArgumentException(
                    "Categoría no encontrada"
            );
        }

        boolean ok =
                dao.cambiarEstado(id, activo);

        if (!ok) {

            throw new IllegalArgumentException(
                    "No se pudo cambiar estado"
            );
        }

        System.out.println(
                "[CategoriaService] ✓ Estado actualizado"
        );
    }

    // =====================================================
    // LISTAR
    // =====================================================

    public List<Categoria> listar(
            boolean soloActivas
    ) throws SQLException {

        return dao.listar(soloActivas);
    }

    // =====================================================
    // BUSCAR
    // =====================================================

    public Categoria buscarPorId(int id)
            throws SQLException {

        validarId(id);

        Categoria categoria =
                dao.buscarPorId(id);

        if (categoria == null) {

            throw new IllegalArgumentException(
                    "Categoría no encontrada"
            );
        }

        return categoria;
    }

    // =====================================================
    // ELIMINAR
    // =====================================================

    public void eliminar(int id)
            throws SQLException {

        cambiarEstado(id, false);
    }

    // =====================================================
    // VALIDACIONES
    // =====================================================

    private void validarCategoria(
            Categoria c
    ) {

        if (c == null) {

            throw new IllegalArgumentException(
                    "Categoría inválida"
            );
        }

        if (c.getNombre() == null
                || c.getNombre().isBlank()) {

            throw new IllegalArgumentException(
                    "Nombre requerido"
            );
        }

        if (c.getNombre().trim().length() < 3) {

            throw new IllegalArgumentException(
                    "Nombre demasiado corto"
            );
        }

        if (c.getDescripcion() != null
                && c.getDescripcion().length() > 255) {

            throw new IllegalArgumentException(
                    "Descripción demasiado larga"
            );
        }
    }

    private void validarId(int id) {

        if (id <= 0) {

            throw new IllegalArgumentException(
                    "ID inválido"
            );
        }
    }
}