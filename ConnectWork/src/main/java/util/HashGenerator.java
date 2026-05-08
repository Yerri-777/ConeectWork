package util;

import util.PasswordUtil;
 
public class HashGenerator {
    public static void main(String[] args) {
        // Genera hashes para las 3 credenciales de prueba
        String adminHash = PasswordUtil.encriptar("Admin123!");
        String clienteHash = PasswordUtil.encriptar("Pass1234");
        String freelancerHash = PasswordUtil.encriptar("Pass1234");
        
        System.out.println("=== HASHES GENERADOS ===");
        System.out.println("Admin123!    -> " + adminHash);
        System.out.println("Pass1234     -> " + clienteHash);
        System.out.println("Pass1234     -> " + freelancerHash);
        
        System.out.println("\n=== COPIA ESTOS COMANDOS SQL ===");
        System.out.println("UPDATE usuario SET password_hash = '" + adminHash + "' WHERE username = 'admin';");
        System.out.println("UPDATE usuario SET password_hash = '" + clienteHash + "' WHERE username = 'cliente';");
        System.out.println("UPDATE usuario SET password_hash = '" + freelancerHash + "' WHERE username = 'freelancer';");
    }
}