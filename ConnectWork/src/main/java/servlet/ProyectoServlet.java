package servlet;

import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import service.ProyectoService;
import util.JsonUtil;

import java.io.IOException;
import java.math.BigDecimal;
import java.util.Map;

@WebServlet("/api/proyectos/*")
public class ProyectoServlet extends HttpServlet {

    private final ProyectoService service = new ProyectoService();

    // =========================================================
    // HELPERS
    // =========================================================

    private String obtenerRol(HttpServletRequest req) {

        try {

            Object rolObj = req.getAttribute("rol");

            if (rolObj == null) {
                System.out.println("[ProyectoServlet] Rol NULL");
                return "";
            }

            String rol = rolObj.toString().trim().toUpperCase();

            System.out.println("[ProyectoServlet] Rol detectado: " + rol);

            return rol;

        } catch (Exception e) {

            System.err.println("[ProyectoServlet] Error obteniendo rol: " + e.getMessage());

            return "";
        }
    }

    private Integer obtenerUsuarioId(HttpServletRequest req) {

        try {

            Object uidObj = req.getAttribute("usuarioId");

            if (uidObj == null) {
                return null;
            }

            if (uidObj instanceof Integer) {
                return (Integer) uidObj;
            }

            return Integer.parseInt(uidObj.toString());

        } catch (Exception e) {

            System.err.println("[ProyectoServlet] Error obteniendo usuarioId: " + e.getMessage());

            return null;
        }
    }

    private boolean esCliente(HttpServletRequest req) {
        return "CLIENTE".equalsIgnoreCase(obtenerRol(req));
    }

    // =========================================================
    // GET
    // =========================================================

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws IOException {

        String path = req.getPathInfo();

        String rol = obtenerRol(req);

        Integer uid = obtenerUsuarioId(req);

        try {

            // =================================================
            // LISTAR PROYECTOS
            // =================================================

            if (path == null || path.equals("/")) {

                // CLIENTE → SUS PROYECTOS

                if ("CLIENTE".equals(rol)) {

                    if (uid == null) {

                        JsonUtil.enviarError(resp, 401, "Usuario no autenticado");

                        return;
                    }

                    System.out.println("[ProyectoServlet.doGet] Listando proyectos del cliente ID=" + uid);

                    JsonUtil.enviarJson(
                            resp,
                            200,
                            service.listarDeCliente(uid)
                    );

                    return;
                }

                // =================================================
                // LISTAR PROYECTOS ABIERTOS
                // =================================================

                BigDecimal min = req.getParameter("presMin") != null
                        ? new BigDecimal(req.getParameter("presMin"))
                        : null;

                BigDecimal max = req.getParameter("presMax") != null
                        ? new BigDecimal(req.getParameter("presMax"))
                        : null;

                Integer categoriaId = req.getParameter("categoriaId") != null
                        ? Integer.parseInt(req.getParameter("categoriaId"))
                        : null;

                Integer habilidadId = req.getParameter("habilidadId") != null
                        ? Integer.parseInt(req.getParameter("habilidadId"))
                        : null;

                System.out.println("[ProyectoServlet.doGet] Listando proyectos abiertos");

                JsonUtil.enviarJson(
                        resp,
                        200,
                        service.listarAbiertos(
                                categoriaId,
                                habilidadId,
                                min,
                                max
                        )
                );

                return;
            }

            // =================================================
            // BUSCAR PROYECTO POR ID
            // =================================================

            int proyectoId = Integer.parseInt(
                    path.substring(1).split("/")[0]
            );

            System.out.println("[ProyectoServlet.doGet] Buscando proyecto ID=" + proyectoId);

            JsonUtil.enviarJson(
                    resp,
                    200,
                    service.buscarConHabilidades(proyectoId)
            );

        } catch (NumberFormatException e) {

            JsonUtil.enviarError(resp, 400, "Parámetros inválidos");

        } catch (IllegalArgumentException e) {

            JsonUtil.enviarError(resp, 404, e.getMessage());

        } catch (Exception e) {

            e.printStackTrace();

            JsonUtil.enviarError(
                    resp,
                    500,
                    "Error interno del servidor"
            );
        }
    }

    // =========================================================
    // POST
    // =========================================================

    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp) throws IOException {

        if (!esCliente(req)) {

            JsonUtil.enviarError(
                    resp,
                    403,
                    "Solo clientes pueden publicar proyectos"
            );

            return;
        }

        Integer uid = obtenerUsuarioId(req);

        if (uid == null) {

            JsonUtil.enviarError(
                    resp,
                    401,
                    "Usuario no autenticado"
            );

            return;
        }

        try {

            @SuppressWarnings("unchecked")
            Map<String, Object> body =
                    (Map<String, Object>) JsonUtil.leerJson(req, Map.class);

            int proyectoId = service.publicar(uid, body);

            System.out.println("[ProyectoServlet.doPost] Proyecto creado ID=" + proyectoId);

            JsonUtil.enviarJson(
                    resp,
                    201,
                    Map.of(
                            "id", proyectoId,
                            "mensaje", "Proyecto publicado correctamente"
                    )
            );

        } catch (IllegalArgumentException e) {

            JsonUtil.enviarError(resp, 400, e.getMessage());

        } catch (Exception e) {

            e.printStackTrace();

            JsonUtil.enviarError(
                    resp,
                    500,
                    "Error interno del servidor"
            );
        }
    }

    // =========================================================
    // PUT
    // =========================================================

    @Override
    protected void doPut(HttpServletRequest req, HttpServletResponse resp) throws IOException {

        if (!esCliente(req)) {

            JsonUtil.enviarError(
                    resp,
                    403,
                    "Solo clientes pueden modificar proyectos"
            );

            return;
        }

        Integer uid = obtenerUsuarioId(req);

        if (uid == null) {

            JsonUtil.enviarError(
                    resp,
                    401,
                    "Usuario no autenticado"
            );

            return;
        }

        String path = req.getPathInfo();

        try {

            if (path == null || path.equals("/")) {

                JsonUtil.enviarError(
                        resp,
                        400,
                        "Ruta inválida"
                );

                return;
            }

            String[] partes = path.substring(1).split("/");

            int proyectoId = Integer.parseInt(partes[0]);

            // =================================================
            // CANCELAR
            // =================================================

            if (partes.length > 1 && "cancelar".equalsIgnoreCase(partes[1])) {

                service.cancelar(proyectoId, uid);

                System.out.println("[ProyectoServlet.doPut] Proyecto cancelado ID=" + proyectoId);

                JsonUtil.enviarJson(
                        resp,
                        200,
                        Map.of(
                                "mensaje",
                                "Proyecto cancelado correctamente"
                        )
                );

                return;
            }

            // =================================================
            // EDITAR
            // =================================================

            @SuppressWarnings("unchecked")
            Map<String, Object> body =
                    (Map<String, Object>) JsonUtil.leerJson(req, Map.class);

            service.editar(proyectoId, uid, body);

            System.out.println("[ProyectoServlet.doPut] Proyecto actualizado ID=" + proyectoId);

            JsonUtil.enviarJson(
                    resp,
                    200,
                    Map.of(
                            "mensaje",
                            "Proyecto actualizado correctamente"
                    )
            );

        } catch (NumberFormatException e) {

            JsonUtil.enviarError(resp, 400, "ID inválido");

        } catch (IllegalArgumentException e) {

            JsonUtil.enviarError(resp, 400, e.getMessage());

        } catch (IllegalStateException e) {

            JsonUtil.enviarError(resp, 409, e.getMessage());

        } catch (SecurityException e) {

            JsonUtil.enviarError(resp, 403, e.getMessage());

        } catch (Exception e) {

            e.printStackTrace();

            JsonUtil.enviarError(
                    resp,
                    500,
                    "Error interno del servidor"
            );
        }
    }
}