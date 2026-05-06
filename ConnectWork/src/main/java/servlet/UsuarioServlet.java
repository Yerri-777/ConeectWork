package servlet;

import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.*;
import service.UsuarioService;
import util.JsonUtil;

import java.io.IOException;
import java.util.Map;

@WebServlet("/api/usuarios/*")
public class UsuarioServlet extends HttpServlet {

    private final UsuarioService service = new UsuarioService();

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        if (!"ADMIN".equals(req.getAttribute("rol"))) { JsonUtil.enviarError(resp, 403, "Acceso denegado"); return; }
        String path = req.getPathInfo();
        try {
            if (path == null || path.equals("/")) {
                String rol = req.getParameter("rol");
                if (rol == null) { JsonUtil.enviarError(resp, 400, "Parámetro rol requerido"); return; }
                JsonUtil.enviarJson(resp, 200, service.listarPorRol(rol));
            } else {
                int id = Integer.parseInt(path.substring(1).split("/")[0]);
                var u = service.buscarPorId(id);
                if (u == null) JsonUtil.enviarError(resp, 404, "Usuario no encontrado");
                else           JsonUtil.enviarJson(resp, 200, u);
            }
        } catch (IllegalArgumentException e) { JsonUtil.enviarError(resp, 400, e.getMessage());
        } catch (Exception e)                { JsonUtil.enviarError(resp, 500, "Error: " + e.getMessage()); }
    }

    @Override
    protected void doPut(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        if (!"ADMIN".equals(req.getAttribute("rol"))) { JsonUtil.enviarError(resp, 403, "Acceso denegado"); return; }
        String path = req.getPathInfo();
        try {
            String[] p = path.substring(1).split("/");
            int id = Integer.parseInt(p[0]);
            String accion = p.length > 1 ? p[1] : "";
            switch (accion) {
                case "activar"    -> { service.activar(id);    JsonUtil.enviarJson(resp, 200, Map.of("mensaje", "Cuenta activada")); }
                case "desactivar" -> { service.desactivar(id); JsonUtil.enviarJson(resp, 200, Map.of("mensaje", "Cuenta desactivada")); }
                default           -> JsonUtil.enviarError(resp, 400, "Acción no válida");
            }
        } catch (IllegalArgumentException e) { JsonUtil.enviarError(resp, 404, e.getMessage());
        } catch (Exception e)                { JsonUtil.enviarError(resp, 500, "Error: " + e.getMessage()); }
    }

    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        if (!"ADMIN".equals(req.getAttribute("rol"))) { JsonUtil.enviarError(resp, 403, "Acceso denegado"); return; }
        try {
            @SuppressWarnings("unchecked")
            var body = (java.util.Map<String, Object>) JsonUtil.leerJson(req, Map.class);
            int id = service.crearAdmin(body);
            JsonUtil.enviarJson(resp, 201, Map.of("id", id, "mensaje", "Administrador creado"));
        } catch (IllegalArgumentException e) { JsonUtil.enviarError(resp, 400, e.getMessage());
        } catch (IllegalStateException e)    {
            JsonUtil.enviarError(resp, 409, e.getMessage().contains("USERNAME") ? "Username ya en uso" : "Correo ya registrado");
        } catch (Exception e)                { JsonUtil.enviarError(resp, 500, "Error: " + e.getMessage()); }
    }
}