package config;
 
import jakarta.servlet.*;
import jakarta.servlet.annotation.WebFilter;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import util.JwtUtil;
import io.jsonwebtoken.Claims;
 
import java.io.IOException;
 
/**
 * Filtro que valida JWT en todos los requests excepto /api/auth/*
 * Extrae el token del header Authorization: Bearer <token>
 * Valida el token y setea atributos en el request: userId, username, rol
 */
@WebFilter("/*")
public class AuthFilter implements Filter {
 
    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
            throws IOException, ServletException {
 
        HttpServletRequest req = (HttpServletRequest) request;
        HttpServletResponse resp = (HttpServletResponse) response;
 
        String path = req.getRequestURI();
        
        // Las rutas de autenticación no requieren token
        if (path.startsWith("/connectwork/api/auth/") || 
            path.startsWith("/api/auth/") ||
            path.equals("/connectwork/") || 
            path.equals("/")) {
            chain.doFilter(request, response);
            return;
        }
 
        // Para el resto de rutas: validar token
        String authHeader = req.getHeader("Authorization");
        String token = JwtUtil.extraerToken(authHeader);
 
        if (token == null) {
            resp.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            resp.getWriter().write("{\"error\": \"Token no proporcionado\"}");
            return;
        }
 
        try {
            Claims claims = JwtUtil.validarToken(token);
            
            // Setear atributos en el request para que los servlets puedan usarlos
            req.setAttribute("userId", Integer.parseInt(claims.getSubject()));
            req.setAttribute("username", claims.get("username"));
            req.setAttribute("rol", claims.get("rol"));
            
            chain.doFilter(request, response);
        } catch (Exception e) {
            resp.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            resp.getWriter().write("{\"error\": \"Token inválido o expirado\"}");
        }
    }
}