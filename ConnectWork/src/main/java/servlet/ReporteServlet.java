package servlet;

import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.*;
import service.ReporteService;
import service.SaldoService;
import util.JsonUtil;

import java.io.IOException;

@WebServlet("/api/reportes/*")
public class ReporteServlet extends HttpServlet {

    private final ReporteService reporteService = new ReporteService();
    private final SaldoService saldoService = new SaldoService();

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        String path = req.getPathInfo();
        String rol = (String) req.getAttribute("rol");
        int uid = (int) req.getAttribute("usuarioId");
        String desde = req.getParameter("desde");
        String hasta = req.getParameter("hasta");
        try {
            if (path.startsWith("/admin/")) {
                if (!"ADMIN".equals(rol)) {
                    JsonUtil.enviarError(resp, 403, "Solo admin");
                    return;
                }
                switch (path) {
                    case "/admin/top-freelancers" ->
                        JsonUtil.enviarJson(resp, 200, reporteService.topFreelancers(desde, hasta));
                    case "/admin/top-categorias" ->
                        JsonUtil.enviarJson(resp, 200, reporteService.topCategorias(desde, hasta));
                    case "/admin/ingresos" ->
                        JsonUtil.enviarJson(resp, 200, reporteService.totalIngresos(desde, hasta));
                    case "/admin/historial-comisiones" ->
                        JsonUtil.enviarJson(resp, 200, saldoService.infoComision());
                    default ->
                        JsonUtil.enviarError(resp, 404, "Reporte no encontrado");
                }
            } else if (path.startsWith("/cliente/")) {
                if (!"CLIENTE".equals(rol)) {
                    JsonUtil.enviarError(resp, 403, "Solo clientes");
                    return;
                }
                switch (path) {
                    case "/cliente/proyectos" ->
                        JsonUtil.enviarJson(resp, 200, reporteService.historialProyectosCliente(uid, desde, hasta));
                    case "/cliente/recargas" ->
                        JsonUtil.enviarJson(resp, 200, reporteService.historialRecargasCliente(uid, desde, hasta));
                    case "/cliente/gasto-categorias" ->
                        JsonUtil.enviarJson(resp, 200, reporteService.gastoPorCategoriaCliente(uid, desde, hasta));
                    default ->
                        JsonUtil.enviarError(resp, 404, "Reporte no encontrado");
                }
            } else if (path.startsWith("/freelancer/")) {
                if (!"FREELANCER".equals(rol)) {
                    JsonUtil.enviarError(resp, 403, "Solo freelancers");
                    return;
                }
                switch (path) {
                    case "/freelancer/contratos" ->
                        JsonUtil.enviarJson(resp, 200, reporteService.historialContratosFreelancer(uid, desde, hasta));
                    case "/freelancer/top-categorias" ->
                        JsonUtil.enviarJson(resp, 200, reporteService.topCategoriasFreelancer(uid));
                    case "/freelancer/propuestas" ->
                        JsonUtil.enviarJson(resp, 200, reporteService.propuestasFreelancer(uid, desde, hasta));
                    default ->
                        JsonUtil.enviarError(resp, 404, "Reporte no encontrado");
                }
            } else {
                JsonUtil.enviarError(resp, 404, "Ruta no encontrada");
            }
        } catch (Exception e) {
            JsonUtil.enviarError(resp, 500, "Error: " + e.getMessage());
        }
    }
}







/**
 * ── ADMIN ──────────────────────────────────────────────────────────────────
 * GET /api/reportes/admin/top-freelancers?desde=&hasta=
 * GET /api/reportes/admin/top-categorias?desde=&hasta=
 * GET /api/reportes/admin/ingresos?desde=&hasta=
 * GET /api/reportes/admin/historial-comisiones   (sin intervalo, historial completo)
 *
 * ── CLIENTE ─────────────────────────────────────────────────────────────────
 * GET /api/reportes/cliente/proyectos?desde=&hasta=
 * GET /api/reportes/cliente/recargas?desde=&hasta=
 * GET /api/reportes/cliente/gasto-categorias?desde=&hasta=
 *
 * ── FREELANCER ───────────────────────────────────────────────────────────────
 * GET /api/reportes/freelancer/contratos?desde=&hasta=
 * GET /api/reportes/freelancer/top-categorias
 * GET /api/reportes/freelancer/propuestas?desde=&hasta=
 */
