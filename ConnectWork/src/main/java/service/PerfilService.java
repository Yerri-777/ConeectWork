package service;

import dao.HabilidadDAO;
import dao.PerfilDAO;
import dao.UsuarioDAO;
import modelo.PerfilCliente;
import modelo.PerfilFreelancer;
import modelo.Usuario;

import java.math.BigDecimal;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 * Servicio de lógica de negocio para perfiles.
 * ConnectWork - CUNOC
 */
public class PerfilService {

    private final PerfilDAO perfilDAO;
    private final UsuarioDAO usuarioDAO;
    private final HabilidadDAO habilidadDAO;

    public PerfilService() {

        this.perfilDAO = new PerfilDAO();
        this.usuarioDAO = new UsuarioDAO();
        this.habilidadDAO = new HabilidadDAO();
    }

    // ─────────────────────────────────────────────────────────
    // OBTENER PERFIL COMPLETO
    // ─────────────────────────────────────────────────────────
    public Map<String, Object> obtenerPerfil(int usuarioId, String rol)
            throws SQLException {

        Usuario usuario = usuarioDAO.buscarPorId(usuarioId);
 
        if (usuario == null) {
            throw new IllegalArgumentException("Usuario no encontrado");
        }

        // Seguridad
        usuario.setPasswordHash(null);

        Map<String, Object> data = new LinkedHashMap<>();

        data.put("usuario", usuario);

        switch (rol) {

            case "CLIENTE" -> {

                PerfilCliente perfil =
                        perfilDAO.buscarPerfilCliente(usuarioId);

                data.put("perfil", perfil);
            }

            case "FREELANCER" -> {

                PerfilFreelancer perfil =
                        perfilDAO.buscarPerfilFreelancer(usuarioId);

                data.put("perfil", perfil);

                data.put(
                        "habilidades",
                        habilidadDAO.listarPorFreelancer(usuarioId)
                );
            }

            default ->
                throw new IllegalArgumentException("Rol inválido");
        }

        return data;
    }

    // ─────────────────────────────────────────────────────────
    // GUARDAR PERFIL CLIENTE
    // ─────────────────────────────────────────────────────────
    public void guardarPerfilCliente(
            int usuarioId,
            Map<String, Object> datos
    ) throws SQLException {

        String descripcion = obtenerTexto(datos, "descripcion");
        String sector = obtenerTexto(datos, "sector");

        PerfilCliente perfil = new PerfilCliente();

        perfil.setUsuarioId(usuarioId);
        perfil.setDescripcion(descripcion);
        perfil.setSector(sector);
        perfil.setSitioWeb(
                datos.get("sitioWeb") != null
                        ? datos.get("sitioWeb").toString()
                        : null
        );

        boolean existe =
                perfilDAO.buscarPerfilCliente(usuarioId) != null;

        if (existe) {

            perfilDAO.actualizarPerfilCliente(perfil);

            System.out.println(
                    "[PerfilService] ✓ Perfil cliente actualizado"
            );

        } else {

            perfilDAO.crearPerfilCliente(perfil);

            usuarioDAO.marcarPerfilCompleto(usuarioId);

            System.out.println(
                    "[PerfilService] ✓ Perfil cliente creado"
            );
        }
    }

    // ─────────────────────────────────────────────────────────
    // GUARDAR PERFIL FREELANCER
    // ─────────────────────────────────────────────────────────
    public void guardarPerfilFreelancer(
            int usuarioId,
            Map<String, Object> datos
    ) throws SQLException {

        String biografia = obtenerTexto(datos, "biografia");

        String nivel =
                obtenerTexto(datos, "nivelExperiencia")
                        .toUpperCase();

        Object tarifaObj = datos.get("tarifaHora");

        Object habilidadesObj = datos.get("habilidadesIds");

        if (!List.of("JUNIOR", "SEMI_SENIOR", "SENIOR")
                .contains(nivel)) {

            throw new IllegalArgumentException(
                    "nivelExperiencia inválido"
            );
        }

        if (tarifaObj == null) {
            throw new IllegalArgumentException(
                    "tarifaHora es requerida"
            );
        }

        if (habilidadesObj == null) {
            throw new IllegalArgumentException(
                    "habilidadesIds es requerido"
            );
        }

        BigDecimal tarifa;

        try {

            tarifa = new BigDecimal(tarifaObj.toString());

        } catch (Exception e) {

            throw new IllegalArgumentException(
                    "tarifaHora inválida"
            );
        }

        if (tarifa.compareTo(BigDecimal.ZERO) <= 0) {

            throw new IllegalArgumentException(
                    "La tarifa debe ser mayor a cero"
            );
        }

        List<Integer> habilidadesIds = new ArrayList<>();

        try {

            for (Object obj : (List<?>) habilidadesObj) {

                int id = ((Number) obj).intValue();

                habilidadesIds.add(id);
            }

        } catch (Exception e) {

            throw new IllegalArgumentException(
                    "habilidadesIds inválido"
            );
        }

        if (habilidadesIds.isEmpty()) {

            throw new IllegalArgumentException(
                    "Debe seleccionar al menos una habilidad"
            );
        }

        PerfilFreelancer perfil = new PerfilFreelancer();

        perfil.setUsuarioId(usuarioId);
        perfil.setBiografia(biografia);
        perfil.setNivelExperiencia(nivel);
        perfil.setTarifaHora(tarifa);
        perfil.setHabilidadesIds(habilidadesIds);

        boolean existe =
                perfilDAO.buscarPerfilFreelancer(usuarioId) != null;

        if (existe) {

            perfilDAO.actualizarPerfilFreelancer(perfil);

            System.out.println(
                    "[PerfilService] ✓ Perfil freelancer actualizado"
            );

        } else {

            perfilDAO.crearPerfilFreelancer(perfil);

            usuarioDAO.marcarPerfilCompleto(usuarioId);

            System.out.println(
                    "[PerfilService] Perfil freelancer creado"
            );
        }
    }

    // ─────────────────────────────────────────────────────────
    // HELPERS PRIVADOS
    // ─────────────────────────────────────────────────────────
    private String obtenerTexto(
            Map<String, Object> datos,
            String campo
    ) {

        Object value = datos.get(campo);

        if (value == null || value.toString().isBlank()) {

            throw new IllegalArgumentException(
                    "El campo '" + campo + "' es requerido"
            );
        }

        return value.toString().trim();
    }
}