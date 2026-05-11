package util;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import io.jsonwebtoken.security.SignatureException;

import java.nio.charset.StandardCharsets;
import java.security.Key;
import java.util.Date;

public class JwtUtil {

    private static final String SECRET = System.getenv("JWT_SECRET");
    private static final long EXPIRY = 1000L * 60 * 60 * 8; // 8 horas
    private static final Key KEY = Keys.hmacShaKeyFor(SECRET.getBytes(StandardCharsets.UTF_8));

    public static String generarToken(int usuarioId, String username, String rol) {
        try {
            return Jwts.builder()
                    .subject(String.valueOf(usuarioId))
                    .claim("username", username)
                    .claim("rol", rol)
                    .issuedAt(new Date())
                    .expiration(new Date(System.currentTimeMillis() + EXPIRY)) 
                    .signWith(KEY) 
                    .compact();
        } catch (Exception e) {
            System.err.println("Error generando token: " + e.getMessage());
            return null;
        }
    }

    public static Claims validarToken(String token) {
        try {
            return Jwts.parser() 
                    .verifyWith((javax.crypto.SecretKey) KEY) 
                    .build()
                    .parseSignedClaims(token) 
                    .getPayload(); 
        } catch (ExpiredJwtException e) {
            System.err.println("Token expirado");
        } catch (Exception e) {
            System.err.println("Error validando token: " + e.getMessage());
        }
        return null;
    }

public static String extraerToken(String authHeader) {
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            return authHeader.substring(7);
        }
        return null;
    }


    public static boolean esTokenValido(String token) {
        if (token == null || token.isEmpty()) {
            return false;
        }
        return validarToken(token) != null;
    }

    
    public static Integer obtenerIdUsuario(String token) {
        try {
            Claims claims = validarToken(token);
            if (claims != null) {
                return Integer.parseInt(claims.getSubject());
            }
        } catch (Exception e) {
            System.err.println("Error obteniendo ID del token: " + e.getMessage());
        }
        return null;
    }

  
    public static String obtenerUsername(String token) {
        try {
            Claims claims = validarToken(token);
            if (claims != null) {
                return (String) claims.get("username");
            }
        } catch (Exception e) {
            System.err.println("Error obteniendo username del token: " + e.getMessage());
        }
        return null;
    }

    public static String obtenerRol(String token) {
        try {
            Claims claims = validarToken(token);
            if (claims != null) {
                return (String) claims.get("rol");
            }
        } catch (Exception e) {
            System.err.println("Error obteniendo rol del token: " + e.getMessage());
        }
        return null;
    }
}