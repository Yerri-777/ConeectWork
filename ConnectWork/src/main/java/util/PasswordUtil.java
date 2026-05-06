package util;

import org.mindrot.jbcrypt.BCrypt;

/**
 * Utilidad centralizada para encriptación de contraseñas con BCrypt. Todos los
 * componentes del backend deben usar esta clase en lugar de llamar a BCrypt
 * directamente.
 */
public class PasswordUtil {

    private static final int ROUNDS = 12;

    private PasswordUtil() {
    }

    /**
     * Genera el hash BCrypt de una contraseña en texto plano.
     *
     * @param plainPassword contraseña sin encriptar
     * @return hash BCrypt listo para almacenar en BD
     */
    public static String encriptar(String plainPassword) {
        return BCrypt.hashpw(plainPassword, BCrypt.gensalt(ROUNDS));
    }

    /**
     * Verifica si una contraseña en texto plano coincide con un hash
     * almacenado.
     *
     * @param plainPassword contraseña ingresada por el usuario
     * @param hash hash almacenado en la base de datos
     * @return true si coinciden
     */
    public static boolean verificar(String plainPassword, String hash) {
        if (plainPassword == null || hash == null) {
            return false;
        }
        try {
            return BCrypt.checkpw(plainPassword, hash);
        } catch (Exception e) {
            return false;
        }
    }
}
