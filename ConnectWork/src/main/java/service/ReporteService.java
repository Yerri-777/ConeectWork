package service;

import dao.ReporteDAO;

import java.sql.SQLException;
import java.util.List;
import java.util.Map;

/**
 * Lógica de negocio para reportes de admin, cliente y freelancer. Aplica los
 * defaults de intervalo de fechas antes de delegar al DAO.
 */
public class ReporteService {

    private static final String FECHA_MIN = "2000-01-01 00:00:00";
    private static final String FECHA_MAX = "2099-12-31 23:59:59";

    private final ReporteDAO dao;

    public ReporteService() {
        this.dao = new ReporteDAO();
    }

    // ── ADMIN ────────────────────────────────────────────────────────────────
    public List<Map<String, Object>> topFreelancers(String desde, String hasta) throws SQLException {
        return dao.topFreelancers(d(desde), h(hasta));
    }

    public List<Map<String, Object>> topCategorias(String desde, String hasta) throws SQLException {
        return dao.topCategorias(d(desde), h(hasta));
    }

    public Map<String, Object> totalIngresos(String desde, String hasta) throws SQLException {
        return dao.totalIngresos(d(desde), h(hasta));
    }

    // ── CLIENTE ──────────────────────────────────────────────────────────────
    public List<Map<String, Object>> historialProyectosCliente(int clienteId, String desde, String hasta) throws SQLException {
        return dao.historialProyectosCliente(clienteId, d(desde), h(hasta));
    }

    public List<Map<String, Object>> historialRecargasCliente(int clienteId, String desde, String hasta) throws SQLException {
        return dao.historialRecargasCliente(clienteId, d(desde), h(hasta));
    }

    public List<Map<String, Object>> gastoPorCategoriaCliente(int clienteId, String desde, String hasta) throws SQLException {
        return dao.gastoPorCategoriaCliente(clienteId, d(desde), h(hasta));
    }

    // ── FREELANCER ───────────────────────────────────────────────────────────
    public List<Map<String, Object>> historialContratosFreelancer(int freelancerId, String desde, String hasta) throws SQLException {
        return dao.historialContratosFreelancer(freelancerId, d(desde), h(hasta));
    }

    public List<Map<String, Object>> topCategoriasFreelancer(int freelancerId) throws SQLException {
        return dao.topCategoriasFreelancer(freelancerId);
    }

    public List<Map<String, Object>> propuestasFreelancer(int freelancerId, String desde, String hasta) throws SQLException {
        return dao.propuestasFreelancer(freelancerId, d(desde), h(hasta));
    }

    // ── Helpers ──────────────────────────────────────────────────────────────
    private String d(String desde) {
        return desde != null ? desde + " 00:00:00" : FECHA_MIN;
    }

    private String h(String hasta) {
        return hasta != null ? hasta + " 23:59:59" : FECHA_MAX;
    }
}
