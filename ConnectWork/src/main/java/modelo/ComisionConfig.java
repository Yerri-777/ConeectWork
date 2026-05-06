package modelo;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class ComisionConfig {
    private int id;
    private BigDecimal porcentaje;
    private LocalDateTime fechaInicio;
    private LocalDateTime fechaFin;
    private int adminId;

    public ComisionConfig() {}

    public int getId() { return id; }
    public void setId(int id) { this.id = id; }

    public BigDecimal getPorcentaje() { return porcentaje; }
    public void setPorcentaje(BigDecimal porcentaje) { this.porcentaje = porcentaje; }

    public LocalDateTime getFechaInicio() { return fechaInicio; }
    public void setFechaInicio(LocalDateTime fechaInicio) { this.fechaInicio = fechaInicio; }

    public LocalDateTime getFechaFin() { return fechaFin; }
    public void setFechaFin(LocalDateTime fechaFin) { this.fechaFin = fechaFin; }

    public int getAdminId() { return adminId; }
    public void setAdminId(int adminId) { this.adminId = adminId; }
}