package servlet;

import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import service.ReporteService;
import service.SaldoService;

import util.JsonUtil;

import java.io.IOException;

@WebServlet("/api/reportes/*")
public class ReporteServlet extends HttpServlet {

    private final ReporteService reporteService = new ReporteService();
    private final SaldoService saldoService = new SaldoService();

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

            System.err.println("[ReporteServlet] Error obteniendo rol: " + e.getMessage());

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

            System.err.println("[ReporteServlet] Error obteniendo usuarioId: " + e.getMessage());

            return null;
        }
    }

    // =========================================================
    // GET
    // =========================================================

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws IOException {

        String path = req.getPathInfo();

        String rol = obtenerRol(req);

        Integer uid = obtenerUsuarioId(req);

        String desde = req.getParameter("desde");
        String hasta = req.getParameter("hasta");

        try {

            if (path == null || path.equals("/")) {

                JsonUtil.enviarError(resp, 404, "Ruta de reporte no especificada");

                return;
            }

            // =================================================
            // ADMIN
            // =================================================

            if (path.startsWith("/admin/")) {

                if (!"ADMIN".equals(rol)) {

                    JsonUtil.enviarError(
                            resp,
                            403,
                            "Solo administradores pueden acceder"
                    );

                    return;
                }

                switch (path) {

                    case "/admin/top-freelancers" ->

                            JsonUtil.enviarJson(
                                    resp,
                                    200,
                                    reporteService.topFreelancers(desde, hasta)
                            );

                    case "/admin/top-categorias" ->

                            JsonUtil.enviarJson(
                                    resp,
                                    200,
                                    reporteService.topCategorias(desde, hasta)
                            );

                    case "/admin/ingresos" ->

                            JsonUtil.enviarJson(
                                    resp,
                                    200,
                                    reporteService.totalIngresos(desde, hasta)
                            );

                    case "/admin/historial-comisiones" ->

                            JsonUtil.enviarJson(
                                    resp,
                                    200,
                                    saldoService.infoComision()
                            );

                    case "/admin/estadisticas" ->

                            JsonUtil.enviarJson(
                                    resp,
                                    200,
                                    reporteService.obtenerEstadisticasGlobales()
                            );

                    default ->

                            JsonUtil.enviarError(
                                    resp,
                                    404,
                                    "Reporte admin no encontrado"
                            );
                }

                return;
            }

            // =================================================
            // CLIENTE
            // =================================================

            if (path.startsWith("/cliente/")) {

                if (!"CLIENTE".equals(rol)) {

                    JsonUtil.enviarError(
                            resp,
                            403,
                            "Solo clientes pueden acceder"
                    );

                    return;
                }

                if (uid == null) {

                    JsonUtil.enviarError(resp, 401, "Usuario no autenticado");

                    return;
                }

                switch (path) {

                    case "/cliente/proyectos" ->

                            JsonUtil.enviarJson(
                                    resp,
                                    200,
                                    reporteService.historialProyectosCliente(uid, desde, hasta)
                            );

                    case "/cliente/recargas" ->

                            JsonUtil.enviarJson(
                                    resp,
                                    200,
                                    reporteService.historialRecargasCliente(uid, desde, hasta)
                            );

                    case "/cliente/gasto-categorias" ->

                            JsonUtil.enviarJson(
                                    resp,
                                    200,
                                    reporteService.gastoPorCategoriaCliente(uid, desde, hasta)
                            );

                    default ->

                            JsonUtil.enviarError(
                                    resp,
                                    404,
                                    "Reporte cliente no encontrado"
                            );
                }

                return;
            }

            // =================================================
            // FREELANCER
            // =================================================

            if (path.startsWith("/freelancer/")) {

                if (!"FREELANCER".equals(rol)) {

                    JsonUtil.enviarError(
                            resp,
                            403,
                            "Solo freelancers pueden acceder"
                    );

                    return;
                }

                if (uid == null) {

                    JsonUtil.enviarError(resp, 401, "Usuario no autenticado");

                    return;
                }

                switch (path) {

                    case "/freelancer/contratos" ->

                            JsonUtil.enviarJson(
                                    resp,
                                    200,
                                    reporteService.historialContratosFreelancer(uid, desde, hasta)
                            );

                    case "/freelancer/top-categorias" ->

                            JsonUtil.enviarJson(
                                    resp,
                                    200,
                                    reporteService.topCategoriasFreelancer(uid)
                            );

                    case "/freelancer/propuestas" ->

                            JsonUtil.enviarJson(
                                    resp,
                                    200,
                                    reporteService.propuestasFreelancer(uid, desde, hasta)
                            );

                    case "/freelancer/estadisticas" ->

                            JsonUtil.enviarJson(
                                    resp,
                                    200,
                                    reporteService.obtenerEstadisticasFreelancer(uid)
                            );

                    default ->

                            JsonUtil.enviarError(
                                    resp,
                                    404,
                                    "Reporte freelancer no encontrado"
                            );
                }

                return;
            }

            JsonUtil.enviarError(resp, 404, "Ruta inválida");

        } catch (Exception e) {

            e.printStackTrace();

            JsonUtil.enviarError(
                    resp,
                    500,
                    "Error al obtener reportes"
            );
        }
    }
}