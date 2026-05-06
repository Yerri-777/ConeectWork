package modelo;

import java.time.LocalDateTime;

public class SolicitudHabilidad {
    private int id;
    private int freelancerId;
    private String nombreFreelancer;
    private String nombre;
    private String descripcion;
    private String estado; // PENDIENTE | ACEPTADA | RECHAZADA
    private Integer adminRevisorId;
    private LocalDateTime createdAt;

    public SolicitudHabilidad() {
    }

    public int getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
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

    public String getNombre() {
        return nombre;
    }

    public void setNombre(String nombre) {
        this.nombre = nombre;
    }

    public String getDescripcion() {
        return descripcion;
    }

    public void setDescripcion(String descripcion) {
        this.descripcion = descripcion;
    }

    public String getEstado() {
        return estado;
    }

    public void setEstado(String estado) {
        this.estado = estado;
    }

    public Integer getAdminRevisorId() {
        return adminRevisorId;
    }

    public void setAdminRevisorId(Integer adminRevisorId) {
        this.adminRevisorId = adminRevisorId;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}