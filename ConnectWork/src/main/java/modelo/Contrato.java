package modelo;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class Contrato {

    private int id;
    private int propuestaId;
    private int proyectoId;
    private String tituloProyecto;
    private int clienteId;
    private String nombreCliente;
    private int freelancerId;
    private String nombreFreelancer;
    private BigDecimal monto;
    private BigDecimal comisionPct;
    private BigDecimal comisionMonto;
    private String estado;                // ACTIVO | COMPLETADO | CANCELADO
    private String motivoCancelacion;
    private LocalDateTime createdAt;
    private LocalDateTime fechaCompletado;

    public Contrato() {
    }

    public int getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
    }

    public int getPropuestaId() {
        return propuestaId;
    }

    public void setPropuestaId(int propuestaId) {
        this.propuestaId = propuestaId;
    }

    public int getProyectoId() {
        return proyectoId;
    }

    public void setProyectoId(int proyectoId) {
        this.proyectoId = proyectoId;
    }

    public String getTituloProyecto() {
        return tituloProyecto;
    }

    public void setTituloProyecto(String tituloProyecto) {
        this.tituloProyecto = tituloProyecto;
    }

    public int getClienteId() {
        return clienteId;
    }

    public void setClienteId(int clienteId) {
        this.clienteId = clienteId;
    }

    public String getNombreCliente() {
        return nombreCliente;
    }

    public void setNombreCliente(String nombreCliente) {
        this.nombreCliente = nombreCliente;
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

    public BigDecimal getMonto() {
        return monto;
    }

    public void setMonto(BigDecimal monto) {
        this.monto = monto;
    }

    public BigDecimal getComisionPct() {
        return comisionPct;
    }

    public void setComisionPct(BigDecimal comisionPct) {
        this.comisionPct = comisionPct;
    }

    public BigDecimal getComisionMonto() {
        return comisionMonto;
    }

    public void setComisionMonto(BigDecimal comisionMonto) {
        this.comisionMonto = comisionMonto;
    }

    public String getEstado() {
        return estado;
    }

    public void setEstado(String estado) {
        this.estado = estado;
    }

    public String getMotivoCancelacion() {
        return motivoCancelacion;
    }

    public void setMotivoCancelacion(String motivoCancelacion) {
        this.motivoCancelacion = motivoCancelacion;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getFechaCompletado() {
        return fechaCompletado;
    }

    public void setFechaCompletado(LocalDateTime fechaCompletado) {
        this.fechaCompletado = fechaCompletado;
    }
}
