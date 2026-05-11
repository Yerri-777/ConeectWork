package config;

import com.google.gson.Gson;
import io.jsonwebtoken.Claims;
import jakarta.servlet.*;
import jakarta.servlet.annotation.WebFilter;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import util.JwtUtil;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

/**
 * =========================================================
 * AuthFilter
 * ---------------------------------------------------------
 * Filtro global JWT para ConnectWork
 *
 * FUNCIONES:
 * ✔ Validar JWT
 * ✔ Extraer usuario autenticado
 * ✔ Extraer rol
 * ✔ Inyectar atributos globales
 * ✔ Proteger rutas privadas
 * ✔ Permitir rutas públicas
 *
 * ROLES SOPORTADOS:
 * - ADMIN
 * - CLIENTE
 * - FREELANCER
 * =========================================================
 */
@WebFilter("/api/*")
public class AuthFilter implements Filter {

    private static final Gson gson = new Gson();

    // =====================================================
    // FILTER
    // =====================================================

    @Override
    public void doFilter(
            ServletRequest request,
            ServletResponse response,
            FilterChain chain
    ) throws IOException, ServletException {

        HttpServletRequest req =
                (HttpServletRequest) request;

        HttpServletResponse resp =
                (HttpServletResponse) response;

        // =================================================
        // NORMALIZAR PATH
        // =================================================

        String contextPath =
                req.getContextPath();

        String uri =
                req.getRequestURI();

        String path =
                uri.substring(contextPath.length());

        System.out.println(
                "\n========== AUTH FILTER =========="
        );

        System.out.println(
                "[AuthFilter] "
                        + req.getMethod()
                        + " "
                        + path
        );

        // =================================================
        // OPTIONS
        // =================================================

        if ("OPTIONS".equalsIgnoreCase(
                req.getMethod()
        )) {

            chain.doFilter(request, response);

            return;
        }

        // =================================================
        // RUTAS PÚBLICAS
        // =================================================

        if (
                path.startsWith("/api/auth/")
                        || path.equals("/")
                        || path.equals("/index.html")
                        || path.isBlank()
        ) {

            System.out.println(
                    "[AuthFilter] ✓ Ruta pública"
            );

            chain.doFilter(request, response);

            return;
        }

        // =================================================
        // AUTH HEADER
        // =================================================

        String authHeader =
                req.getHeader("Authorization");

        if (authHeader == null ||
                authHeader.isBlank()) {

            System.err.println(
                    "[AuthFilter] ✗ Authorization header vacío"
            );

            enviarError(
                    resp,
                    HttpServletResponse.SC_UNAUTHORIZED,
                    "Token no proporcionado"
            );

            return;
        }

        // =================================================
        // EXTRAER TOKEN
        // =================================================

        String token =
                JwtUtil.extraerToken(authHeader);

        if (token == null ||
                token.isBlank()) {

            System.err.println(
                    "[AuthFilter] ✗ Bearer token inválido"
            );

            enviarError(
                    resp,
                    HttpServletResponse.SC_UNAUTHORIZED,
                    "Token inválido"
            );

            return;
        }

        try {

            // =============================================
            // VALIDAR JWT
            // =============================================

            Claims claims =
                    JwtUtil.validarToken(token);

            if (claims == null) {

                System.err.println(
                        "[AuthFilter] ✗ Token expirado o inválido"
                );

                enviarError(
                        resp,
                        HttpServletResponse.SC_UNAUTHORIZED,
                        "Token inválido o expirado"
                );

                return;
            }

            // =============================================
            // EXTRAER DATOS
            // =============================================

            String subject =
                    claims.getSubject();

            if (subject == null ||
                    subject.isBlank()) {

                System.err.println(
                        "[AuthFilter] ✗ Subject vacío"
                );

                enviarError(
                        resp,
                        HttpServletResponse.SC_UNAUTHORIZED,
                        "Token inválido"
                );

                return;
            }

            int usuarioId =
                    Integer.parseInt(subject);

            String username =
                    claims.get(
                            "username",
                            String.class
                    );

            String rol =
                    claims.get(
                            "rol",
                            String.class
                    );

            // =============================================
            // VALIDAR ROL
            // =============================================

            if (rol == null ||
                    rol.isBlank()) {

                System.err.println(
                        "[AuthFilter] ✗ El token no contiene rol"
                );

                enviarError(
                        resp,
                        HttpServletResponse.SC_UNAUTHORIZED,
                        "Token inválido: rol faltante"
                );

                return;
            }

            rol = rol
                    .trim()
                    .toUpperCase();

            // =============================================
            // VALIDAR ROLES SOPORTADOS
            // =============================================

            boolean rolValido =
                    rol.equals("ADMIN")
                            || rol.equals("CLIENTE")
                            || rol.equals("FREELANCER");

            if (!rolValido) {

                System.err.println(
                        "[AuthFilter] ✗ Rol inválido: " + rol
                );

                enviarError(
                        resp,
                        HttpServletResponse.SC_UNAUTHORIZED,
                        "Rol inválido"
                );

                return;
            }

            // =============================================
            // ATRIBUTOS GLOBALES
            // =============================================

            req.setAttribute(
                    "usuarioId",
                    usuarioId
            );

            req.setAttribute(
                    "userId",
                    usuarioId
            );

            req.setAttribute(
                    "idUsuario",
                    usuarioId
            );

            req.setAttribute(
                    "username",
                    username
            );

            req.setAttribute(
                    "rol",
                    rol
            );

            // =============================================
            // DEBUG
            // =============================================

            System.out.println(
                    "[AuthFilter] ✓ usuarioId = "
                            + usuarioId
            );

            System.out.println(
                    "[AuthFilter] ✓ username = "
                            + username
            );

            System.out.println(
                    "[AuthFilter] ✓ rol = "
                            + rol
            );

            System.out.println(
                    "=================================\n"
            );

            // =============================================
            // CONTINUAR
            // =============================================

            chain.doFilter(request, response);

        } catch (NumberFormatException e) {

            System.err.println(
                    "[AuthFilter] ✗ userId inválido"
            );

            enviarError(
                    resp,
                    HttpServletResponse.SC_UNAUTHORIZED,
                    "Usuario inválido"
            );

        } catch (Exception e) {

            e.printStackTrace();

            System.err.println(
                    "[AuthFilter] ✗ Error JWT: "
                            + e.getMessage()
            );

            enviarError(
                    resp,
                    HttpServletResponse.SC_UNAUTHORIZED,
                    "Token inválido o expirado"
            );
        }
    }

    // =====================================================
    // ENVIAR ERROR JSON
    // =====================================================

    private void enviarError(
            HttpServletResponse resp,
            int status,
            String mensaje
    ) throws IOException {

        resp.setStatus(status);

        resp.setContentType(
                "application/json;charset=UTF-8"
        );

        Map<String, Object> error =
                new HashMap<>();

        error.put("success", false);

        error.put("status", status);

        error.put("mensaje", mensaje);

        resp.getWriter()
                .write(
                        gson.toJson(error)
                );

        resp.getWriter().flush();
    }

    // =====================================================
    // INIT
    // =====================================================

    @Override
    public void init(FilterConfig filterConfig) {

        System.out.println(
                "✓ AuthFilter inicializado"
        );
    }

    // =====================================================
    // DESTROY
    // =====================================================

    @Override
    public void destroy() {

        System.out.println(
                "✓ AuthFilter destruido"
        );
    }
}