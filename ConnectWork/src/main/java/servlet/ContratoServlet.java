package servlet;

import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import service.ContratoService;

import util.JsonUtil;

import java.io.IOException;
import java.util.Map;

@WebServlet("/api/contratos/*")
public class ContratoServlet extends BaseServlet {

    private final ContratoService service =
            new ContratoService();

    // =====================================================
    // GET
    // =====================================================

    @Override
    protected void doGet(
            HttpServletRequest req,
            HttpServletResponse resp
    ) throws IOException {

        try {

            // =============================================
            // VALIDAR SESION
            // =============================================

            if (!requerirAutenticacion(req, resp)) {
                return;
            }

            String path =
                    obtenerPath(req);

            String rol =
                    obtenerRol(req);

            Integer uid =
                    obtenerUsuarioId(req);

            System.out.println(
                    "[ContratoServlet.GET] "
                            + rol
                            + " -> "
                            + path
            );

            // =============================================
            // LISTAR
            // =============================================

            if (path.equals("/")) {

                switch (rol) {

                    case "ADMIN" ->

                            JsonUtil.enviarJson(
                                    resp,
                                    200,
                                    service.listarTodos()
                            );

                    case "CLIENTE" ->

                            JsonUtil.enviarJson(
                                    resp,
                                    200,
                                    service.listarTodosCliente(uid)
                            );

                    case "FREELANCER" ->

                            JsonUtil.enviarJson(
                                    resp,
                                    200,
                                    service.listarActivosFreelancer(uid)
                            );

                    default ->

                            JsonUtil.enviarError(
                                    resp,
                                    403,
                                    "Rol no autorizado"
                            );
                }

                return;
            }

            // =============================================
            // DETALLE
            // =============================================

            String[] partes =
                    path.substring(1).split("/");

            int contratoId =
                    Integer.parseInt(partes[0]);

            JsonUtil.enviarJson(
                    resp,
                    200,
                    service.detalle(
                            contratoId,
                            uid,
                            rol
                    )
            );

        } catch (NumberFormatException e) {

            JsonUtil.enviarError(
                    resp,
                    400,
                    "ID inválido"
            );

        } catch (SecurityException e) {

            JsonUtil.enviarError(
                    resp,
                    403,
                    e.getMessage()
            );

        } catch (IllegalArgumentException e) {

            JsonUtil.enviarError(
                    resp,
                    404,
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

            JsonUtil.enviarJson(
                    resp,
                    200,
                    Map.of(
                            "success", true,
                            "mensaje",
                            "Endpoint POST contratos listo"
                    )
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

            String rol =
                    obtenerRol(req);

            Integer uid =
                    obtenerUsuarioId(req);

            String path =
                    obtenerPath(req);

            if (path.equals("/")) {

                JsonUtil.enviarError(
                        resp,
                        400,
                        "Ruta inválida"
                );

                return;
            }

            String[] partes =
                    path.substring(1).split("/");

            int contratoId =
                    Integer.parseInt(partes[0]);

            // =============================================
            // CANCELAR
            // =============================================

            if (partes.length > 1
                    && "cancelar".equalsIgnoreCase(
                    partes[1]
            )) {

                if (!"CLIENTE".equals(rol)) {

                    JsonUtil.enviarError(
                            resp,
                            403,
                            "Solo CLIENTE puede cancelar contratos"
                    );

                    return;
                }

                @SuppressWarnings("unchecked")
                Map<String, Object> body =
                        (Map<String, Object>)
                                JsonUtil.leerJson(
                                        req,
                                        Map.class
                                );

                if (body == null) {

                    JsonUtil.enviarError(
                            resp,
                            400,
                            "Body inválido"
                    );

                    return;
                }

                String motivo =
                        body.get("motivo") != null
                                ? body.get("motivo").toString()
                                : "";

                service.cancelar(
                        contratoId,
                        uid,
                        motivo
                );

                JsonUtil.enviarJson(
                        resp,
                        200,
                        Map.of(
                                "success", true,
                                "mensaje",
                                "Contrato cancelado correctamente"
                        )
                );

                return;
            }

            JsonUtil.enviarError(
                    resp,
                    400,
                    "Acción inválida"
            );

        } catch (NumberFormatException e) {

            JsonUtil.enviarError(
                    resp,
                    400,
                    "ID inválido"
            );

        } catch (SecurityException e) {

            JsonUtil.enviarError(
                    resp,
                    403,
                    e.getMessage()
            );

        } catch (IllegalArgumentException e) {

            JsonUtil.enviarError(
                    resp,
                    400,
                    e.getMessage()
            );

        } catch (IllegalStateException e) {

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