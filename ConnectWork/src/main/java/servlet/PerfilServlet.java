package servlet;

import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.*;
import service.PerfilService;
import util.JsonUtil;

import java.io.IOException;
import java.util.Map;

@WebServlet("/api/perfil/*")
public class PerfilServlet extends HttpServlet {

    private final PerfilService service = new PerfilService();

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        int uid = (int) req.getAttribute("usuarioId");
        String rol = (String) req.getAttribute("rol");
        try {
            JsonUtil.enviarJson(resp, 200, service.obtenerPerfil(uid, rol));
        } catch (IllegalArgumentException e) { JsonUtil.enviarError(resp, 404, e.getMessage());
        } catch (Exception e)                { JsonUtil.enviarError(resp, 500, "Error: " + e.getMessage()); }
    }

    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        guardar(req, resp);
    }

    @Override
    protected void doPut(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        guardar(req, resp);
    }

    private void guardar(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        String path = req.getPathInfo();
        int uid     = (int) req.getAttribute("usuarioId");
        String rol  = (String) req.getAttribute("rol");
        try {
            @SuppressWarnings("unchecked")
            var body = (Map<String, Object>) JsonUtil.leerJson(req, Map.class);
            if ("/cliente".equals(path)) {
                if (!"CLIENTE".equals(rol)) { JsonUtil.enviarError(resp, 403, "No es cliente"); return; }
                service.guardarPerfilCliente(uid, body);
                JsonUtil.enviarJson(resp, 200, Map.of("mensaje", "Perfil de cliente guardado correctamente"));
            } else if ("/freelancer".equals(path)) {
                if (!"FREELANCER".equals(rol)) { JsonUtil.enviarError(resp, 403, "No es freelancer"); return; }
                service.guardarPerfilFreelancer(uid, body);
                JsonUtil.enviarJson(resp, 200, Map.of("mensaje", "Perfil de freelancer guardado correctamente"));
            } else {
                JsonUtil.enviarError(resp, 404, "Ruta no encontrada");
            }
        } catch (IllegalArgumentException e) { JsonUtil.enviarError(resp, 400, e.getMessage());
        } catch (Exception e)                { JsonUtil.enviarError(resp, 500, "Error: " + e.getMessage()); }
    }
}