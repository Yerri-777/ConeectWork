package service;

import dao.HabilidadDAO;
import modelo.Habilidad;

import java.sql.SQLException;
import java.util.List;

public class HabilidadService {

    private final HabilidadDAO dao;

    public HabilidadService() {
        this.dao = new HabilidadDAO();
    }

    // =====================================================
    // CREAR
    // =====================================================

    public int crear(Habilidad h) throws SQLException {

        validarHabilidad(h);

        int id = dao.crear(h);

        System.out.println(
                "[HabilidadService.crear] ✓ ID: " + id
        );

        return id;
    }

    // =====================================================
    // ACTUALIZAR
    // =====================================================

    public void actualizar(Habilidad h) throws SQLException {

        if (h == null) {
            throw new IllegalArgumentException(
                    "Habilidad inválida"
            );
        }

        validarId(h.getId());

        validarHabilidad(h);

        Habilidad existente =
                dao.buscarPorId(h.getId());

        if (existente == null) {
            throw new IllegalArgumentException(
                    "Habilidad no encontrada"
            );
        }

        boolean ok = dao.actualizar(h);

        if (!ok) {
            throw new IllegalStateException(
                    "No se pudo actualizar la habilidad"
            );
        }

        System.out.println(
                "[HabilidadService.actualizar] ✓ ID: "
                        + h.getId()
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

        Habilidad h = dao.buscarPorId(id);

        if (h == null) {
            throw new IllegalArgumentException(
                    "Habilidad no encontrada"
            );
        }

        boolean ok =
                dao.cambiarEstado(id, activo);

        if (!ok) {
            throw new IllegalStateException(
                    "No se pudo cambiar estado"
            );
        }

        System.out.println(
                "[HabilidadService.cambiarEstado] ✓ ID: "
                        + id
                        + " activo="
                        + activo
        );
    }

    // =====================================================
    // ELIMINAR
    // =====================================================

    public void eliminar(int id)
            throws SQLException {

        validarId(id);

        Habilidad h = dao.buscarPorId(id);

        if (h == null) {
            throw new IllegalArgumentException(
                    "Habilidad no encontrada"
            );
        }

        dao.cambiarEstado(id, false);

        System.out.println(
                "[HabilidadService.eliminar] ✓ ID: "
                        + id
        );
    }

    // =====================================================
    // BUSCAR POR ID
    // =====================================================

    public Habilidad buscarPorId(int id)
            throws SQLException {

        validarId(id);

        Habilidad h = dao.buscarPorId(id);

        if (h == null) {
            throw new IllegalArgumentException(
                    "Habilidad no encontrada"
            );
        }

        return h;
    }

    // =====================================================
    // LISTAR
    // =====================================================

    public List<Habilidad> listar(
            Integer categoriaId,
            boolean soloActivas
    ) throws SQLException {

        return dao.listar(
                categoriaId,
                soloActivas
        );
    }

    // =====================================================
    // FREELANCER
    // =====================================================

    public List<Habilidad> listarPorFreelancer(
            int usuarioId
    ) throws SQLException {

        validarId(usuarioId);

        return dao.listarPorFreelancer(usuarioId);
    }

    // =====================================================
    // PROYECTO
    // =====================================================

    public List<Habilidad> listarPorProyecto(
            int proyectoId
    ) throws SQLException {

        validarId(proyectoId);

        return dao.listarPorProyecto(proyectoId);
    }

    // =====================================================
    // VALIDACIONES
    // =====================================================

    private void validarHabilidad(Habilidad h) {

        if (h == null) {
            throw new IllegalArgumentException(
                    "Datos inválidos"
            );
        }

        validarNombre(h.getNombre());

        if (h.getCategoriaId() <= 0) {
            throw new IllegalArgumentException(
                    "Categoría requerida"
            );
        }
    }

    private void validarNombre(String nombre) {

        if (nombre == null ||
                nombre.isBlank()) {

            throw new IllegalArgumentException(
                    "Nombre requerido"
            );
        }

        nombre = nombre.trim();

        if (nombre.length() < 2) {
            throw new IllegalArgumentException(
                    "Nombre demasiado corto"
            );
        }

        if (nombre.length() > 100) {
            throw new IllegalArgumentException(
                    "Nombre demasiado largo"
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