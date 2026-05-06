package servlet;

import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.*;
import service.ProyectoService;
import util.JsonUtil;

import java.io.IOException;
import java.math.BigDecimal;
import java.util.Map;

@WebServlet("/api/proyectos/*")
public class ProyectoServlet extends HttpServlet {

    private final ProyectoService service = new ProyectoService();

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        String path = req.getPathInfo();
        String rol = (String) req.getAttribute("rol");
        int uid = (int) req.getAttribute("usuarioId");
        try {
            if (path == null || path.equals("/")) {
                if ("CLIENTE".equals(rol)) {
                    JsonUtil.enviarJson(resp, 200, service.listarDeCliente(uid));
                } else {
                    BigDecimal min = req.getParameter("presMin") != null ? new BigDecimal(req.getParameter("presMin")) : null;
                    BigDecimal max = req.getParameter("presMax") != null ? new BigDecimal(req.getParameter("presMax")) : null;
                    Integer catId = req.getParameter("categoriaId") != null ? Integer.parseInt(req.getParameter("categoriaId")) : null;
                    Integer habId = req.getParameter("habilidadId") != null ? Integer.parseInt(req.getParameter("habilidadId")) : null;
                    JsonUtil.enviarJson(resp, 200, service.listarAbiertos(catId, habId, min, max));
                }
            } else {
                int id = Integer.parseInt(path.substring(1).split("/")[0]);
                JsonUtil.enviarJson(resp, 200, service.buscarConHabilidades(id));
            }
        } catch (IllegalArgumentException e) {
            JsonUtil.enviarError(resp, 404, e.getMessage());
        } catch (Exception e) {
            JsonUtil.enviarError(resp, 500, "Error: " + e.getMessage());
        }
    }

    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        if (!"CLIENTE".equals(req.getAttribute("rol"))) {
            JsonUtil.enviarError(resp, 403, "Solo clientes");
            return;
        }
        int uid = (int) req.getAttribute("usuarioId");
        try {
            @SuppressWarnings("unchecked")
            var body = (Map<String, Object>) JsonUtil.leerJson(req, Map.class);
            int id = service.publicar(uid, body);
            JsonUtil.enviarJson(resp, 201, Map.of("id", id, "mensaje", "Proyecto publicado correctamente"));
        } catch (IllegalArgumentException e) {
            JsonUtil.enviarError(resp, 400, e.getMessage());
        } catch (Exception e) {
            JsonUtil.enviarError(resp, 500, "Error: " + e.getMessage());
        }
    }

    @Override
    protected void doPut(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        if (!"CLIENTE".equals(req.getAttribute("rol"))) {
            JsonUtil.enviarError(resp, 403, "Solo clientes");
            return;
        }
        String path = req.getPathInfo();
        int uid = (int) req.getAttribute("usuarioId");
        try {
            String[] p = path.substring(1).split("/");
            int id = Integer.parseInt(p[0]);
            if (p.length > 1 && "cancelar".equals(p[1])) {
                service.cancelar(id, uid);
                JsonUtil.enviarJson(resp, 200, Map.of("mensaje", "Proyecto cancelado"));
            } else {
                @SuppressWarnings("unchecked")
                var body = (Map<String, Object>) JsonUtil.leerJson(req, Map.class);
                service.editar(id, uid, body);
                JsonUtil.enviarJson(resp, 200, Map.of("mensaje", "Proyecto actualizado"));
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
