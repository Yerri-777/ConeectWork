package servlet;

import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import modelo.Categoria;

import service.CategoriaService;

import util.JsonUtil;

import java.io.IOException;
import java.util.Map;

@WebServlet("/api/categorias/*")
public class CategoriaServlet extends BaseServlet {

    private final CategoriaService service =
            new CategoriaService();

    // =====================================================
    // GET
    // =====================================================

    @Override
    protected void doGet(
            HttpServletRequest req,
            HttpServletResponse resp
    ) throws IOException {

        try {

            // Validar sesión
            if (!requerirAutenticacion(req, resp)) {
                return;
            }

            String path = obtenerPath(req);

            System.out.println(
                    "[CategoriaServlet.GET] Path: " + path
            );

            // =================================================
            // LISTAR
            // =================================================

            if (path.equals("/")) {

                boolean soloActivas =
                        !esAdmin(req);

                JsonUtil.enviarJson(
                        resp,
                        200,
                        service.listar(soloActivas)
                );

                return;
            }

            // =================================================
            // BUSCAR POR ID
            // =================================================

            String[] partes =
                    path.substring(1).split("/");

            int id =
                    Integer.parseInt(partes[0]);

            JsonUtil.enviarJson(
                    resp,
                    200,
                    service.buscarPorId(id)
            );

        } catch (NumberFormatException e) {

            JsonUtil.enviarError(
                    resp,
                    400,
                    "ID inválido"
            );

        } catch (IllegalArgumentException e) {

            JsonUtil.enviarError(
                    resp,
                    400,
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

        try {

            if (!requerirAutenticacion(req, resp)) {
                return;
            }

            if (!requerirAdmin(req, resp)) {
                return;
            }

            Categoria categoria =
                    JsonUtil.leerJson(
                            req,
                            Categoria.class
                    );

            int id =
                    service.crear(categoria);

            JsonUtil.enviarJson(
                    resp,
                    201,
                    Map.of(
                            "success", true,
                            "id", id,
                            "mensaje",
                            "Categoría creada correctamente"
                    )
            );

        } catch (IllegalArgumentException e) {

            JsonUtil.enviarError(
                    resp,
                    400,
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

        try {

            if (!requerirAutenticacion(req, resp)) {
                return;
            }

            if (!requerirAdmin(req, resp)) {
                return;
            }

            String path = obtenerPath(req);

            if (path.equals("/")) {

                JsonUtil.enviarError(
                        resp,
                        400,
                        "ID requerido"
                );

                return;
            }

            String[] partes =
                    path.substring(1).split("/");

            int id =
                    Integer.parseInt(partes[0]);

            // =================================================
            // ACTIVAR / DESACTIVAR
            // =================================================

            if (partes.length > 1) {

                String accion =
                        partes[1].trim()
                                .toLowerCase();

                if (!accion.equals("activar")
                        && !accion.equals("desactivar")) {

                    JsonUtil.enviarError(
                            resp,
                            400,
                            "Acción inválida"
                    );

                    return;
                }

                boolean activo =
                        accion.equals("activar");

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
                                "Estado actualizado correctamente"
                        )
                );

                return;
            }

            // =================================================
            // UPDATE NORMAL
            // =================================================

            Categoria categoria =
                    JsonUtil.leerJson(
                            req,
                            Categoria.class
                    );

            categoria.setId(id);

            service.actualizar(categoria);

            JsonUtil.enviarJson(
                    resp,
                    200,
                    Map.of(
                            "success", true,
                            "mensaje",
                            "Categoría actualizada correctamente"
                    )
            );

        } catch (NumberFormatException e) {

            JsonUtil.enviarError(
                    resp,
                    400,
                    "ID inválido"
            );

        } catch (IllegalArgumentException e) {

            JsonUtil.enviarError(
                    resp,
                    400,
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

        try {

            if (!requerirAutenticacion(req, resp)) {
                return;
            }

            if (!requerirAdmin(req, resp)) {
                return;
            }

            String path = obtenerPath(req);

            if (path.equals("/")) {

                JsonUtil.enviarError(
                        resp,
                        400,
                        "ID requerido"
                );

                return;
            }

            String[] partes =
                    path.substring(1).split("/");

            int id =
                    Integer.parseInt(partes[0]);

            service.eliminar(id);

            JsonUtil.enviarJson(
                    resp,
                    200,
                    Map.of(
                            "success", true,
                            "mensaje",
                            "Categoría eliminada correctamente"
                    )
            );

        } catch (NumberFormatException e) {

            JsonUtil.enviarError(
                    resp,
                    400,
                    "ID inválido"
            );

        } catch (IllegalArgumentException e) {

            JsonUtil.enviarError(
                    resp,
                    400,
                    e.getMessage()
            );

        } catch (Exception e) {

            responderErrorInterno(resp, e);
        }
    }
}