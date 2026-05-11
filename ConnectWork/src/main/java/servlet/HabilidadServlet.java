package servlet;

import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import modelo.Habilidad;

import service.HabilidadService;

import util.JsonUtil;

import java.io.IOException;
import java.util.Map;

@WebServlet("/api/habilidades/*")
public class HabilidadServlet extends BaseServlet {

    private final HabilidadService service =
            new HabilidadService();

    // =====================================================
    // GET
    // =====================================================

    @Override
    protected void doGet(
            HttpServletRequest req,
            HttpServletResponse resp
    ) throws IOException {

        if (!requerirAutenticacion(req, resp)) {
            return;
        }

        try {

            String path = obtenerPath(req);

            // =================================================
            // LISTAR
            // =================================================

            if (path.equals("/")) {

                String categoriaStr =
                        req.getParameter("categoriaId");

                Integer categoriaId = null;

                if (categoriaStr != null &&
                        !categoriaStr.isBlank()) {

                    categoriaId =
                            Integer.parseInt(categoriaStr);
                }

                boolean soloActivas =
                        !esAdmin(req);

                JsonUtil.enviarJson(
                        resp,
                        200,
                        service.listar(
                                categoriaId,
                                soloActivas
                        )
                );

                return;
            }

            // =================================================
            // DETALLE
            // =================================================

            Integer id =
                    obtenerIdDesdePath(req);

            if (id == null) {

                responderBadRequest(
                        resp,
                        "ID inválido"
                );

                return;
            }

            JsonUtil.enviarJson(
                    resp,
                    200,
                    service.buscarPorId(id)
            );

        } catch (IllegalArgumentException e) {

            responderBadRequest(
                    resp,
                    e.getMessage()
            );

        } catch (Exception e) {

            responderErrorInterno(resp, e);
        }
    }

    // =====================================================
    // POST
    // =====================================================

    @Override
    protected void doPost(
            HttpServletRequest req,
            HttpServletResponse resp
    ) throws IOException {

        if (!requerirAutenticacion(req, resp)) {
            return;
        }

        if (!requerirAdmin(req, resp)) {
            return;
        }

        try {

            Habilidad habilidad =
                    JsonUtil.leerJson(
                            req,
                            Habilidad.class
                    );

            int id =
                    service.crear(habilidad);

            JsonUtil.enviarJson(
                    resp,
                    201,
                    Map.of(
                            "success", true,
                            "id", id,
                            "mensaje",
                            "Habilidad creada correctamente"
                    )
            );

        } catch (IllegalArgumentException e) {

            responderBadRequest(
                    resp,
                    e.getMessage()
            );

        } catch (Exception e) {

            responderErrorInterno(resp, e);
        }
    }

    // =====================================================
    // PUT
    // =====================================================

    @Override
    protected void doPut(
            HttpServletRequest req,
            HttpServletResponse resp
    ) throws IOException {

        if (!requerirAutenticacion(req, resp)) {
            return;
        }

        if (!requerirAdmin(req, resp)) {
            return;
        }

        try {

            String path = obtenerPath(req);

            if (path.equals("/")) {

                responderBadRequest(
                        resp,
                        "ID requerido"
                );

                return;
            }

            String[] partes =
                    path.substring(1).split("/");

            int id =
                    Integer.parseInt(partes[0]);

            // =============================================
            // ACTIVAR / DESACTIVAR
            // =============================================

            if (partes.length > 1) {

                String accion = partes[1];

                if (!accion.equalsIgnoreCase("activar") &&
                        !accion.equalsIgnoreCase("desactivar")) {

                    responderBadRequest(
                            resp,
                            "Acción inválida"
                    );

                    return;
                }

                boolean activo =
                        accion.equalsIgnoreCase("activar");

                service.cambiarEstado(
                        id,
                        activo
                );

                JsonUtil.enviarJson(
                        resp,
                        200,
                        Map.of(
                                "success", true,
                                "mensaje",
                                "Estado actualizado"
                        )
                );

                return;
            }

            // =============================================
            // UPDATE NORMAL
            // =============================================

            Habilidad habilidad =
                    JsonUtil.leerJson(
                            req,
                            Habilidad.class
                    );

            habilidad.setId(id);

            service.actualizar(habilidad);

            JsonUtil.enviarJson(
                    resp,
                    200,
                    Map.of(
                            "success", true,
                            "mensaje",
                            "Habilidad actualizada"
                    )
            );

        } catch (IllegalArgumentException e) {

            responderBadRequest(
                    resp,
                    e.getMessage()
            );

        } catch (Exception e) {

            responderErrorInterno(resp, e);
        }
    }

    // =====================================================
    // DELETE
    // =====================================================

    @Override
    protected void doDelete(
            HttpServletRequest req,
            HttpServletResponse resp
    ) throws IOException {

        if (!requerirAutenticacion(req, resp)) {
            return;
        }

        if (!requerirAdmin(req, resp)) {
            return;
        }

        try {

            Integer id =
                    obtenerIdDesdePath(req);

            if (id == null) {

                responderBadRequest(
                        resp,
                        "ID inválido"
                );

                return;
            }

            service.eliminar(id);

            JsonUtil.enviarJson(
                    resp,
                    200,
                    Map.of(
                            "success", true,
                            "mensaje",
                            "Habilidad eliminada"
                    )
            );

        } catch (IllegalArgumentException e) {

            responderBadRequest(
                    resp,
                    e.getMessage()
            );

        } catch (Exception e) {

            responderErrorInterno(resp, e);
        }
    }
}