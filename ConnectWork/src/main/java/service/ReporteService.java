package service;

import dao.ReporteDAO;

import java.sql.SQLException;
import java.time.LocalDate;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 * Servicio central de reportes
 * ConnectWork - CUNOC
 */
public class ReporteService {

    private static final String FECHA_MIN =
            "2000-01-01 00:00:00";

    private static final String FECHA_MAX =
            "2099-12-31 23:59:59";

    private final ReporteDAO dao;

    public ReporteService() {

        this.dao = new ReporteDAO();
    }

    // =====================================================
    // ADMIN
    // =====================================================

    public List<Map<String, Object>> topFreelancers(
            String desde,
            String hasta
    ) throws SQLException {

        validarFechas(desde, hasta);

        return dao.topFreelancers(
                d(desde),
                h(hasta)
        );
    }

    public List<Map<String, Object>> topCategorias(
            String desde,
            String hasta
    ) throws SQLException {

        validarFechas(desde, hasta);

        return dao.topCategorias(
                d(desde),
                h(hasta)
        );
    }

    public Map<String, Object> totalIngresos(
            String desde,
            String hasta
    ) throws SQLException {

        validarFechas(desde, hasta);

        return dao.totalIngresos(
                d(desde),
                h(hasta)
        );
    }

    /**
     * ESTADISTICAS GLOBALES
     */
    public Map<String, Object>
    obtenerEstadisticasGlobales()
            throws SQLException {

        Map<String, Object> stats =
                new LinkedHashMap<>();

        try {

            int freelancers =
                    dao.contarFreelancers();

            int clientes =
                    dao.contarClientes();

            int totalUsuarios =
                    freelancers + clientes;

            int proyectos =
                    dao.contarProyectosTotales();

            int contratosActivos =
                    dao.contarContratosActivos();

            /**
             * IMPORTANTE:
             * Como aún no tienes tabla solicitudes
             */
            int solicitudesPendientes = 0;

            // =========================================
            // RESPONSE FINAL PARA ANGULAR
            // =========================================

            stats.put(
                    "totalUsuarios",
                    totalUsuarios
            );

            stats.put(
                    "totalFreelancers",
                    freelancers
            );

            stats.put(
                    "totalClientes",
                    clientes
            );

            stats.put(
                    "totalProyectos",
                    proyectos
            );

            stats.put(
                    "totalContratosActivos",
                    contratosActivos
            );

            stats.put(
                    "totalSolicitudesPendientes",
                    solicitudesPendientes
            );

            stats.put(
                    "contratosCompletados",
                    dao.contarContratosCompletados()
            );

            stats.put(
                    "categorias",
                    dao.contarCategorias()
            );

            stats.put(
                    "habilidades",
                    dao.contarHabilidades()
            );

            System.out.println(
                    "[ReporteService] ✓ Estadísticas generadas:"
            );

            System.out.println(stats);

        } catch (SQLException e) {

            System.err.println(
                    "[ReporteService] Error estadísticas: "
                            + e.getMessage()
            );

            throw new SQLException(
                    "Error obteniendo estadísticas globales",
                    e
            );
        }

        return stats;
    }

    // =====================================================
    // CLIENTE
    // =====================================================

    public List<Map<String, Object>>
    historialProyectosCliente(
            int clienteId,
            String desde,
            String hasta
    ) throws SQLException {

        validarUsuario(clienteId);

        validarFechas(desde, hasta);

        return dao.historialProyectosCliente(
                clienteId,
                d(desde),
                h(hasta)
        );
    }

    public List<Map<String, Object>>
    historialRecargasCliente(
            int clienteId,
            String desde,
            String hasta
    ) throws SQLException {

        validarUsuario(clienteId);

        validarFechas(desde, hasta);

        return dao.historialRecargasCliente(
                clienteId,
                d(desde),
                h(hasta)
        );
    }

    public List<Map<String, Object>>
    gastoPorCategoriaCliente(
            int clienteId,
            String desde,
            String hasta
    ) throws SQLException {

        validarUsuario(clienteId);

        validarFechas(desde, hasta);

        return dao.gastoPorCategoriaCliente(
                clienteId,
                d(desde),
                h(hasta)
        );
    }

    // =====================================================
    // FREELANCER
    // =====================================================

    public List<Map<String, Object>>
    historialContratosFreelancer(
            int freelancerId,
            String desde,
            String hasta
    ) throws SQLException {

        validarUsuario(freelancerId);

        validarFechas(desde, hasta);

        return dao.historialContratosFreelancer(
                freelancerId,
                d(desde),
                h(hasta)
        );
    }

    public List<Map<String, Object>>
    topCategoriasFreelancer(
            int freelancerId
    ) throws SQLException {

        validarUsuario(freelancerId);

        return dao.topCategoriasFreelancer(
                freelancerId
        );
    }

    public List<Map<String, Object>>
    propuestasFreelancer(
            int freelancerId,
            String desde,
            String hasta
    ) throws SQLException {

        validarUsuario(freelancerId);

        validarFechas(desde, hasta);

        return dao.propuestasFreelancer(
                freelancerId,
                d(desde),
                h(hasta)
        );
    }

    public Map<String, Object>
    obtenerEstadisticasFreelancer(
            int freelancerId
    ) throws SQLException {

        validarUsuario(freelancerId);

        Map<String, Object> stats =
                new LinkedHashMap<>();

        try {

            stats.put(
                    "contratosCompletados",
                    dao.contarContratosCompletadosFreelancer(
                            freelancerId
                    )
            );

            stats.put(
                    "contratosActivos",
                    dao.contarContratosActivosFreelancer(
                            freelancerId
                    )
            );

            stats.put(
                    "propuestasEnviadas",
                    dao.contarPropuestasFreelancer(
                            freelancerId
                    )
            );

            stats.put(
                    "propuestasAceptadas",
                    dao.contarPropuestasAceptadasFreelancer(
                            freelancerId
                    )
            );

            stats.put(
                    "ingresosTotales",
                    dao.calcularIngresosFreelancer(
                            freelancerId
                    )
            );

            stats.put(
                    "ratingPromedio",
                    dao.obtenerRatingFreelancer(
                            freelancerId
                    )
            );

            stats.put(
                    "topCategorias",
                    dao.topCategoriasFreelancer(
                            freelancerId
                    )
            );

        } catch (SQLException e) {

            System.err.println(
                    "[ReporteService] Error freelancer: "
                            + e.getMessage()
            );

            throw new SQLException(
                    "Error estadísticas freelancer",
                    e
            );
        }

        return stats;
    }

    // =====================================================
    // HELPERS
    // =====================================================

    private void validarUsuario(
            int usuarioId
    ) {

        if (usuarioId <= 0) {

            throw new IllegalArgumentException(
                    "ID usuario inválido"
            );
        }
    }

    private void validarFechas(
            String desde,
            String hasta
    ) {

        try {

            if (desde != null &&
                    !desde.isBlank()) {

                LocalDate.parse(desde);
            }

            if (hasta != null &&
                    !hasta.isBlank()) {

                LocalDate.parse(hasta);
            }

        } catch (Exception e) {

            throw new IllegalArgumentException(
                    "Formato fecha inválido"
            );
        }
    }

    private String d(String desde) {

        return desde != null &&
                !desde.isBlank()

                ? desde + " 00:00:00"

                : FECHA_MIN;
    }

    private String h(String hasta) {

        return hasta != null &&
                !hasta.isBlank()

                ? hasta + " 23:59:59"

                : FECHA_MAX;
    }
}