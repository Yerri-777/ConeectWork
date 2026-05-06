package servlet;

import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.*;
import service.ContratoService;
import util.JsonUtil;

import java.io.IOException;
import java.util.Map;

@WebServlet("/api/contratos/*")
public class ContratoServlet extends HttpServlet {

    private final ContratoService service = new ContratoService();

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        String path = req.getPathInfo();
        String rol = (String) req.getAttribute("rol");
        int uid = (int) req.getAttribute("usuarioId");
        try {
            if (path == null || path.equals("/")) {
                if ("FREELANCER".equals(rol)) {
                    JsonUtil.enviarJson(resp, 200, service.listarActivosFreelancer(uid));
                } else if ("CLIENTE".equals(rol)) {
                    JsonUtil.enviarJson(resp, 200, service.listarTodosCliente(uid));
                } else {
                    JsonUtil.enviarError(resp, 403, "No autorizado");
                }
            } else {
                int id = Integer.parseInt(path.substring(1).split("/")[0]);
                JsonUtil.enviarJson(resp, 200, service.detalle(id, uid, rol));
            }
        } catch (SecurityException e) {
            JsonUtil.enviarError(resp, 403, e.getMessage());
        } catch (IllegalArgumentException e) {
            JsonUtil.enviarError(resp, 404, e.getMessage());
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
            if (p.length > 1 && "cancelar".equals(p[1])) {
                if (!"CLIENTE".equals(rol)) {
                    JsonUtil.enviarError(resp, 403, "Solo clientes");
                    return;
                }
                @SuppressWarnings("unchecked")
                var body = (Map<String, Object>) JsonUtil.leerJson(req, Map.class);
                service.cancelar(id, uid, (String) body.get("motivo"));
                JsonUtil.enviarJson(resp, 200, Map.of("mensaje", "Contrato cancelado. Saldo reembolsado al cliente."));
            } else {
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
