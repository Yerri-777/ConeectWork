package servlet;

import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.*;
import service.PropuestaService;
import util.JsonUtil;

import java.io.IOException;
import java.util.Map;

@WebServlet("/api/propuestas/*")
public class PropuestaServlet extends HttpServlet {

    private final PropuestaService service = new PropuestaService();

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        String path = req.getPathInfo();
        String rol = (String) req.getAttribute("rol");
        int uid = (int) req.getAttribute("usuarioId");
        try {
            if ("/mias".equals(path)) {
                if (!"FREELANCER".equals(rol)) {
                    JsonUtil.enviarError(resp, 403, "Solo freelancers");
                    return;
                }
                JsonUtil.enviarJson(resp, 200, service.listarMias(uid));
            } else {
                String param = req.getParameter("proyectoId");
                if (param == null) {
                    JsonUtil.enviarError(resp, 400, "proyectoId requerido");
                    return;
                }
                if ("ADMIN".equals(rol)) {
                    JsonUtil.enviarJson(resp, 200, new dao.PropuestaDAO().listarPorProyecto(Integer.parseInt(param)));
                } else {
                    if (!"CLIENTE".equals(rol)) {
                        JsonUtil.enviarError(resp, 403, "Solo clientes");
                        return;
                    }
                    JsonUtil.enviarJson(resp, 200, service.listarPorProyecto(Integer.parseInt(param), uid));
                }
            }
        } catch (SecurityException e) {
            JsonUtil.enviarError(resp, 403, e.getMessage());
        } catch (IllegalArgumentException e) {
            JsonUtil.enviarError(resp, 400, e.getMessage());
        } catch (Exception e) {
            JsonUtil.enviarError(resp, 500, "Error: " + e.getMessage());
        }
    }

    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        if (!"FREELANCER".equals(req.getAttribute("rol"))) {
            JsonUtil.enviarError(resp, 403, "Solo freelancers");
            return;
        }
        int uid = (int) req.getAttribute("usuarioId");
        try {
            @SuppressWarnings("unchecked")
            var body = (Map<String, Object>) JsonUtil.leerJson(req, Map.class);
            int id = service.enviar(uid, body);
            JsonUtil.enviarJson(resp, 201, Map.of("id", id, "mensaje", "Propuesta enviada correctamente"));
        } catch (IllegalArgumentException e) {
            JsonUtil.enviarError(resp, 400, e.getMessage());
        } catch (IllegalStateException e) {
            int code = e.getMessage().contains("habilidad") ? 400 : 409;
            JsonUtil.enviarError(resp, code, e.getMessage());
        } catch (Exception e) {
            if (e.getMessage() != null && e.getMessage().contains("Duplicate")) {
                JsonUtil.enviarError(resp, 409, "Ya enviaste una propuesta a este proyecto");
            } else {
                JsonUtil.enviarError(resp, 500, "Error: " + e.getMessage());
            }
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
                case "retirar" -> {
                    if (!"FREELANCER".equals(rol)) {
                        JsonUtil.enviarError(resp, 403, "Solo freelancers");
                        return;
                    }
                    service.retirar(id, uid);
                    JsonUtil.enviarJson(resp, 200, Map.of("mensaje", "Propuesta retirada"));
                }
                case "aceptar" -> {
                    if (!"CLIENTE".equals(rol)) {
                        JsonUtil.enviarError(resp, 403, "Solo clientes");
                        return;
                    }
                    JsonUtil.enviarJson(resp, 201, service.aceptar(id, uid));
                }
                case "rechazar" -> {
                    if (!"CLIENTE".equals(rol)) {
                        JsonUtil.enviarError(resp, 403, "Solo clientes");
                        return;
                    }
                    service.rechazar(id, uid);
                    JsonUtil.enviarJson(resp, 200, Map.of("mensaje", "Propuesta rechazada"));
                }
                default ->
                    JsonUtil.enviarError(resp, 400, "Acción no válida");
            }
        } catch (IllegalArgumentException e) {
            JsonUtil.enviarError(resp, 400, e.getMessage());
        } catch (IllegalStateException e) {
            int code = e.getMessage().contains("SALDO") ? 400 : 400;
            String msg = e.getMessage().equals("SALDO_INSUFICIENTE") ? "Saldo insuficiente para aceptar esta propuesta" : e.getMessage();
            JsonUtil.enviarError(resp, code, msg);
        } catch (SecurityException e) {
            JsonUtil.enviarError(resp, 403, e.getMessage());
        } catch (Exception e) {
            JsonUtil.enviarError(resp, 500, "Error: " + e.getMessage());
        }
    }
}
