package servlet;

import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.*;
import modelo.Categoria;
import service.CategoriaService;
import util.JsonUtil;

import java.io.IOException;
import java.util.Map;

@WebServlet("/api/categorias/*")
public class CategoriaServlet extends HttpServlet {

    private final CategoriaService service = new CategoriaService();

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        String path = req.getPathInfo();
        String rol = (String) req.getAttribute("rol");
        try {
            if (path == null || path.equals("/")) {
                JsonUtil.enviarJson(resp, 200, service.listar(!"ADMIN".equals(rol)));
            } else {
                int id = Integer.parseInt(path.substring(1));
                JsonUtil.enviarJson(resp, 200, service.buscarPorId(id));
            }
        } catch (IllegalArgumentException e) {
            JsonUtil.enviarError(resp, 404, e.getMessage());
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
            Categoria c = JsonUtil.leerJson(req, Categoria.class);
            int id = service.crear(c);
            JsonUtil.enviarJson(resp, 201, Map.of("id", id, "mensaje", "Categoría creada"));
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
                Categoria c = JsonUtil.leerJson(req, Categoria.class);
                c.setId(id);
                service.actualizar(c);
                JsonUtil.enviarJson(resp, 200, Map.of("mensaje", "Categoría actualizada"));
            }
        } catch (IllegalArgumentException e) {
            JsonUtil.enviarError(resp, 400, e.getMessage());
        } catch (Exception e) {
            JsonUtil.enviarError(resp, 500, "Error: " + e.getMessage());
        }
    }
}


