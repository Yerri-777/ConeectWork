package util;

import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import java.io.BufferedReader;
import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

/**
 * Utilidad para manejo de JSON en requests/responses
 */
public class JsonUtil {

    private static final Gson GSON = new GsonBuilder()
            .serializeNulls()
            .setPrettyPrinting()
            .create();

    /**
     * Envía un objeto como JSON en la respuesta
     */
    public static void enviarJson(HttpServletResponse resp, int status, Object data) throws IOException {
        resp.setStatus(status);
        resp.setContentType("application/json;charset=UTF-8");
        resp.getWriter().print(GSON.toJson(data));
        resp.getWriter().flush();
    }

    /**
     * Envía un error como JSON
     */
    public static void enviarError(HttpServletResponse resp, int status, String mensaje) throws IOException {
        resp.setStatus(status);
        resp.setContentType("application/json;charset=UTF-8");
        
        Map<String, Object> error = new HashMap<>();
        error.put("error", true);
        error.put("status", status);
        error.put("mensaje", mensaje);
        
        resp.getWriter().print(GSON.toJson(error));
        resp.getWriter().flush();
    }

    /**
     * Lee un JSON del request y lo convierte al tipo especificado
     */
    public static <T> T leerJson(HttpServletRequest req, Class<T> clazz) throws IOException {
        StringBuilder sb = new StringBuilder();
        try (BufferedReader reader = req.getReader()) {
            String line;
            while ((line = reader.readLine()) != null) {
                sb.append(line);
            }
        }
        
        String json = sb.toString();
        if (json.isEmpty()) {
            return null;
        }
        
        return GSON.fromJson(json, clazz);
    }

    /**
     * Obtiene la instancia de Gson
     */
    public static Gson getGson() {
        return GSON;
    }

    /**
     * Convierte un objeto a JSON string
     */
    public static String toJson(Object obj) {
        return GSON.toJson(obj);
    }

    /**
     * Convierte un JSON string a un objeto
     */
    public static <T> T fromJson(String json, Class<T> clazz) {
        return GSON.fromJson(json, clazz);
    }
}