package util;
 
import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
 
import java.nio.charset.StandardCharsets;
import java.security.Key;
import java.util.Date;
 
/**
 * Utilidad para generar y validar JSON Web Tokens.
 * Dependencia necesaria en pom.xml:
 *   io.jsonwebtoken : jjwt-api, jjwt-impl, jjwt-jackson  (versión 0.11.x)
 */
public class JwtUtil {
 
    private static final String SECRET  = "ConnectWork$SecretKey2026!XyZ#98765432100";
    private static final long   EXPIRY  = 1000L * 60 * 60 * 8; // 8 horas
    private static final Key    KEY     = Keys.hmacShaKeyFor(SECRET.getBytes(StandardCharsets.UTF_8));
 
    public static String generarToken(int usuarioId, String username, String rol) {
        return Jwts.builder()
                .setSubject(String.valueOf(usuarioId))
                .claim("username", username)
                .claim("rol", rol)
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + EXPIRY))
                .signWith(KEY, SignatureAlgorithm.HS256)
                .compact();
    }
 
    public static Claims validarToken(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(KEY)
                .build()
                .parseClaimsJws(token)
                .getBody();
    }
 
    /** Extrae el token del header Authorization: Bearer <token> */
    public static String extraerToken(String authHeader) {
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            return authHeader.substring(7);
        }
        return null;
    }
}
 