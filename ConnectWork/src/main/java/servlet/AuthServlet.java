package servlet;

import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import service.AuthService;
import util.JsonUtil;

import java.io.IOException;
import java.sql.SQLException;
import java.util.Map;

@WebServlet("/api/auth/*")
public class AuthServlet extends HttpServlet {

    private final AuthService authService =
            new AuthService();

    // =========================================================
    // POST
    // =========================================================

    @Override
    protected void doPost(
            HttpServletRequest req,
            HttpServletResponse resp
    ) throws IOException {

        String path = req.getPathInfo();

        System.out.println("\n====================================");
        System.out.println("[AuthServlet] POST: " + path);
        System.out.println("====================================");

        try {

            // =====================================================
            // VALIDAR PATH
            // =====================================================

            if (
                    path == null ||
                    path.isBlank()
            ) {

                System.err.println(
                        "[AuthServlet] Ruta no especificada"
                );

                JsonUtil.enviarError(
                        resp,
                        404,
                        "Ruta no especificada"
                );

                return;
            }

            // =====================================================
            // ROUTER
            // =====================================================

            switch (path) {

                // =================================================
                // LOGIN
                // =================================================

                case "/login" -> {

                    System.out.println(
                            "[AuthServlet] → LOGIN"
                    );

                    handleLogin(req, resp);
                }

                // =================================================
                // REGISTRO
                // =================================================

                case "/registro" -> {

                    System.out.println(
                            "[AuthServlet] → REGISTRO"
                    );

                    handleRegistro(req, resp);
                }

                // =================================================
                // DEFAULT
                // =================================================

                default -> {

                    System.err.println(
                            "[AuthServlet] Ruta no encontrada: "
                                    + path
                    );

                    JsonUtil.enviarError(
                            resp,
                            404,
                            "Ruta no encontrada"
                    );
                }
            }

        }

        // =========================================================
        // ERROR GENERAL
        // =========================================================

        catch (Exception e) {

            System.err.println(
                    "[AuthServlet] ERROR GENERAL"
            );

            e.printStackTrace();

            JsonUtil.enviarError(
                    resp,
                    500,
                    "Error interno servidor"
            );
        }
    }

    // =========================================================
    // LOGIN
    // =========================================================

    private void handleLogin(
            HttpServletRequest req,
            HttpServletResponse resp
    ) throws IOException {

        try {

            System.out.println(
                    "\n===================================="
            );

            System.out.println(
                    "[AuthServlet] Procesando login..."
            );

            System.out.println(
                    "===================================="
            );

            // =====================================================
            // LEER BODY
            // =====================================================

            @SuppressWarnings("unchecked")
            Map<String, Object> body =
                    (Map<String, Object>)
                            JsonUtil.leerJson(
                                    req,
                                    Map.class
                            );

            // =====================================================
            // VALIDAR BODY
            // =====================================================

            if (body == null) {

                System.err.println(
                        "[AuthServlet] Body NULL"
                );

                JsonUtil.enviarError(
                        resp,
                        400,
                        "Body inválido"
                );

                return;
            }

            System.out.println(
                    "[AuthServlet] BODY: " + body
            );

            // =====================================================
            // USERNAME
            // =====================================================

            String username =
                    body.get("username") != null
                            ? body.get("username")
                            .toString()
                            .trim()
                            : "";

            // =====================================================
            // PASSWORD
            // =====================================================

            String password =
                    body.get("password") != null
                            ? body.get("password")
                            .toString()
                            : "";

            // =====================================================
            // VALIDACIONES
            // =====================================================

            if (username.isBlank()) {

                System.err.println(
                        "[AuthServlet] Username vacío"
                );

                JsonUtil.enviarError(
                        resp,
                        400,
                        "Username requerido"
                );

                return;
            }

            if (password.isBlank()) {

                System.err.println(
                        "[AuthServlet] Password vacío"
                );

                JsonUtil.enviarError(
                        resp,
                        400,
                        "Password requerido"
                );

                return;
            }

            System.out.println(
                    "[AuthServlet] Username: "
                            + username
            );

            // =====================================================
            // LOGIN SERVICE
            // =====================================================

            Map<String, Object> result =
                    authService.login(
                            username,
                            password
                    );

            // =====================================================
            // LOGIN FALLIDO
            // =====================================================

            if (result == null) {

                System.err.println(
                        "[AuthServlet] Credenciales inválidas"
                );

                JsonUtil.enviarError(
                        resp,
                        401,
                        "Credenciales inválidas"
                );

                return;
            }

            // =====================================================
            // VALIDAR TOKEN
            // =====================================================

            Object token =
                    result.get("token");

            if (
                    token == null ||
                    token.toString().isBlank()
            ) {

                System.err.println(
                        "[AuthServlet] Token inválido"
                );

                JsonUtil.enviarError(
                        resp,
                        500,
                        "Error generando token"
                );

                return;
            }

            // =====================================================
            // VALIDAR USUARIO
            // =====================================================

            Object usuario =
                    result.get("usuario");

            if (usuario == null) {

                System.err.println(
                        "[AuthServlet] Usuario NULL en response"
                );

                JsonUtil.enviarError(
                        resp,
                        500,
                        "Error obteniendo usuario"
                );

                return;
            }

            // =====================================================
            // SUCCESS
            // =====================================================

            System.out.println(
                    "[AuthServlet] ✓ Login exitoso"
            );

            System.out.println(
                    "[AuthServlet] RESPONSE: "
                            + result
            );

            JsonUtil.enviarJson(
                    resp,
                    200,
                    result
            );
        }

        // =========================================================
        // VALIDACIONES
        // =========================================================

        catch (IllegalArgumentException e) {

            System.err.println(
                    "[AuthServlet] Error validación: "
                            + e.getMessage()
            );

            JsonUtil.enviarError(
                    resp,
                    400,
                    e.getMessage()
            );
        }

        // =========================================================
        // SQL
        // =========================================================

        catch (SQLException e) {

            System.err.println(
                    "[AuthServlet] ERROR SQL LOGIN"
            );

            e.printStackTrace();

            JsonUtil.enviarError(
                    resp,
                    500,
                    "Error base de datos"
            );
        }

        // =========================================================
        // ERROR GENERAL LOGIN
        // =========================================================

        catch (Exception e) {

            System.err.println(
                    "[AuthServlet] ERROR LOGIN"
            );

            e.printStackTrace();

            JsonUtil.enviarError(
                    resp,
                    500,
                    "Error login"
            );
        }
    }

    // =========================================================
    // REGISTRO
    // =========================================================

    private void handleRegistro(
            HttpServletRequest req,
            HttpServletResponse resp
    ) throws IOException {

        try {

            System.out.println(
                    "\n===================================="
            );

            System.out.println(
                    "[AuthServlet] Procesando registro..."
            );

            System.out.println(
                    "===================================="
            );

            // =====================================================
            // BODY
            // =====================================================

            @SuppressWarnings("unchecked")
            Map<String, Object> body =
                    (Map<String, Object>)
                            JsonUtil.leerJson(
                                    req,
                                    Map.class
                            );

            // =====================================================
            // VALIDAR BODY
            // =====================================================

            if (body == null) {

                JsonUtil.enviarError(
                        resp,
                        400,
                        "Body inválido"
                );

                return;
            }

            System.out.println(
                    "[AuthServlet] BODY REGISTRO: "
                            + body
            );

            // =====================================================
            // REGISTRAR
            // =====================================================

            int id =
                    authService.registrar(body);

            // =====================================================
            // VALIDAR ID
            // =====================================================

            if (id <= 0) {

                JsonUtil.enviarError(
                        resp,
                        500,
                        "No se pudo registrar usuario"
                );

                return;
            }

            // =====================================================
            // RESPONSE
            // =====================================================

            Map<String, Object> response =
                    Map.of(

                            "success", true,

                            "id", id,

                            "mensaje",
                            "Registro exitoso"
                    );

            System.out.println(
                    "[AuthServlet] ✓ Registro exitoso"
            );

            System.out.println(
                    "[AuthServlet] RESPONSE: "
                            + response
            );

            JsonUtil.enviarJson(
                    resp,
                    201,
                    response
            );
        }

        // =========================================================
        // VALIDACIONES
        // =========================================================

        catch (IllegalArgumentException e) {

            System.err.println(
                    "[AuthServlet] VALIDACIÓN REGISTRO: "
                            + e.getMessage()
            );

            JsonUtil.enviarError(
                    resp,
                    400,
                    e.getMessage()
            );
        }

        // =========================================================
        // DUPLICADOS
        // =========================================================

        catch (IllegalStateException e) {

            System.err.println(
                    "[AuthServlet] DUPLICADO: "
                            + e.getMessage()
            );

            String msg =
                    e.getMessage();

            int status = 400;

            if (
                    msg != null &&
                    (
                            msg.contains("DUPLICADO") ||
                            msg.contains("duplicado")
                    )
            ) {

                status = 409;
            }

            String mensaje = switch (msg) {

                case "USERNAME_DUPLICADO" ->
                        "El username ya existe";

                case "CORREO_DUPLICADO" ->
                        "El correo ya existe";

                default ->
                        msg;
            };

            JsonUtil.enviarError(
                    resp,
                    status,
                    mensaje
            );
        }

        // =========================================================
        // SQL
        // =========================================================

        catch (SQLException e) {

            System.err.println(
                    "[AuthServlet] ERROR SQL REGISTRO"
            );

            e.printStackTrace();

            JsonUtil.enviarError(
                    resp,
                    500,
                    "Error base de datos"
            );
        }

        // =========================================================
        // ERROR GENERAL
        // =========================================================

        catch (Exception e) {

            System.err.println(
                    "[AuthServlet] ERROR REGISTRO"
            );

            e.printStackTrace();

            JsonUtil.enviarError(
                    resp,
                    500,
                    "Error registro"
            );
        }
    }
}