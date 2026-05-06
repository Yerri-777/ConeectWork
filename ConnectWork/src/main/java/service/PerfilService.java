package service;

import dao.HabilidadDAO;
import dao.PerfilDAO;
import dao.UsuarioDAO;
import modelo.PerfilCliente;
import modelo.PerfilFreelancer;
import modelo.Usuario;

import java.math.BigDecimal;
import java.sql.SQLException;
import java.util.*;

/**
 * Lógica de negocio para perfiles de cliente y freelancer.
 */
public class PerfilService {

    private final PerfilDAO    perfilDAO;
    private final UsuarioDAO   usuarioDAO;
    private final HabilidadDAO habilidadDAO;

    public PerfilService() {
        this.perfilDAO    = new PerfilDAO();
        this.usuarioDAO   = new UsuarioDAO();
        this.habilidadDAO = new HabilidadDAO();
    }

    // ─── Obtener perfil completo ──────────────────────────────────────────────
    public Map<String, Object> obtenerPerfil(int usuarioId, String rol) throws SQLException {
        Usuario u = usuarioDAO.buscarPorId(usuarioId);
        if (u == null) throw new IllegalArgumentException("Usuario no encontrado");
        u.setPasswordHash(null);

        Map<String, Object> data = new LinkedHashMap<>();
        data.put("usuario", u);

        switch (rol) {
            case "CLIENTE" -> data.put("perfil", perfilDAO.buscarPerfilCliente(usuarioId));
            case "FREELANCER" -> {
                data.put("perfil",     perfilDAO.buscarPerfilFreelancer(usuarioId));
                data.put("habilidades", habilidadDAO.listarPorFreelancer(usuarioId));
            }
        }
        return data;
    }

    // ─── Guardar/actualizar perfil cliente ───────────────────────────────────
    public void guardarPerfilCliente(int usuarioId, Map<String, Object> datos) throws SQLException {
        String descripcion = (String) datos.get("descripcion");
        String sector      = (String) datos.get("sector");

        if (descripcion == null || descripcion.isBlank())
            throw new IllegalArgumentException("El campo 'descripcion' es requerido");
        if (sector == null || sector.isBlank())
            throw new IllegalArgumentException("El campo 'sector' es requerido");

        PerfilCliente pc = new PerfilCliente();
        pc.setUsuarioId(usuarioId);
        pc.setDescripcion(descripcion);
        pc.setSector(sector);
        pc.setSitioWeb((String) datos.get("sitioWeb"));

        boolean existe = perfilDAO.buscarPerfilCliente(usuarioId) != null;
        if (existe) {
            perfilDAO.actualizarPerfilCliente(pc);
        } else {
            perfilDAO.crearPerfilCliente(pc);
            usuarioDAO.marcarPerfilCompleto(usuarioId);
        }
    }

    // ─── Guardar/actualizar perfil freelancer ────────────────────────────────
    public void guardarPerfilFreelancer(int usuarioId, Map<String, Object> datos) throws SQLException {
        String biografia = (String) datos.get("biografia");
        String nivel     = (String) datos.get("nivelExperiencia");
        Object tarifaRaw = datos.get("tarifaHora");
        Object habsRaw   = datos.get("habilidadesIds");

        if (biografia == null || biografia.isBlank())
            throw new IllegalArgumentException("El campo 'biografia' es requerido");
        if (nivel == null)
            throw new IllegalArgumentException("El campo 'nivelExperiencia' es requerido");
        if (!List.of("JUNIOR","SEMI_SENIOR","SENIOR").contains(nivel))
            throw new IllegalArgumentException("nivelExperiencia debe ser JUNIOR, SEMI_SENIOR o SENIOR");
        if (tarifaRaw == null)
            throw new IllegalArgumentException("El campo 'tarifaHora' es requerido");
        if (habsRaw == null)
            throw new IllegalArgumentException("El campo 'habilidadesIds' es requerido");

        List<Integer> habilidadesIds = new ArrayList<>();
        for (Object h : (List<?>) habsRaw) habilidadesIds.add(((Number) h).intValue());
        if (habilidadesIds.isEmpty())
            throw new IllegalArgumentException("Debe seleccionar al menos una habilidad");

        PerfilFreelancer pf = new PerfilFreelancer();
        pf.setUsuarioId(usuarioId);
        pf.setBiografia(biografia);
        pf.setNivelExperiencia(nivel);
        pf.setTarifaHora(new BigDecimal(tarifaRaw.toString()));
        pf.setHabilidadesIds(habilidadesIds);

        boolean existe = perfilDAO.buscarPerfilFreelancer(usuarioId) != null;
        if (existe) {
            perfilDAO.actualizarPerfilFreelancer(pf);
        } else {
            perfilDAO.crearPerfilFreelancer(pf);
            usuarioDAO.marcarPerfilCompleto(usuarioId);
        }
    }
}