package modelo;

import java.time.LocalDateTime;

public class SolicitudCategoria {
    private int id;
    private int clienteId;
    private String nombreCliente;
    private String nombre;
    private String descripcion;
    private String estado; // PENDIENTE | ACEPTADA | RECHAZADA
    private Integer adminRevisorId;
    private LocalDateTime createdAt;

    public SolicitudCategoria() {
    }

    public int getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
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