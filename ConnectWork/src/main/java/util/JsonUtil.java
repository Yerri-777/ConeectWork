package util;

import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.BufferedReader;
import java.io.IOException;

public class JsonUtil {

    private static final Gson GSON = new GsonBuilder()
            .serializeNulls()
            .setPrettyPrinting()
            .create();

    public static void enviarJson(HttpServletResponse resp, int status, Object data) throws IOException {
        resp.setStatus(status);
        resp.setContentType("application/json;charset=UTF-8");
        resp.getWriter().print(GSON.toJson(data));
    }

    public static void enviarError(HttpServletResponse resp, int status, String mensaje) throws IOException {
        enviarJson(resp, status, new ErrorResponse(mensaje));
    }

    public static <T> T leerJson(HttpServletRequest req, Class<T> clazz) throws IOException {
        StringBuilder sb = new StringBuilder();
        try (BufferedReader reader = req.getReader()) {
            String line;
            while ((line = reader.readLine()) != null) sb.append(line);
        }
        return GSON.fromJson(sb.toString(), clazz);
    }

    public static Gson getGson() { return GSON; }

    private record ErrorResponse(String error) {}
}