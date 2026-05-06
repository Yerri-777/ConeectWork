package service;

import dao.ContratoDAO;
import dao.PropuestaDAO;
import dao.ProyectoDAO;
import modelo.Proyecto;
import modelo.Propuesta;
import java.math.BigDecimal;
import java.sql.SQLException;
import java.util.List;
import java.util.Map;

public class PropuestaService {

    private final PropuestaDAO propuestaDAO = new PropuestaDAO();
    private final ProyectoDAO proyectoDAO = new ProyectoDAO();
    private final ContratoDAO contratoDAO = new ContratoDAO();

    public int enviar(int freelancerId, Map<String, Object> datos) throws SQLException {
        int pId = ((Number) datos.get("proyectoId")).intValue();
        Proyecto proy = proyectoDAO.buscarPorId(pId);
        if (proy == null) {
            throw new IllegalArgumentException("Proyecto no existe");
        }
        if (!"ABIERTO".equals(proy.getEstado())) {
            throw new IllegalStateException("Proyecto cerrado");
        }
        if (!propuestaDAO.freelancerCumpleHabilidades(freelancerId, pId)) {
            throw new IllegalStateException("No cumples habilidades");
        }

        BigDecimal monto = new BigDecimal(datos.get("montoOfertado").toString());
        if (monto.compareTo(proy.getPresupuestoMax()) > 0) {
            throw new IllegalArgumentException("Supera presupuesto");
        }

        Propuesta p = new Propuesta();
        p.setProyectoId(pId);
        p.setFreelancerId(freelancerId);
        p.setMontoOfertado(monto);
        p.setPlazoDias(((Number) datos.get("plazoDias")).intValue());
        p.setCartaPresentacion((String) datos.get("cartaPresentacion"));
        return propuestaDAO.enviar(p);
    }

    public void retirar(int id, int uid) throws SQLException {
        if (!propuestaDAO.retirar(id, uid)) {
            throw new IllegalStateException("No se puede retirar");
        }
    }
    
    public java.util.List<modelo.Propuesta> listarPorProyectoAdmin(int proyectoId) throws java.sql.SQLException {
        return propuestaDAO.listarPorProyecto(proyectoId);
    }
    
    public Map<String, Object> aceptar(int id, int uid) throws SQLException {
        Propuesta prop = propuestaDAO.buscarPorId(id);
        Proyecto proy = proyectoDAO.buscarPorId(prop.getProyectoId());
        if (proy.getClienteId() != uid) {
            throw new SecurityException("No es tu proyecto");
        }

        int conId = contratoDAO.crear(id, prop.getProyectoId(), uid, prop.getFreelancerId(), prop.getMontoOfertado());
        propuestaDAO.rechazarOtras(prop.getProyectoId(), id);
        return Map.of("contratoId", conId, "mensaje", "Contrato generado");
    }

    public void rechazar(int id, int uid) throws SQLException {
        Propuesta prop = propuestaDAO.buscarPorId(id);
        Proyecto proy = proyectoDAO.buscarPorId(prop.getProyectoId());
        if (proy.getClienteId() != uid) {
            throw new SecurityException("No es tu proyecto");
        }
        propuestaDAO.cambiarEstado(id, "RECHAZADA");
    }

    public List<Propuesta> listarPorProyecto(int pId, int uid) throws SQLException {
        return propuestaDAO.listarPorProyecto(pId);
    }

    public List<Propuesta> listarMias(int uid) throws SQLException {
        return propuestaDAO.listarPorFreelancer(uid);
    }
}
