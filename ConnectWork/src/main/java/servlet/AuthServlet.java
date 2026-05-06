package servlet;

import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.*;
import service.AuthService;
import util.JsonUtil;

import java.io.IOException;
import java.util.Map;

@WebServlet("/api/auth/*")
public class AuthServlet extends HttpServlet {

    private final AuthService AuthService = new AuthService();

    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        String path = req.getPathInfo();
        try {
            switch (path == null ? "" : path) {
                case "/login" -> {
                    Map<?, ?> body = JsonUtil.leerJson(req, Map.class);
                    Map<String, Object> result = AuthService.login(
                            (String) body.get("username"),
                            (String) body.get("password")
                    );
                    if (result == null) JsonUtil.enviarError(resp, 401, "Credenciales incorrectas o cuenta desactivada");
                    else                JsonUtil.enviarJson(resp, 200, result);
                }
                case "/registro" -> {
                    @SuppressWarnings("unchecked")
                    Map<String, Object> body = (Map<String, Object>) JsonUtil.leerJson(req, Map.class);
                    int id = AuthService.registrar(body);
                    JsonUtil.enviarJson(resp, 201, Map.of(
                            "id",      id,
                            "mensaje", "Registro exitoso. Complete su perfil para operar en la plataforma."
                    ));
                }
                default -> JsonUtil.enviarError(resp, 404, "Ruta no encontrada");
            }
        } catch (IllegalArgumentException e) {
            JsonUtil.enviarError(resp, 400, e.getMessage());
        } catch (IllegalStateException e) {
            String msg = e.getMessage();
            int code = msg.contains("DUPLICADO") ? 409 : 400;
            String friendly = msg.replace("USERNAME_DUPLICADO", "El nombre de usuario ya está en uso")
                                 .replace("CORREO_DUPLICADO",   "El correo ya está registrado");
            JsonUtil.enviarError(resp, code, friendly);
        } catch (Exception e) {
            JsonUtil.enviarError(resp, 500, "Error interno: " + e.getMessage());
        }
    }
}