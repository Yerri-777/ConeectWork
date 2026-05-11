package servlet;

import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.*;
import service.EntregaService;
import util.JsonUtil;

import java.io.IOException;
import java.util.Map;

@WebServlet("/api/entregas/*")
public class EntregaServlet extends HttpServlet {

    private final EntregaService service = new EntregaService();


    private String obtenerRol(HttpServletRequest req) {

        Object rolObj = req.getAttribute("rol");

        if (rolObj == null) {
            return "";
        }

        return rolObj.toString().trim().toUpperCase();
    }

    private Integer obtenerUsuarioId(HttpServletRequest req) {

        Object uidObj = req.getAttribute("usuarioId");

        if (uidObj == null) {
            return null;
        }

        if (uidObj instanceof Integer) {
            return (Integer) uidObj;
        }

        try {
            return Integer.parseInt(uidObj.toString());
        } catch (Exception e) {
            return null;
        }
    }

    private boolean validarSesion(HttpServletRequest req, HttpServletResponse resp) throws IOException {

        Integer uid = obtenerUsuarioId(req);

        if (uid == null || uid <= 0) {

            JsonUtil.enviarError(resp, 401,
                    "Sesión inválida o expirada");

            return false;
        }

        return true;
    }

    // =========================================================
    // POST
    // =========================================================

    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp) throws IOException {

        if (!validarSesion(req, resp)) {
            return;
        }

        String path = req.getPathInfo();

        String rol = obtenerRol(req);

        Integer uid = obtenerUsuarioId(req);

        try {

            // =====================================================
            // CALIFICAR ENTREGA
            // =====================================================

            if (path != null && path.matches("/\\d+/calificar")) {

                if (!"CLIENTE".equals(rol)) {

                    JsonUtil.enviarError(resp, 403,
                            "Solo CLIENTE puede calificar");

                    return;
                }

                int contratoId = Integer.parseInt(
                        path.substring(1).split("/")[0]
                );

                @SuppressWarnings("unchecked")
                Map<String, Object> body =
                        (Map<String, Object>) JsonUtil.leerJson(req, Map.class);

                service.calificar(contratoId, uid, body);

                JsonUtil.enviarJson(resp, 201, Map.of(
                        "success", true,
                        "mensaje", "Calificación registrada correctamente"
                ));

                return;
            }

            // =====================================================
            // SUBIR ENTREGA
            // =====================================================

            if (!"FREELANCER".equals(rol)) {

                JsonUtil.enviarError(resp, 403,
                        "Solo FREELANCER puede subir entregas");

                return;
            }

            @SuppressWarnings("unchecked")
            Map<String, Object> body =
                    (Map<String, Object>) JsonUtil.leerJson(req, Map.class);

            int id = service.subir(uid, body);

            JsonUtil.enviarJson(resp, 201, Map.of(
                    "success", true,
                    "id", id,
                    "mensaje", "Entrega subida correctamente"
            ));

        } catch (NumberFormatException e) {

            JsonUtil.enviarError(resp, 400,
                    "ID inválido");

        } catch (IllegalArgumentException e) {

            JsonUtil.enviarError(resp, 400,
                    e.getMessage());

        } catch (IllegalStateException e) {

            JsonUtil.enviarError(resp, 409,
                    e.getMessage());

        } catch (SecurityException e) {

            JsonUtil.enviarError(resp, 403,
                    e.getMessage());

        } catch (Exception e) {

            e.printStackTrace();

            JsonUtil.enviarError(resp, 500,
                    "Error interno: " + e.getMessage());
        }
    }

    // =========================================================
    // PUT
    // =========================================================

    @Override
    protected void doPut(HttpServletRequest req, HttpServletResponse resp) throws IOException {

        if (!validarSesion(req, resp)) {
            return;
        }

        String path = req.getPathInfo();

        String rol = obtenerRol(req);

        Integer uid = obtenerUsuarioId(req);

        if (path == null || path.equals("/")) {

            JsonUtil.enviarError(resp, 400,
                    "Ruta inválida");

            return;
        }

        try {

            String[] partes = path.substring(1).split("/");

            int id = Integer.parseInt(partes[0]);

            String accion = partes.length > 1
                    ? partes[1].toLowerCase()
                    : "";

            switch (accion) {

                // =================================================
                // APROBAR ENTREGA
                // =================================================

                case "aprobar":

                    if (!"CLIENTE".equals(rol)) {

                        JsonUtil.enviarError(resp, 403,
                                "Solo CLIENTE puede aprobar");

                        return;
                    }

                    int contratoId = service.aprobar(id, uid);

                    JsonUtil.enviarJson(resp, 200, Map.of(
                            "success", true,
                            "mensaje", "Entrega aprobada correctamente",
                            "contratoId", contratoId
                    ));

                    break;

                // =================================================
                // RECHAZAR ENTREGA
                // =================================================

                case "rechazar":

                    if (!"CLIENTE".equals(rol)) {

                        JsonUtil.enviarError(resp, 403,
                                "Solo CLIENTE puede rechazar");

                        return;
                    }

                    @SuppressWarnings("unchecked")
                    Map<String, Object> body =
                            (Map<String, Object>) JsonUtil.leerJson(req, Map.class);

                    String motivo = (String) body.get("motivo");

                    service.rechazar(id, uid, motivo);

                    JsonUtil.enviarJson(resp, 200, Map.of(
                            "success", true,
                            "mensaje", "Entrega rechazada"
                    ));

                    break;

                default:

                    JsonUtil.enviarError(resp, 400,
                            "Acción inválida");
            }

        } catch (NumberFormatException e) {

            JsonUtil.enviarError(resp, 400,
                    "ID inválido");

        } catch (IllegalArgumentException e) {

            JsonUtil.enviarError(resp, 400,
                    e.getMessage());

        } catch (IllegalStateException e) {

            JsonUtil.enviarError(resp, 400,
                    e.getMessage());

        } catch (SecurityException e) {

            JsonUtil.enviarError(resp, 403,
                    e.getMessage());

        } catch (Exception e) {

            e.printStackTrace();

            JsonUtil.enviarError(resp, 500,
                    "Error interno: " + e.getMessage());
        }
    }
}