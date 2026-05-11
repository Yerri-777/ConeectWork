package servlet;

import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import service.SaldoService;
import util.JsonUtil;

import java.io.IOException;
import java.util.Map;

@WebServlet("/api/saldo/*")
public class SaldoServlet extends HttpServlet {

    private final SaldoService service = new SaldoService();

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

            System.err.println("[SaldoServlet] Error obteniendo rol: " + e.getMessage());

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

            System.err.println("[SaldoServlet] Error obteniendo usuarioId: " + e.getMessage());

            return null;
        }
    }

    private boolean esAdmin(HttpServletRequest req) {
        return "ADMIN".equalsIgnoreCase(obtenerRol(req));
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

        if (path == null) {
            path = "/";
        }

        Integer uid = obtenerUsuarioId(req);

        try {

            switch (path) {

                // =================================================
                // CONSULTAR SALDO PERSONAL
                // =================================================

                case "/" -> {

                    if (uid == null) {

                        JsonUtil.enviarError(resp, 401, "Usuario no autenticado");

                        return;
                    }

                    JsonUtil.enviarJson(
                            resp,
                            200,
                            Map.of(
                                    "saldo",
                                    service.consultarSaldo(uid)
                            )
                    );
                }

                // =================================================
                // SALDO PLATAFORMA
                // =================================================

                case "/plataforma" -> {

                    if (!esAdmin(req)) {

                        JsonUtil.enviarError(
                                resp,
                                403,
                                "Solo administradores"
                        );

                        return;
                    }

                    JsonUtil.enviarJson(
                            resp,
                            200,
                            service.saldoPlataforma()
                    );
                }

                // =================================================
                // INFO COMISION
                // =================================================

                case "/comision" -> {

                    if (!esAdmin(req)) {

                        JsonUtil.enviarError(
                                resp,
                                403,
                                "Solo administradores"
                        );

                        return;
                    }

                    JsonUtil.enviarJson(
                            resp,
                            200,
                            service.infoComision()
                    );
                }

                default ->

                        JsonUtil.enviarError(
                                resp,
                                404,
                                "Ruta no encontrada"
                        );
            }

        } catch (IllegalArgumentException e) {

            JsonUtil.enviarError(resp, 400, e.getMessage());

        } catch (Exception e) {

            e.printStackTrace();

            JsonUtil.enviarError(
                    resp,
                    500,
                    "Error al consultar saldo"
            );
        }
    }

    // =========================================================
    // POST
    // =========================================================

    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp) throws IOException {

        if (!esCliente(req)) {

            JsonUtil.enviarError(
                    resp,
                    403,
                    "Solo clientes pueden recargar saldo"
            );

            return;
        }

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

            Object montoObj = body.get("monto");

            if (montoObj == null) {

                JsonUtil.enviarError(
                        resp,
                        400,
                        "El monto es requerido"
                );

                return;
            }

            System.out.println("[SaldoServlet.doPost] Recarga solicitada UID=" + uid);

            JsonUtil.enviarJson(
                    resp,
                    201,
                    service.recargar(uid, montoObj)
            );

        } catch (IllegalArgumentException e) {

            JsonUtil.enviarError(resp, 400, e.getMessage());

        } catch (Exception e) {

            e.printStackTrace();

            JsonUtil.enviarError(
                    resp,
                    500,
                    "Error al recargar saldo"
            );
        }
    }

    // =========================================================
    // PUT
    // =========================================================

    @Override
    protected void doPut(HttpServletRequest req, HttpServletResponse resp) throws IOException {

        String path = req.getPathInfo();

        if (!"/comision".equals(path)) {

            JsonUtil.enviarError(
                    resp,
                    404,
                    "Ruta no encontrada"
            );

            return;
        }

        if (!esAdmin(req)) {

            JsonUtil.enviarError(
                    resp,
                    403,
                    "Solo administradores pueden cambiar la comisión"
            );

            return;
        }

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

            Object porcentajeObj = body.get("porcentaje");

            if (porcentajeObj == null) {

                JsonUtil.enviarError(
                        resp,
                        400,
                        "El porcentaje es requerido"
                );

                return;
            }

            service.cambiarComision(porcentajeObj, uid);

            System.out.println("[SaldoServlet.doPut] Comisión actualizada por ADMIN ID=" + uid);

            JsonUtil.enviarJson(
                    resp,
                    200,
                    Map.of(
                            "mensaje",
                            "Porcentaje de comisión actualizado correctamente"
                    )
            );

        } catch (IllegalArgumentException e) {

            JsonUtil.enviarError(resp, 400, e.getMessage());

        } catch (Exception e) {

            e.printStackTrace();

            JsonUtil.enviarError(
                    resp,
                    500,
                    "Error al actualizar comisión"
            );
        }
    }
}