package util;

import org.mindrot.jbcrypt.BCrypt;

/**
 * Utilidad para hashear y verificar contraseñas usando BCrypt
 * Desarrollado para ConnectWork - CUNOC
 */
public class PasswordUtil {

    /**
     * Hashea una contraseña usando BCrypt
     * @param password Contraseña en texto plano
     * @return Contraseña hasheada
     */
    public static String hashPassword(String password) {
        if (password == null || password.isBlank()) {
            throw new IllegalArgumentException("La contraseña no puede estar vacía");
        }
        return BCrypt.hashpw(password, BCrypt.gensalt(12));
    }

    /**
     * Verifica una contraseña contra un hash
     * @param password Contraseña en texto plano
     * @param hash Hash de la contraseña
     * @return true si coinciden, false si no
     */
    public static boolean checkPassword(String password, String hash) {
        if (password == null || password.isBlank() || hash == null || hash.isBlank()) {
            return false;
        }
        try {
            return BCrypt.checkpw(password, hash);
        } catch (Exception e) {
            System.err.println("[PasswordUtil] Error verificando password: " + e.getMessage());
            return false;
        }
    }

    /**
     * Verifica si una contraseña ya está hasheada
     * @param hash String a verificar
     * @return true si parece ser un hash BCrypt
     */
    public static boolean isHashed(String hash) {
     return hash != null &&
       (
           hash.startsWith("$2a$") ||
           hash.startsWith("$2b$") ||
           hash.startsWith("$2y$")
       );
}
}