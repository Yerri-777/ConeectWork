package servlet;

import dao.SolicitudDAO;

import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import modelo.SolicitudCategoria;
import modelo.SolicitudHabilidad;

import util.JsonUtil;

import java.io.IOException;
import java.util.Map;

@WebServlet("/api/solicitudes/*")
public class SolicitudServlet extends HttpServlet {

    private final SolicitudDAO dao = new SolicitudDAO();

    // =========================================================
    // HELPERS
    // =========================================================

    private String obtenerRol(HttpServletRequest req) {

        try {

            Object rolObj = req.getAttribute("rol");

            if (rolObj == null) {
                return "";
            }

            return rolObj.toString().trim().toUpperCase();

        } catch (Exception e) {

            System.err.println("[SolicitudServlet] Error obteniendo rol: " + e.getMessage());

            return "";
        }
    }

    private Integer obtenerUsuarioId(HttpServletRequest req) {

        try {

            Object uidObj = req.getAttribute("usuarioId");

            if (uidObj == null) {
                return null;
            }

            if (uidObj instanceof Integer) {
                return (Integer) uidObj;
            }

            return Integer.parseInt(uidObj.toString());

        } catch (Exception e) {

            System.err.println("[SolicitudServlet] Error obteniendo usuarioId: " + e.getMessage());

            return null;
        }
    }

    private boolean esAdmin(HttpServletRequest req) {
        return "ADMIN".equalsIgnoreCase(obtenerRol(req));
    }

    private boolean esFreelancer(HttpServletRequest req) {
        return "FREELANCER".equalsIgnoreCase(obtenerRol(req));
    }

    private boolean esCliente(HttpServletRequest req) {
        return "CLIENTE".equalsIgnoreCase(obtenerRol(req));
    }

    // =========================================================
    // GET
    // =========================================================

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws IOException {

        String path = req.getPathInfo();

        String estado = req.getParameter("estado");

        try {

            if (path == null) {

                JsonUtil.enviarError(resp, 404, "Ruta inválida");

                return;
            }

            // =================================================
            // SOLICITUDES HABILIDADES
            // =================================================

            if (path.startsWith("/habilidades")) {

                JsonUtil.enviarJson(
                        resp,
                        200,
                        dao.listarSolicitudesHabilidad(estado)
                );

                return;
            }

            // =================================================
            // SOLICITUDES CATEGORIAS
            // =================================================

            if (path.startsWith("/categorias")) {

                JsonUtil.enviarJson(
                        resp,
                        200,
                        dao.listarSolicitudesCategoria(estado)
                );

                return;
            }

            JsonUtil.enviarError(resp, 404, "Ruta no encontrada");

        } catch (Exception e) {

            e.printStackTrace();

            JsonUtil.enviarError(
                    resp,
                    500,
                    "Error al obtener solicitudes"
            );
        }
    }

    // =========================================================
    // POST
    // =========================================================

    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp) throws IOException {

        String path = req.getPathInfo();

        Integer uid = obtenerUsuarioId(req);

        if (uid == null) {

            JsonUtil.enviarError(
                    resp,
                    401,
                    "Usuario no autenticado"
            );

            return;
        }

        try {

            @SuppressWarnings("unchecked")
            Map<String, Object> body =
                    (Map<String, Object>) JsonUtil.leerJson(req, Map.class);

            // =================================================
            // SOLICITAR HABILIDAD
            // =================================================

            if (path.startsWith("/habilidades")) {

                if (!esFreelancer(req)) {

                    JsonUtil.enviarError(
                            resp,
                            403,
                            "Solo freelancers"
                    );

                    return;
                }

                if (body.get("nombre") == null) {

                    JsonUtil.enviarError(
                            resp,
                            400,
                            "Nombre requerido"
                    );

                    return;
                }

                SolicitudHabilidad solicitud = new SolicitudHabilidad();

                solicitud.setFreelancerId(uid);
                solicitud.setNombre((String) body.get("nombre"));
                solicitud.setDescripcion((String) body.get("descripcion"));

                int id = dao.crearSolicitudHabilidad(solicitud);

                JsonUtil.enviarJson(
                        resp,
                        201,
                        Map.of(
                                "id", id,
                                "mensaje", "Solicitud enviada correctamente"
                        )
                );

                return;
            }

            // =================================================
            // SOLICITAR CATEGORIA
            // =================================================

            if (path.startsWith("/categorias")) {

                if (!esCliente(req)) {

                    JsonUtil.enviarError(
                            resp,
                            403,
                            "Solo clientes"
                    );

                    return;
                }

                if (body.get("nombre") == null) {

                    JsonUtil.enviarError(
                            resp,
                            400,
                            "Nombre requerido"
                    );

                    return;
                }

                SolicitudCategoria solicitud = new SolicitudCategoria();

                solicitud.setClienteId(uid);
                solicitud.setNombre((String) body.get("nombre"));
                solicitud.setDescripcion((String) body.get("descripcion"));

                int id = dao.crearSolicitudCategoria(solicitud);

                JsonUtil.enviarJson(
                        resp,
                        201,
                        Map.of(
                                "id", id,
                                "mensaje", "Solicitud enviada correctamente"
                        )
                );

                return;
            }

            JsonUtil.enviarError(resp, 404, "Ruta inválida");

        } catch (Exception e) {

            e.printStackTrace();

            JsonUtil.enviarError(
                    resp,
                    500,
                    "Error al crear solicitud"
            );
        }
    }

    // =========================================================
    // PUT
    // =========================================================

    @Override
    protected void doPut(HttpServletRequest req, HttpServletResponse resp) throws IOException {

        if (!esAdmin(req)) {

            JsonUtil.enviarError(
                    resp,
                    403,
                    "Solo administradores"
            );

            return;
        }

        String path = req.getPathInfo();

        Integer uid = obtenerUsuarioId(req);

        if (uid == null) {

            JsonUtil.enviarError(
                    resp,
                    401,
                    "Usuario no autenticado"
            );

            return;
        }

        try {

            String[] partes = path.substring(1).split("/");

            String tipo = partes[0];

            int solicitudId = Integer.parseInt(partes[1]);

            String accion = partes[2];

            if (!"aceptar".equalsIgnoreCase(accion)
                    && !"rechazar".equalsIgnoreCase(accion)) {

                JsonUtil.enviarError(
                        resp,
                        400,
                        "Acción inválida"
                );

                return;
            }

            String nuevoEstado =
                    "aceptar".equalsIgnoreCase(accion)
                            ? "ACEPTADA"
                            : "RECHAZADA";

            boolean resultado;

            // =================================================
            // HABILIDADES
            // =================================================

            if ("habilidades".equalsIgnoreCase(tipo)) {

                resultado = dao.resolverSolicitudHabilidad(
                        solicitudId,
                        nuevoEstado,
                        uid
                );
            }

            // =================================================
            // CATEGORIAS
            // =================================================

            else if ("categorias".equalsIgnoreCase(tipo)) {

                resultado = dao.resolverSolicitudCategoria(
                        solicitudId,
                        nuevoEstado,
                        uid
                );
            }

            else {

                JsonUtil.enviarError(
                        resp,
                        404,
                        "Tipo inválido"
                );

                return;
            }

            if (!resultado) {

                JsonUtil.enviarError(
                        resp,
                        400,
                        "Solicitud no encontrada o ya procesada"
                );

                return;
            }

            JsonUtil.enviarJson(
                    resp,
                    200,
                    Map.of(
                            "mensaje",
                            "Solicitud " + nuevoEstado.toLowerCase()
                    )
            );

        } catch (NumberFormatException e) {

            JsonUtil.enviarError(
                    resp,
                    400,
                    "ID inválido"
            );

        } catch (Exception e) {

            e.printStackTrace();

            JsonUtil.enviarError(
                    resp,
                    500,
                    "Error al procesar solicitud"
            );
        }
    }
}