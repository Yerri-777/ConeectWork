package modelo;

import java.math.BigDecimal;
import java.util.List;

public class PerfilFreelancer {

    private int id;
    private int usuarioId;
    private String biografia;
    private String nivelExperiencia;  // JUNIOR | SEMI_SENIOR | SENIOR
    private BigDecimal tarifaHora;
    private BigDecimal calificacionPromedio;
    private int totalCalificaciones;
    private List<Integer> habilidadesIds;  // para insert/update

    public PerfilFreelancer() {
    }

    public int getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
    }

    public int getUsuarioId() {
        return usuarioId;
    }

    public void setUsuarioId(int usuarioId) {
        this.usuarioId = usuarioId;
    }

    public String getBiografia() {
        return biografia;
    }

    public void setBiografia(String biografia) {
        this.biografia = biografia;
    }

    public String getNivelExperiencia() {
        return nivelExperiencia;
    }

    public void setNivelExperiencia(String nivelExperiencia) {
        this.nivelExperiencia = nivelExperiencia;
    }

    public BigDecimal getTarifaHora() {
        return tarifaHora;
    }

    public void setTarifaHora(BigDecimal tarifaHora) {
        this.tarifaHora = tarifaHora;
    }

    public BigDecimal getCalificacionPromedio() {
        return calificacionPromedio;
    }

    public void setCalificacionPromedio(BigDecimal calificacionPromedio) {
        this.calificacionPromedio = calificacionPromedio;
    }

    public int getTotalCalificaciones() {
        return totalCalificaciones;
    }

    public void setTotalCalificaciones(int totalCalificaciones) {
        this.totalCalificaciones = totalCalificaciones;
    }

    public List<Integer> getHabilidadesIds() {
        return habilidadesIds;
    }

    public void setHabilidadesIds(List<Integer> habilidadesIds) {
        this.habilidadesIds = habilidadesIds;
    }
}
