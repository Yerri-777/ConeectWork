package modelo;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class Propuesta {

    private int id;
    private int proyectoId;
    private String tituloProcyecto;        // enriquecido
    private int freelancerId;
    private String nombreFreelancer;       // enriquecido
    private BigDecimal calificacionFreelancer; // enriquecido
    private BigDecimal montoOfertado;
    private int plazoDias;
    private String cartaPresentacion;
    private String estado;                 // PENDIENTE | ACEPTADA | RECHAZADA | RETIRADA
    private LocalDateTime createdAt;

    public Propuesta() {
    }

    public int getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
    }

    public int getProyectoId() {
        return proyectoId;
    }

    public void setProyectoId(int proyectoId) {
        this.proyectoId = proyectoId;
    }

    public String getTituloProyecto() {
        return tituloProcyecto;
    }

    public void setTituloProyecto(String tituloProyecto) {
        this.tituloProcyecto = tituloProyecto;
    }

    public int getFreelancerId() {
        return freelancerId;
    }

    public void setFreelancerId(int freelancerId) {
        this.freelancerId = freelancerId;
    }

    public String getNombreFreelancer() {
        return nombreFreelancer;
    }

    public void setNombreFreelancer(String nombreFreelancer) {
        this.nombreFreelancer = nombreFreelancer;
    }

    public BigDecimal getCalificacionFreelancer() {
        return calificacionFreelancer;
    }

    public void setCalificacionFreelancer(BigDecimal calificacionFreelancer) {
        this.calificacionFreelancer = calificacionFreelancer;
    }

    public BigDecimal getMontoOfertado() {
        return montoOfertado;
    }

    public void setMontoOfertado(BigDecimal montoOfertado) {
        this.montoOfertado = montoOfertado;
    }

    public int getPlazoDias() {
        return plazoDias;
    }

    public void setPlazoDias(int plazoDias) {
        this.plazoDias = plazoDias;
    }

    public String getCartaPresentacion() {
        return cartaPresentacion;
    }

    public void setCartaPresentacion(String cartaPresentacion) {
        this.cartaPresentacion = cartaPresentacion;
    }

    public String getEstado() {
        return estado;
    }

    public void setEstado(String estado) {
        this.estado = estado;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
