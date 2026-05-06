package modelo;

import java.time.LocalDateTime;

public class Entrega {
    private int id;
    private int contratoId;
    private String descripcion;
    private String archivosUrl;
    private String estado; // PENDIENTE | APROBADA | RECHAZADA
    private String motivoRechazo;
    private LocalDateTime createdAt;

    public Entrega() {
    }

    public int getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
    }

    public int getContratoId() {
        return contratoId;
    }

    public void setContratoId(int contratoId) {
        this.contratoId = contratoId;
    }

    public String getDescripcion() {
        return descripcion;
    }

    public void setDescripcion(String descripcion) {
        this.descripcion = descripcion;
    }

    public String getArchivosUrl() {
        return archivosUrl;
    }

    public void setArchivosUrl(String archivosUrl) {
        this.archivosUrl = archivosUrl;
    }

    public String getEstado() {
        return estado;
    }

    public void setEstado(String estado) {
        this.estado = estado;
    }

    public String getMotivoRechazo() {
        return motivoRechazo;
    }

    public void setMotivoRechazo(String motivoRechazo) {
        this.motivoRechazo = motivoRechazo;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}