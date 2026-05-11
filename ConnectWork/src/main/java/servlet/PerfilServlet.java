package servlet;

import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import service.PerfilService;
import util.JsonUtil;

import java.io.IOException;
import java.util.Map;

@WebServlet("/api/perfil/*")
public class PerfilServlet extends HttpServlet {

    private final PerfilService service = new PerfilService();

    // =========================
    // HELPERS
    // =========================

    private Integer obtenerUsuarioId(HttpServletRequest req) {
        try {
            Object uidObj = req.getAttribute("usuarioId");

            if (uidObj == null) {
                System.err.println("[PerfilServlet] usuarioId es NULL");
                return null;
            }

            if (uidObj instanceof Integer) {
                return (Integer) uidObj;
            }

            return Integer.parseInt(uidObj.toString());

        } catch (Exception e) {
            System.err.println("[PerfilServlet] Error obteniendo usuarioId: " + e.getMessage());
            return null;
        }
    }

    private String obtenerRol(HttpServletRequest req) {
        try {
            Object rolObj = req.getAttribute("rol");

            if (rolObj == null) {
                System.err.println("[PerfilServlet] rol es NULL");
                return "";
            }

            return rolObj.toString().trim().toUpperCase();

        } catch (Exception e) {
            System.err.println("[PerfilServlet] Error obteniendo rol: " + e.getMessage());
            return "";
        }
    }

    // =========================
    // GET PERFIL
    // =========================

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws IOException {

        Integer uid = obtenerUsuarioId(req);
        String rol = obtenerRol(req);

        if (uid == null) {
            JsonUtil.enviarError(resp, 401, "Usuario no autenticado");
            return;
        }

        try {

            JsonUtil.enviarJson(resp, 200, service.obtenerPerfil(uid, rol));

        } catch (IllegalArgumentException e) {

            JsonUtil.enviarError(resp, 404, e.getMessage());

        } catch (Exception e) {

            e.printStackTrace();
            JsonUtil.enviarError(resp, 500, "Error obteniendo perfil: " + e.getMessage());
        }
    }

    // =========================
    // POST
    // =========================

    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        guardar(req, resp);
    }

    // =========================
    // PUT
    // =========================

    @Override
    protected void doPut(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        guardar(req, resp);
    }

    // =========================
    // GUARDAR PERFIL
    // =========================

    private void guardar(HttpServletRequest req, HttpServletResponse resp) throws IOException {

        String path = req.getPathInfo();

        Integer uid = obtenerUsuarioId(req);
        String rol = obtenerRol(req);

        if (uid == null) {
            JsonUtil.enviarError(resp, 401, "Usuario no autenticado");
            return;
        }

        try {

            @SuppressWarnings("unchecked")
            Map<String, Object> body = (Map<String, Object>) JsonUtil.leerJson(req, Map.class);

            if (body == null) {
                JsonUtil.enviarError(resp, 400, "Body inválido");
                return;
            }

            // =========================
            // CLIENTE
            // =========================

            if ("/cliente".equals(path)) {

                if (!"CLIENTE".equalsIgnoreCase(rol)) {
                    JsonUtil.enviarError(resp, 403, "Solo clientes pueden actualizar este perfil");
                    return;
                }

                service.guardarPerfilCliente(uid, body);

                JsonUtil.enviarJson(resp, 200,
                        Map.of("mensaje", "Perfil cliente actualizado correctamente"));

                return;
            }

            // =========================
            // FREELANCER
            // =========================

            if ("/freelancer".equals(path)) {

                if (!"FREELANCER".equalsIgnoreCase(rol)) {
                    JsonUtil.enviarError(resp, 403, "Solo freelancers pueden actualizar este perfil");
                    return;
                }

                service.guardarPerfilFreelancer(uid, body);

                JsonUtil.enviarJson(resp, 200,
                        Map.of("mensaje", "Perfil freelancer actualizado correctamente"));

                return;
            }

            JsonUtil.enviarError(resp, 404, "Ruta no encontrada");

        } catch (IllegalArgumentException e) {

            JsonUtil.enviarError(resp, 400, e.getMessage());

        } catch (Exception e) {

            e.printStackTrace();
            JsonUtil.enviarError(resp, 500, "Error guardando perfil: " + e.getMessage());
        }
    }
}