package servlet;

import dao.PropuestaDAO;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import service.PropuestaService;
import util.JsonUtil;

import java.io.IOException;
import java.util.Map;

@WebServlet("/api/propuestas/*")
public class PropuestaServlet extends HttpServlet {

    private final PropuestaService service = new PropuestaService();

    // ====================================
    // HELPERS
    // ====================================

    private Integer obtenerUsuarioId(HttpServletRequest req) {

        try {

            Object uidObj = req.getAttribute("usuarioId");

            if (uidObj == null) {
                System.err.println("[PropuestaServlet] usuarioId NULL");
                return null;
            }

            if (uidObj instanceof Integer) {
                return (Integer) uidObj;
            }

            return Integer.parseInt(uidObj.toString());

        } catch (Exception e) {

            System.err.println("[PropuestaServlet] Error usuarioId: " + e.getMessage());
            return null;
        }
    }

    private String obtenerRol(HttpServletRequest req) {

        try {

            Object rolObj = req.getAttribute("rol");

            if (rolObj == null) {
                System.err.println("[PropuestaServlet] rol NULL");
                return "";
            }

            return rolObj.toString().trim().toUpperCase();

        } catch (Exception e) {

            System.err.println("[PropuestaServlet] Error rol: " + e.getMessage());
            return "";
        }
    }

    // ====================================
    // GET
    // ====================================

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws IOException {

        String path = req.getPathInfo();

        Integer uid = obtenerUsuarioId(req);
        String rol = obtenerRol(req);

        if (uid == null) {
            JsonUtil.enviarError(resp, 401, "Usuario no autenticado");
            return;
        }

        try {

            // ====================================
            // PROPUESTAS DEL FREELANCER
            // ====================================

            if ("/mias".equals(path)) {

                if (!"FREELANCER".equalsIgnoreCase(rol)) {
                    JsonUtil.enviarError(resp, 403,
                            "Solo freelancers pueden listar sus propuestas");
                    return;
                }

                JsonUtil.enviarJson(resp, 200, service.listarMias(uid));
                return;
            }

            // ====================================
            // PROPUESTAS POR PROYECTO
            // ====================================

            String proyectoIdStr = req.getParameter("proyectoId");

            if (proyectoIdStr == null || proyectoIdStr.isBlank()) {
                JsonUtil.enviarError(resp, 400,
                        "Parámetro proyectoId requerido");
                return;
            }

            int proyectoId = Integer.parseInt(proyectoIdStr);

            // ADMIN
            if ("ADMIN".equalsIgnoreCase(rol)) {

                JsonUtil.enviarJson(resp, 200,
                        new PropuestaDAO().listarPorProyecto(proyectoId));

                return;
            }

            // CLIENTE
            if ("CLIENTE".equalsIgnoreCase(rol)) {

                JsonUtil.enviarJson(resp, 200,
                        service.listarPorProyecto(proyectoId, uid));

                return;
            }

            JsonUtil.enviarError(resp, 403,
                    "No autorizado para ver propuestas");

        } catch (NumberFormatException e) {

            JsonUtil.enviarError(resp, 400,
                    "ID de proyecto inválido");

        } catch (SecurityException e) {

            JsonUtil.enviarError(resp, 403, e.getMessage());

        } catch (IllegalArgumentException e) {

            JsonUtil.enviarError(resp, 400, e.getMessage());

        } catch (Exception e) {

            e.printStackTrace();
            JsonUtil.enviarError(resp, 500,
                    "Error cargando propuestas: " + e.getMessage());
        }
    }

    // ====================================
    // POST
    // ====================================

    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp) throws IOException {

        String rol = obtenerRol(req);
        Integer uid = obtenerUsuarioId(req);

        if (uid == null) {
            JsonUtil.enviarError(resp, 401, "Usuario no autenticado");
            return;
        }

        if (!"FREELANCER".equalsIgnoreCase(rol)) {
            JsonUtil.enviarError(resp, 403,
                    "Solo freelancers pueden enviar propuestas");
            return;
        }

        try {

            @SuppressWarnings("unchecked")
            Map<String, Object> body =
                    (Map<String, Object>) JsonUtil.leerJson(req, Map.class);

            int id = service.enviar(uid, body);

            JsonUtil.enviarJson(resp, 201,
                    Map.of(
                            "id", id,
                            "mensaje", "Propuesta enviada correctamente"
                    ));

        } catch (IllegalArgumentException e) {

            JsonUtil.enviarError(resp, 400, e.getMessage());

        } catch (IllegalStateException e) {

            JsonUtil.enviarError(resp, 409, e.getMessage());

        } catch (Exception e) {

            e.printStackTrace();

            if (e.getMessage() != null &&
                    e.getMessage().contains("Duplicate")) {

                JsonUtil.enviarError(resp, 409,
                        "Ya enviaste una propuesta a este proyecto");

            } else {

                JsonUtil.enviarError(resp, 500,
                        "Error enviando propuesta: " + e.getMessage());
            }
        }
    }

    // ====================================
    // PUT
    // ====================================

    @Override
    protected void doPut(HttpServletRequest req, HttpServletResponse resp) throws IOException {

        String path = req.getPathInfo();

        Integer uid = obtenerUsuarioId(req);
        String rol = obtenerRol(req);

        if (uid == null) {
            JsonUtil.enviarError(resp, 401, "Usuario no autenticado");
            return;
        }

        if (path == null || path.equals("/")) {
            JsonUtil.enviarError(resp, 400, "Ruta inválida");
            return;
        }

        try {

            String[] p = path.substring(1).split("/");

            int id = Integer.parseInt(p[0]);

            String accion = p.length > 1
                    ? p[1].toLowerCase()
                    : "";

            switch (accion) {

                // ====================================
                // RETIRAR
                // ====================================

                case "retirar" -> {

                    if (!"FREELANCER".equalsIgnoreCase(rol)) {
                        JsonUtil.enviarError(resp, 403,
                                "Solo freelancers pueden retirar propuestas");
                        return;
                    }

                    service.retirar(id, uid);

                    JsonUtil.enviarJson(resp, 200,
                            Map.of("mensaje",
                                    "Propuesta retirada correctamente"));
                }

                // ====================================
                // ACEPTAR
                // ====================================

                case "aceptar" -> {

                    if (!"CLIENTE".equalsIgnoreCase(rol)) {
                        JsonUtil.enviarError(resp, 403,
                                "Solo clientes pueden aceptar propuestas");
                        return;
                    }

                    JsonUtil.enviarJson(resp, 201,
                            service.aceptar(id, uid));
                }

                // ====================================
                // RECHAZAR
                // ====================================

                case "rechazar" -> {

                    if (!"CLIENTE".equalsIgnoreCase(rol)) {
                        JsonUtil.enviarError(resp, 403,
                                "Solo clientes pueden rechazar propuestas");
                        return;
                    }

                    service.rechazar(id, uid);

                    JsonUtil.enviarJson(resp, 200,
                            Map.of("mensaje",
                                    "Propuesta rechazada correctamente"));
                }

                default ->
                        JsonUtil.enviarError(resp, 400,
                                "Acción inválida");
            }

        } catch (NumberFormatException e) {

            JsonUtil.enviarError(resp, 400, "ID inválido");

        } catch (IllegalArgumentException e) {

            JsonUtil.enviarError(resp, 400, e.getMessage());

        } catch (IllegalStateException e) {

            String mensaje = e.getMessage();

            if ("SALDO_INSUFICIENTE".equalsIgnoreCase(mensaje)) {

                JsonUtil.enviarError(resp, 400,
                        "Saldo insuficiente para aceptar esta propuesta");

            } else {

                JsonUtil.enviarError(resp, 400, mensaje);
            }

        } catch (SecurityException e) {

            JsonUtil.enviarError(resp, 403, e.getMessage());

        } catch (Exception e) {

            e.printStackTrace();

            JsonUtil.enviarError(resp, 500,
                    "Error actualizando propuesta: " + e.getMessage());
        }
    }
}