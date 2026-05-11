package servlet;

import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import util.JsonUtil;

import java.io.IOException;

/**
 * =========================================================
 * BaseServlet
 * ---------------------------------------------------------
 * Clase base centralizada para:
 *
 * ✓ Autenticación
 * ✓ Roles
 * ✓ Usuario autenticado
 * ✓ Validaciones comunes
 * ✓ Manejo de errores
 * ✓ Parseo seguro
 * ✓ Evitar NullPointerException
 *
 * ConnectWork - CUNOC
 * =========================================================
 */
public abstract class BaseServlet extends HttpServlet {

    // =====================================================
    // LOG PREFIX
    // =====================================================

    protected String logPrefix() {

        return "[" + this.getClass().getSimpleName() + "]";
    }

    // =====================================================
    // OBTENER ROL
    // =====================================================

    protected String obtenerRol(HttpServletRequest req) {

        try {

            Object rolObj =
                    req.getAttribute("rol");

            if (rolObj == null) {

                System.err.println(
                        logPrefix()
                        + " Rol NULL"
                );

                return "";
            }

            String rol =
                    rolObj.toString()
                            .trim()
                            .toUpperCase();

            System.out.println(
                    logPrefix()
                    + " Rol detectado: "
                    + rol
            );

            return rol;

        } catch (Exception e) {

            System.err.println(
                    logPrefix()
                    + " Error obteniendo rol: "
                    + e.getMessage()
            );

            return "";
        }
    }

    // =====================================================
    // OBTENER USUARIO ID
    // =====================================================

    protected Integer obtenerUsuarioId(
            HttpServletRequest req
    ) {

        try {

            Object uidObj =
                    req.getAttribute("usuarioId");

            // FALLBACK
            if (uidObj == null) {

                uidObj =
                        req.getAttribute("userId");
            }

            if (uidObj == null) {

                System.err.println(
                        logPrefix()
                        + " usuarioId NULL"
                );

                return null;
            }

            Integer uid;

            if (uidObj instanceof Integer) {

                uid = (Integer) uidObj;

            } else {

                uid =
                        Integer.parseInt(
                                uidObj.toString()
                        );
            }

            System.out.println(
                    logPrefix()
                    + " usuarioId detectado: "
                    + uid
            );

            return uid;

        } catch (Exception e) {

            System.err.println(
                    logPrefix()
                    + " Error obteniendo usuarioId: "
                    + e.getMessage()
            );

            return null;
        }
    }

    // =====================================================
    // OBTENER USERNAME
    // =====================================================

    protected String obtenerUsername(
            HttpServletRequest req
    ) {

        try {

            Object usernameObj =
                    req.getAttribute("username");

            if (usernameObj == null) {

                return "";
            }

            return usernameObj
                    .toString()
                    .trim();

        } catch (Exception e) {

            return "";
        }
    }

    // =====================================================
    // VALIDAR AUTENTICACION
    // =====================================================

    protected boolean estaAutenticado(
            HttpServletRequest req
    ) {

        return obtenerUsuarioId(req) != null;
    }

    // =====================================================
    // VALIDACIONES ROL
    // =====================================================

    protected boolean esAdmin(
            HttpServletRequest req
    ) {

        return "ADMIN".equals(
                obtenerRol(req)
        );
    }

    protected boolean esCliente(
            HttpServletRequest req
    ) {

        return "CLIENTE".equals(
                obtenerRol(req)
        );
    }

    protected boolean esFreelancer(
            HttpServletRequest req
    ) {

        return "FREELANCER".equals(
                obtenerRol(req)
        );
    }

    // =====================================================
    // REQUERIR AUTH
    // =====================================================

    protected boolean requerirAutenticacion(
            HttpServletRequest req,
            HttpServletResponse resp
    ) throws IOException {

        Integer uid =
                obtenerUsuarioId(req);

        if (uid == null || uid <= 0) {

            System.err.println(
                    logPrefix()
                    + " Usuario NO autenticado"
            );

            JsonUtil.enviarError(
                    resp,
                    401,
                    "Usuario no autenticado"
            );

            return false;
        }

        return true;
    }

    // =====================================================
    // REQUERIR ADMIN
    // =====================================================

    protected boolean requerirAdmin(
            HttpServletRequest req,
            HttpServletResponse resp
    ) throws IOException {

        if (!requerirAutenticacion(req, resp)) {

            return false;
        }

        if (!esAdmin(req)) {

            System.err.println(
                    logPrefix()
                    + " Acceso denegado -> ADMIN requerido"
            );

            JsonUtil.enviarError(
                    resp,
                    403,
                    "Acceso denegado"
            );

            return false;
        }

        return true;
    }

    // =====================================================
    // REQUERIR CLIENTE
    // =====================================================

    protected boolean requerirCliente(
            HttpServletRequest req,
            HttpServletResponse resp
    ) throws IOException {

        if (!requerirAutenticacion(req, resp)) {

            return false;
        }

        if (!esCliente(req)) {

            System.err.println(
                    logPrefix()
                    + " Acceso denegado -> CLIENTE requerido"
            );

            JsonUtil.enviarError(
                    resp,
                    403,
                    "Acceso denegado"
            );

            return false;
        }

        return true;
    }

    // =====================================================
    // REQUERIR FREELANCER
    // =====================================================

    protected boolean requerirFreelancer(
            HttpServletRequest req,
            HttpServletResponse resp
    ) throws IOException {

        if (!requerirAutenticacion(req, resp)) {

            return false;
        }

        if (!esFreelancer(req)) {

            System.err.println(
                    logPrefix()
                    + " Acceso denegado -> FREELANCER requerido"
            );

            JsonUtil.enviarError(
                    resp,
                    403,
                    "Acceso denegado"
            );

            return false;
        }

        return true;
    }

    // =====================================================
    // PATH SEGURO
    // =====================================================

    protected String obtenerPath(
            HttpServletRequest req
    ) {

        try {

            String path =
                    req.getPathInfo();

            if (path == null || path.isBlank()) {

                return "/";
            }

            return path;

        } catch (Exception e) {

            return "/";
        }
    }

    // =====================================================
    // OBTENER ID DESDE PATH
    // =====================================================

    protected Integer obtenerIdDesdePath(
            HttpServletRequest req
    ) {

        try {

            String path =
                    obtenerPath(req);

            String[] partes =
                    path.substring(1).split("/");

            if (partes.length == 0) {

                return null;
            }

            return Integer.parseInt(partes[0]);

        } catch (Exception e) {

            System.err.println(
                    logPrefix()
                    + " Error parseando ID path"
            );

            return null;
        }
    }

    // =====================================================
    // VALIDAR ID PATH
    // =====================================================

    protected boolean validarIdPath(
            HttpServletRequest req,
            HttpServletResponse resp
    ) throws IOException {

        Integer id =
                obtenerIdDesdePath(req);

        if (id == null || id <= 0) {

            JsonUtil.enviarError(
                    resp,
                    400,
                    "ID inválido"
            );

            return false;
        }

        return true;
    }

    // =====================================================
    // RESPUESTAS
    // =====================================================

    protected void responderBadRequest(
            HttpServletResponse resp,
            String mensaje
    ) throws IOException {

        JsonUtil.enviarError(
                resp,
                400,
                mensaje
        );
    }

    protected void responderNoAutorizado(
            HttpServletResponse resp
    ) throws IOException {

        JsonUtil.enviarError(
                resp,
                401,
                "No autorizado"
        );
    }

    protected void responderAccesoDenegado(
            HttpServletResponse resp
    ) throws IOException {

        JsonUtil.enviarError(
                resp,
                403,
                "Acceso denegado"
        );
    }

    protected void responderNoEncontrado(
            HttpServletResponse resp,
            String mensaje
    ) throws IOException {

        JsonUtil.enviarError(
                resp,
                404,
                mensaje
        );
    }

    protected void responderErrorInterno(
            HttpServletResponse resp,
            Exception e
    ) throws IOException {

        System.err.println(
                logPrefix()
                + " ERROR INTERNO"
        );

        e.printStackTrace();

        JsonUtil.enviarError(
                resp,
                500,
                "Error interno del servidor"
        );
    }
}