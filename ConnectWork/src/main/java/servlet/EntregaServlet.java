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

    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        String path = req.getPathInfo();
        String rol = (String) req.getAttribute("rol");
        int uid = (int) req.getAttribute("usuarioId");
        try {
            if (path != null && path.matches("/\\d+/calificar")) {
                if (!"CLIENTE".equals(rol)) {
                    JsonUtil.enviarError(resp, 403, "Solo clientes");
                    return;
                }
                int contratoId = Integer.parseInt(path.substring(1).split("/")[0]);
                @SuppressWarnings("unchecked")
                var body = (Map<String, Object>) JsonUtil.leerJson(req, Map.class);
                service.calificar(contratoId, uid, body);
                JsonUtil.enviarJson(resp, 201, Map.of("mensaje", "Calificación registrada correctamente"));
            } else {
                if (!"FREELANCER".equals(rol)) {
                    JsonUtil.enviarError(resp, 403, "Solo freelancers");
                    return;
                }
                @SuppressWarnings("unchecked")
                var body = (Map<String, Object>) JsonUtil.leerJson(req, Map.class);
                int id = service.subir(uid, body);
                JsonUtil.enviarJson(resp, 201, Map.of("id", id, "mensaje", "Entrega subida. El cliente debe revisarla."));
            }
        } catch (IllegalArgumentException e) {
            JsonUtil.enviarError(resp, 400, e.getMessage());
        } catch (IllegalStateException e) {
            JsonUtil.enviarError(resp, 409, e.getMessage());
        } catch (SecurityException e) {
            JsonUtil.enviarError(resp, 403, e.getMessage());
        } catch (Exception e) {
            JsonUtil.enviarError(resp, 500, "Error: " + e.getMessage());
        }
    }

    @Override
    protected void doPut(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        String path = req.getPathInfo();
        String rol = (String) req.getAttribute("rol");
        int uid = (int) req.getAttribute("usuarioId");
        try {
            String[] p = path.substring(1).split("/");
            int id = Integer.parseInt(p[0]);
            String accion = p.length > 1 ? p[1] : "";
            switch (accion) {
                case "aprobar" -> {
                    if (!"CLIENTE".equals(rol)) {
                        JsonUtil.enviarError(resp, 403, "Solo clientes");
                        return;
                    }
                    int contratoId = service.aprobar(id, uid);
                    JsonUtil.enviarJson(resp, 200, Map.of(
                            "mensaje", "Entrega aprobada. Contrato completado. Puedes calificar al freelancer.",
                            "contratoId", contratoId
                    ));
                }
                case "rechazar" -> {
                    if (!"CLIENTE".equals(rol)) {
                        JsonUtil.enviarError(resp, 403, "Solo clientes");
                        return;
                    }
                    @SuppressWarnings("unchecked")
                    var body = (Map<String, Object>) JsonUtil.leerJson(req, Map.class);
                    service.rechazar(id, uid, (String) body.get("motivo"));
                    JsonUtil.enviarJson(resp, 200, Map.of("mensaje", "Entrega rechazada. El freelancer puede corregir y subir una nueva."));
                }
                default ->
                    JsonUtil.enviarError(resp, 400, "Acción no válida");
            }
        } catch (IllegalArgumentException e) {
            JsonUtil.enviarError(resp, 400, e.getMessage());
        } catch (IllegalStateException e) {
            JsonUtil.enviarError(resp, 400, e.getMessage());
        } catch (SecurityException e) {
            JsonUtil.enviarError(resp, 403, e.getMessage());
        } catch (Exception e) {
            JsonUtil.enviarError(resp, 500, "Error: " + e.getMessage());
        }
    }
}
