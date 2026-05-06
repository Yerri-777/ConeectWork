package servlet;

import dao.SolicitudDAO;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.*;
import modelo.SolicitudCategoria;
import modelo.SolicitudHabilidad;
import util.JsonUtil;

import java.io.IOException;
import java.util.Map;

/**
 * HABILIDADES (freelancer → admin):
 * POST /api/solicitudes/habilidades           → crear solicitud (FREELANCER)
 * GET  /api/solicitudes/habilidades?estado=   → listar (ADMIN/FREELANCER)
 * PUT  /api/solicitudes/habilidades/{id}/aceptar|rechazar → resolver (ADMIN)
 *
 * CATEGORÍAS (cliente → admin):
 * POST /api/solicitudes/categorias            → crear solicitud (CLIENTE)
 * GET  /api/solicitudes/categorias?estado=    → listar (ADMIN/CLIENTE)
 * PUT  /api/solicitudes/categorias/{id}/aceptar|rechazar → resolver (ADMIN)
 */
@WebServlet("/api/solicitudes/*")
public class SolicitudServlet extends HttpServlet {

    private final SolicitudDAO dao = new SolicitudDAO();

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        String path   = req.getPathInfo();
        String rol    = (String) req.getAttribute("rol");
        String estado = req.getParameter("estado");
        try {
            if (path.startsWith("/habilidades")) {
                // Admin ve todas, freelancer solo las suyas (filtrado por estado)
                JsonUtil.enviarJson(resp, 200, dao.listarSolicitudesHabilidad(estado));
            } else if (path.startsWith("/categorias")) {
                JsonUtil.enviarJson(resp, 200, dao.listarSolicitudesCategoria(estado));
            } else {
                JsonUtil.enviarError(resp, 404, "Ruta no encontrada");
            }
        } catch (Exception e) { JsonUtil.enviarError(resp, 500, "Error: " + e.getMessage()); }
    }

    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        String path = req.getPathInfo();
        String rol  = (String) req.getAttribute("rol");
        int uid     = (int) req.getAttribute("usuarioId");
        try {
            if (path.startsWith("/habilidades")) {
                if (!"FREELANCER".equals(rol)) { JsonUtil.enviarError(resp, 403, "Solo freelancers"); return; }
                Map<?, ?> body = JsonUtil.leerJson(req, Map.class);
                if (body.get("nombre") == null) { JsonUtil.enviarError(resp, 400, "nombre requerido"); return; }
                SolicitudHabilidad s = new SolicitudHabilidad();
                s.setFreelancerId(uid);
                s.setNombre((String) body.get("nombre"));
                s.setDescripcion((String) body.get("descripcion"));
                int id = dao.crearSolicitudHabilidad(s);
                JsonUtil.enviarJson(resp, 201, Map.of("id", id, "mensaje", "Solicitud enviada al administrador"));

            } else if (path.startsWith("/categorias")) {
                if (!"CLIENTE".equals(rol)) { JsonUtil.enviarError(resp, 403, "Solo clientes"); return; }
                Map<?, ?> body = JsonUtil.leerJson(req, Map.class);
                if (body.get("nombre") == null) { JsonUtil.enviarError(resp, 400, "nombre requerido"); return; }
                SolicitudCategoria s = new SolicitudCategoria();
                s.setClienteId(uid);
                s.setNombre((String) body.get("nombre"));
                s.setDescripcion((String) body.get("descripcion"));
                int id = dao.crearSolicitudCategoria(s);
                JsonUtil.enviarJson(resp, 201, Map.of("id", id, "mensaje", "Solicitud enviada al administrador"));
            } else {
                JsonUtil.enviarError(resp, 404, "Ruta no encontrada");
            }
        } catch (Exception e) { JsonUtil.enviarError(resp, 500, "Error: " + e.getMessage()); }
    }

    @Override
    protected void doPut(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        if (!"ADMIN".equals(req.getAttribute("rol"))) { JsonUtil.enviarError(resp, 403, "Solo admin"); return; }
        String path = req.getPathInfo();
        int uid     = (int) req.getAttribute("usuarioId");
        try {
            // /habilidades/{id}/aceptar  o  /categorias/{id}/rechazar
            String[] partes = path.substring(1).split("/");
            String tipo     = partes[0];
            int id          = Integer.parseInt(partes[1]);
            String accion   = partes[2];

            if (!"aceptar".equals(accion) && !"rechazar".equals(accion)) {
                JsonUtil.enviarError(resp, 400, "Acción no válida"); return;
            }
            String nuevoEstado = "aceptar".equals(accion) ? "ACEPTADA" : "RECHAZADA";
            boolean ok;

            if ("habilidades".equals(tipo)) {
                ok = dao.resolverSolicitudHabilidad(id, nuevoEstado, uid);
            } else if ("categorias".equals(tipo)) {
                ok = dao.resolverSolicitudCategoria(id, nuevoEstado, uid);
            } else {
                JsonUtil.enviarError(resp, 404, "Tipo no válido"); return;
            }
            if (!ok) JsonUtil.enviarError(resp, 400, "Solicitud no encontrada o ya procesada");
            else      JsonUtil.enviarJson(resp, 200, Map.of("mensaje", "Solicitud " + nuevoEstado.toLowerCase()));
        } catch (Exception e) { JsonUtil.enviarError(resp, 500, "Error: " + e.getMessage()); }
    }
}