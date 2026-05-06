package servlet;

import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.*;
import service.SaldoService;
import util.JsonUtil;

import java.io.IOException;
import java.util.Map;

@WebServlet("/api/saldo/*")
public class SaldoServlet extends HttpServlet {

    private final SaldoService service = new SaldoService();

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        String path = req.getPathInfo();
        String rol = (String) req.getAttribute("rol");
        int uid = (int) req.getAttribute("usuarioId");
        try {
            switch (path == null ? "/" : path) {
                case "/" ->
                    JsonUtil.enviarJson(resp, 200, Map.of("saldo", service.consultarSaldo(uid)));
                case "/plataforma" -> {
                    if (!"ADMIN".equals(rol)) {
                        JsonUtil.enviarError(resp, 403, "Solo admin");
                        return;
                    }
                    JsonUtil.enviarJson(resp, 200, service.saldoPlataforma());
                }
                case "/comision" -> {
                    if (!"ADMIN".equals(rol)) {
                        JsonUtil.enviarError(resp, 403, "Solo admin");
                        return;
                    }
                    JsonUtil.enviarJson(resp, 200, service.infoComision());
                }
                default ->
                    JsonUtil.enviarError(resp, 404, "Ruta no encontrada");
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
            var body = JsonUtil.leerJson(req, Map.class);
            JsonUtil.enviarJson(resp, 201, service.recargar(uid, body.get("monto")));
        } catch (IllegalArgumentException e) {
            JsonUtil.enviarError(resp, 400, e.getMessage());
        } catch (Exception e) {
            JsonUtil.enviarError(resp, 500, "Error: " + e.getMessage());
        }
    }

    @Override
    protected void doPut(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        if (!"/comision".equals(req.getPathInfo())) {
            JsonUtil.enviarError(resp, 404, "Ruta no encontrada");
            return;
        }
        if (!"ADMIN".equals(req.getAttribute("rol"))) {
            JsonUtil.enviarError(resp, 403, "Solo admin");
            return;
        }
        int uid = (int) req.getAttribute("usuarioId");
        try {
            var body = JsonUtil.leerJson(req, Map.class);
            service.cambiarComision(body.get("porcentaje"), uid);
            JsonUtil.enviarJson(resp, 200, Map.of("mensaje", "Porcentaje de comisión actualizado a " + body.get("porcentaje") + "%"));
        } catch (IllegalArgumentException e) {
            JsonUtil.enviarError(resp, 400, e.getMessage());
        } catch (Exception e) {
            JsonUtil.enviarError(resp, 500, "Error: " + e.getMessage());
        }
    }
}
