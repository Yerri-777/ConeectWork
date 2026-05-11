package servlet;

import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import modelo.Usuario;
import service.UsuarioService;
import util.JsonUtil;

import java.io.IOException;
import java.util.Map;

@WebServlet("/api/usuarios/*")
public class UsuarioServlet extends HttpServlet {

    private final UsuarioService service = new UsuarioService();

    // =========================================================
    // HELPERS
    // =========================================================

    private String obtenerRol(HttpServletRequest req) {
        Object rolObj = req.getAttribute("rol");

        if (rolObj == null) {
            return "";
        }

        return rolObj.toString().trim().toUpperCase();
    }

    private boolean esAdmin(HttpServletRequest req) {
        return "ADMIN".equals(obtenerRol(req));
    }

    private Integer obtenerId(HttpServletRequest req) {
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
            return null;
        }
    }

    private Integer obtenerIdDesdePath(HttpServletRequest req) {
        try {
            String path = req.getPathInfo();

            if (path == null || path.equals("/")) {
                return null;
            }

            return Integer.parseInt(path.substring(1).split("/")[0]);

        } catch (Exception e) {
            return null;
        }
    }

    // =========================================================
    // GET
    // =========================================================

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws IOException {

        String path = req.getPathInfo();
        String rolFiltro = req.getParameter("rol");

        try {

            // =========================
            // LISTAR USUARIOS
            // =========================
            if (path == null || path.equals("/")) {

                if (!esAdmin(req)) {
                    JsonUtil.enviarError(resp, 403, "Solo administradores pueden listar usuarios");
                    return;
                }

                if (rolFiltro != null && !rolFiltro.isBlank()) {
                    JsonUtil.enviarJson(resp, 200, service.listarPorRol(rolFiltro));
                } else {
                    JsonUtil.enviarJson(resp, 200, service.listar());
                }

                return;
            }

            // =========================
            // OBTENER POR ID
            // =========================
            Integer id = obtenerIdDesdePath(req);

            if (id == null) {
                JsonUtil.enviarError(resp, 400, "ID inválido");
                return;
            }

            JsonUtil.enviarJson(resp, 200, service.buscarPorId(id));

        } catch (IllegalArgumentException e) {

            JsonUtil.enviarError(resp, 404, e.getMessage());

        } catch (Exception e) {

            e.printStackTrace();

            JsonUtil.enviarError(
                    resp,
                    500,
                    "Error interno del servidor"
            );
        }
    }

    // =========================================================
    // POST
    // =========================================================

    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp) throws IOException {

        if (!esAdmin(req)) {
            JsonUtil.enviarError(resp, 403, "Solo administradores pueden crear usuarios");
            return;
        }

        try {

            Usuario usuario = JsonUtil.leerJson(req, Usuario.class);

            if (usuario == null) {
                JsonUtil.enviarError(resp, 400, "Datos inválidos");
                return;
            }

            int id = service.crear(usuario);

            JsonUtil.enviarJson(
                    resp,
                    201,
                    Map.of(
                            "id", id,
                            "mensaje", "Usuario creado correctamente"
                    )
            );

        } catch (IllegalArgumentException e) {

            JsonUtil.enviarError(resp, 400, e.getMessage());

        } catch (Exception e) {

            e.printStackTrace();

            JsonUtil.enviarError(
                    resp,
                    500,
                    "Error al crear usuario"
            );
        }
    }

    // =========================================================
    // PUT
    // =========================================================

    @Override
    protected void doPut(HttpServletRequest req, HttpServletResponse resp) throws IOException {

        if (!esAdmin(req)) {
            JsonUtil.enviarError(resp, 403, "Solo administradores pueden actualizar usuarios");
            return;
        }

        try {

            String path = req.getPathInfo();

            if (path == null || path.equals("/")) {
                JsonUtil.enviarError(resp, 400, "ID requerido");
                return;
            }

            String[] partes = path.substring(1).split("/");

            int id = Integer.parseInt(partes[0]);

            // =================================================
            // ACTIVAR / DESACTIVAR
            // =================================================
            if (partes.length > 1) {

                String accion = partes[1].toLowerCase();

                boolean activar = "activar".equals(accion);

                service.cambiarEstado(id, activar);

                JsonUtil.enviarJson(
                        resp,
                        200,
                        Map.of(
                                "mensaje",
                                activar
                                        ? "Usuario activado correctamente"
                                        : "Usuario desactivado correctamente"
                        )
                );

                return;
            }

            // =================================================
            // ACTUALIZAR
            // =================================================
            Usuario usuario = JsonUtil.leerJson(req, Usuario.class);

            if (usuario == null) {
                JsonUtil.enviarError(resp, 400, "Datos inválidos");
                return;
            }

            usuario.setId(id);

            service.actualizar(usuario);

            JsonUtil.enviarJson(
                    resp,
                    200,
                    Map.of(
                            "mensaje",
                            "Usuario actualizado correctamente"
                    )
            );

        } catch (NumberFormatException e) {

            JsonUtil.enviarError(resp, 400, "Formato de ID inválido");

        } catch (IllegalArgumentException e) {

            JsonUtil.enviarError(resp, 400, e.getMessage());

        } catch (Exception e) {

            e.printStackTrace();

            JsonUtil.enviarError(
                    resp,
                    500,
                    "Error al actualizar usuario"
            );
        }
    }

    // =========================================================
    // DELETE
    // =========================================================

    @Override
    protected void doDelete(HttpServletRequest req, HttpServletResponse resp) throws IOException {

        if (!esAdmin(req)) {
            JsonUtil.enviarError(resp, 403, "Solo administradores pueden eliminar usuarios");
            return;
        }

        try {

            Integer id = obtenerIdDesdePath(req);

            if (id == null) {
                JsonUtil.enviarError(resp, 400, "ID inválido");
                return;
            }

            service.eliminar(id);

            JsonUtil.enviarJson(
                    resp,
                    200,
                    Map.of(
                            "mensaje",
                            "Usuario eliminado correctamente"
                    )
            );

        } catch (IllegalArgumentException e) {

            JsonUtil.enviarError(resp, 400, e.getMessage());

        } catch (Exception e) {

            e.printStackTrace();

            JsonUtil.enviarError(
                    resp,
                    500,
                    "Error al eliminar usuario"
            );
        }
    }
}