package servlet;

import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.*;
import modelo.Habilidad;
import service.HabilidadService;
import util.JsonUtil;

import java.io.IOException;
import java.util.Map;

@WebServlet("/api/habilidades/*")
public class HabilidadServlet extends HttpServlet {

    private final HabilidadService service = new HabilidadService();

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        String rol = (String) req.getAttribute("rol");
        String catStr = req.getParameter("categoriaId");
        try {
            Integer catId = catStr != null ? Integer.parseInt(catStr) : null;
            JsonUtil.enviarJson(resp, 200, service.listar(catId, !"ADMIN".equals(rol)));
        } catch (Exception e) {
            JsonUtil.enviarError(resp, 500, "Error: " + e.getMessage());
        }
    }

    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        if (!"ADMIN".equals(req.getAttribute("rol"))) {
            JsonUtil.enviarError(resp, 403, "Solo admin");
            return;
        }
        try {
            Habilidad h = JsonUtil.leerJson(req, Habilidad.class);
            int id = service.crear(h);
            JsonUtil.enviarJson(resp, 201, Map.of("id", id, "mensaje", "Habilidad creada"));
        } catch (IllegalArgumentException e) {
            JsonUtil.enviarError(resp, 400, e.getMessage());
        } catch (Exception e) {
            JsonUtil.enviarError(resp, 500, "Error: " + e.getMessage());
        }
    }

    @Override
    protected void doPut(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        if (!"ADMIN".equals(req.getAttribute("rol"))) {
            JsonUtil.enviarError(resp, 403, "Solo admin");
            return;
        }
        String path = req.getPathInfo();
        try {
            String[] p = path.substring(1).split("/");
            int id = Integer.parseInt(p[0]);
            if (p.length > 1) {
                service.cambiarEstado(id, "activar".equals(p[1]));
                JsonUtil.enviarJson(resp, 200, Map.of("mensaje", "Estado actualizado"));
            } else {
                Habilidad h = JsonUtil.leerJson(req, Habilidad.class);
                h.setId(id);
                service.actualizar(h);
                JsonUtil.enviarJson(resp, 200, Map.of("mensaje", "Habilidad actualizada"));
            }
        } catch (IllegalArgumentException e) {
            JsonUtil.enviarError(resp, 400, e.getMessage());
        } catch (Exception e) {
            JsonUtil.enviarError(resp, 500, "Error: " + e.getMessage());
        }
    }
}
