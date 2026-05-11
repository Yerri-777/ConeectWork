package dao;

import config.ConexionBD;
import modelo.Proyecto;

import java.math.BigDecimal;
import java.sql.*;
import java.util.ArrayList;
import java.util.List;

public class ProyectoDAO {

    // ═══════════════════════════════════════════════════════════════
    // CREAR PROYECTO
    // ═══════════════════════════════════════════════════════════════

    public int crear(Proyecto p) throws SQLException {

        String sql = """
            INSERT INTO proyecto
            (
                cliente_id,
                categoria_id,
                titulo,
                descripcion,
                presupuesto_max,
                fecha_limite
            )
            VALUES (?,?,?,?,?,?)
            """;

        try (Connection cn = ConexionBD.getConnection()) {

            cn.setAutoCommit(false);

            try {

                int proyectoId;

                try (
                        PreparedStatement ps = cn.prepareStatement(
                                sql,
                                Statement.RETURN_GENERATED_KEYS
                        )
                ) {

                    ps.setInt(1, p.getClienteId());
                    ps.setInt(2, p.getCategoriaId());
                    ps.setString(3, p.getTitulo());
                    ps.setString(4, p.getDescripcion());
                    ps.setBigDecimal(5, p.getPresupuestoMax());
                    ps.setDate(6, Date.valueOf(p.getFechaLimite()));

                    ps.executeUpdate();

                    try (ResultSet rs = ps.getGeneratedKeys()) {

                        if (!rs.next()) {
                            throw new SQLException("No se pudo crear el proyecto");
                        }

                        proyectoId = rs.getInt(1);
                    }
                }

                insertarHabilidades(
                        cn,
                        proyectoId,
                        p.getHabilidadesIds()
                );

                cn.commit();

                return proyectoId;

            } catch (SQLException e) {

                cn.rollback();
                throw e;
            }
        }
    }

    // ═══════════════════════════════════════════════════════════════
    // ACTUALIZAR
    // ═══════════════════════════════════════════════════════════════

    public boolean actualizar(Proyecto p) throws SQLException {

        String sql = """
            UPDATE proyecto
               SET categoria_id = ?,
                   titulo = ?,
                   descripcion = ?,
                   presupuesto_max = ?,
                   fecha_limite = ?
             WHERE id = ?
               AND cliente_id = ?
               AND estado = 'ABIERTO'
            """;

        try (Connection cn = ConexionBD.getConnection()) {

            cn.setAutoCommit(false);

            try {

                // actualizar proyecto
                try (PreparedStatement ps = cn.prepareStatement(sql)) {

                    ps.setInt(1, p.getCategoriaId());
                    ps.setString(2, p.getTitulo());
                    ps.setString(3, p.getDescripcion());
                    ps.setBigDecimal(4, p.getPresupuestoMax());
                    ps.setDate(5, Date.valueOf(p.getFechaLimite()));
                    ps.setInt(6, p.getId());
                    ps.setInt(7, p.getClienteId());

                    if (ps.executeUpdate() == 0) {

                        cn.rollback();
                        return false;
                    }
                }

                // eliminar habilidades anteriores
                try (
                        PreparedStatement ps = cn.prepareStatement(
                                "DELETE FROM proyecto_habilidad WHERE proyecto_id = ?"
                        )
                ) {

                    ps.setInt(1, p.getId());
                    ps.executeUpdate();
                }

                // insertar nuevas habilidades
                insertarHabilidades(
                        cn,
                        p.getId(),
                        p.getHabilidadesIds()
                );

                cn.commit();

                return true;

            } catch (SQLException e) {

                cn.rollback();
                throw e;
            }
        }
    }

    // ═══════════════════════════════════════════════════════════════
    // CAMBIAR ESTADO
    // ═══════════════════════════════════════════════════════════════

    public boolean cambiarEstado(int id, String estado) throws SQLException {

        String sql = """
            UPDATE proyecto
               SET estado = ?
             WHERE id = ?
            """;

        try (
                Connection cn = ConexionBD.getConnection();
                PreparedStatement ps = cn.prepareStatement(sql)
        ) {

            ps.setString(1, estado);
            ps.setInt(2, id);

            return ps.executeUpdate() > 0;
        }
    }

    // ═══════════════════════════════════════════════════════════════
    // BUSCAR POR ID
    // ═══════════════════════════════════════════════════════════════

    public Proyecto buscarPorId(int id) throws SQLException {

        String sql = """
            SELECT p.*,
                   u.nombre_completo AS nombre_cliente,
                   c.nombre AS nombre_categoria
              FROM proyecto p
              JOIN usuario u
                ON u.id = p.cliente_id
              JOIN categoria c
                ON c.id = p.categoria_id
             WHERE p.id = ?
            """;

        try (
                Connection cn = ConexionBD.getConnection();
                PreparedStatement ps = cn.prepareStatement(sql)
        ) {

            ps.setInt(1, id);

            try (ResultSet rs = ps.executeQuery()) {

                if (rs.next()) {
                    return mapear(rs);
                }
            }
        }

        return null;
    }

    // ═══════════════════════════════════════════════════════════════
    // LISTAR POR CLIENTE
    // ═══════════════════════════════════════════════════════════════

    public List<Proyecto> listarPorCliente(int clienteId) throws SQLException {

        String sql = """
            SELECT p.*,
                   u.nombre_completo AS nombre_cliente,
                   c.nombre AS nombre_categoria
              FROM proyecto p
              JOIN usuario u
                ON u.id = p.cliente_id
              JOIN categoria c
                ON c.id = p.categoria_id
             WHERE p.cliente_id = ?
             ORDER BY p.created_at DESC
            """;

        return ejecutarLista(sql, clienteId);
    }

    // ═══════════════════════════════════════════════════════════════
    // LISTAR ABIERTOS
    // ═══════════════════════════════════════════════════════════════

    public List<Proyecto> listarAbiertos(
        Integer categoriaId,
        Integer habilidadId,
        BigDecimal presMin,
        BigDecimal presMax
) throws SQLException {

    StringBuilder sql = new StringBuilder("""
        SELECT DISTINCT
               p.*,
               u.nombre_completo AS nombre_cliente,
               c.nombre          AS nombre_categoria
          FROM proyecto p
          JOIN usuario u
            ON u.id = p.cliente_id
          JOIN categoria c
            ON c.id = p.categoria_id
         WHERE p.estado = 'ABIERTO'
        """);

    List<Object> params = new ArrayList<>();

    if (categoriaId != null) {
        sql.append(" AND p.categoria_id = ?");
        params.add(categoriaId);
    }

    if (habilidadId != null) {

        sql.append("""
            AND EXISTS (
                SELECT 1
                  FROM proyecto_habilidad ph
                 WHERE ph.proyecto_id = p.id
                   AND ph.habilidad_id = ?
            )
        """);

        params.add(habilidadId);
    }

    if (presMin != null) {
        sql.append(" AND p.presupuesto_max >= ?");
        params.add(presMin);
    }

    if (presMax != null) {
        sql.append(" AND p.presupuesto_max <= ?");
        params.add(presMax);
    }

    sql.append(" ORDER BY p.created_at DESC");

    List<Proyecto> lista = new ArrayList<>();

    try (
            Connection cn = ConexionBD.getConnection();
            PreparedStatement ps = cn.prepareStatement(sql.toString())
    ) {

        for (int i = 0; i < params.size(); i++) {
            ps.setObject(i + 1, params.get(i));
        }

        try (ResultSet rs = ps.executeQuery()) {

            while (rs.next()) {

                Proyecto p = mapear(rs);

                p.setHabilidadesIds(
                        obtenerHabilidadesIds(cn, p.getId())
                );

                lista.add(p);
            }
        }
    }

    return lista;
}

    // ═══════════════════════════════════════════════════════════════
    // INSERTAR HABILIDADES
    // ═══════════════════════════════════════════════════════════════

    private void insertarHabilidades(
            Connection cn,
            int proyectoId,
            List<Integer> habilidadesIds
    ) throws SQLException {

        if (habilidadesIds == null || habilidadesIds.isEmpty()) {
            return;
        }

        String sql = """
            INSERT INTO proyecto_habilidad
            (proyecto_id, habilidad_id)
            VALUES (?,?)
            """;

        try (PreparedStatement ps = cn.prepareStatement(sql)) {

            for (Integer habilidadId : habilidadesIds) {

                ps.setInt(1, proyectoId);
                ps.setInt(2, habilidadId);

                ps.addBatch();
            }

            ps.executeBatch();
        }
    }

    // ═══════════════════════════════════════════════════════════════
    // OBTENER HABILIDADES
    // ═══════════════════════════════════════════════════════════════

    private List<Integer> obtenerHabilidadesIds(int proyectoId)
            throws SQLException {

        List<Integer> ids = new ArrayList<>();

        String sql = """
            SELECT habilidad_id
              FROM proyecto_habilidad
             WHERE proyecto_id = ?
            """;

        try (
                Connection cn = ConexionBD.getConnection();
                PreparedStatement ps = cn.prepareStatement(sql)
        ) {

            ps.setInt(1, proyectoId);

            try (ResultSet rs = ps.executeQuery()) {

                while (rs.next()) {
                    ids.add(rs.getInt("habilidad_id"));
                }
            }
        }

        return ids;
    }


private List<Integer> obtenerHabilidadesIds(
        Connection cn,
        int proyectoId
) throws SQLException {

    List<Integer> ids = new ArrayList<>();

    String sql = """
        SELECT habilidad_id
          FROM proyecto_habilidad
         WHERE proyecto_id = ?
        """;

    try (PreparedStatement ps = cn.prepareStatement(sql)) {

        ps.setInt(1, proyectoId);

        try (ResultSet rs = ps.executeQuery()) {

            while (rs.next()) {
                ids.add(rs.getInt("habilidad_id"));
            }
        }
    }

    return ids;
}


    // ═══════════════════════════════════════════════════════════════
    // EJECUTAR LISTA
    // ═══════════════════════════════════════════════════════════════

    private List<Proyecto> ejecutarLista(String sql, int param)
            throws SQLException {

        List<Proyecto> lista = new ArrayList<>();

        try (
                Connection cn = ConexionBD.getConnection();
                PreparedStatement ps = cn.prepareStatement(sql)
        ) {

            ps.setInt(1, param);

            try (ResultSet rs = ps.executeQuery()) {

                while (rs.next()) {
                    lista.add(mapear(rs));
                }
            }
        }

        return lista;
    }

    // ═══════════════════════════════════════════════════════════════
    // MAPEAR
    // ═══════════════════════════════════════════════════════════════

    private Proyecto mapear(ResultSet rs) throws SQLException {

        Proyecto p = new Proyecto();

        p.setId(rs.getInt("id"));

        p.setClienteId(rs.getInt("cliente_id"));
        p.setNombreCliente(rs.getString("nombre_cliente"));

        p.setCategoriaId(rs.getInt("categoria_id"));
        p.setNombreCategoria(rs.getString("nombre_categoria"));

        p.setTitulo(rs.getString("titulo"));
        p.setDescripcion(rs.getString("descripcion"));

        p.setPresupuestoMax(
                rs.getBigDecimal("presupuesto_max")
        );

        p.setFechaLimite(
                rs.getDate("fecha_limite").toLocalDate()
        );

        p.setEstado(rs.getString("estado"));

        p.setCreatedAt(
                rs.getTimestamp("created_at").toLocalDateTime()
        );

        // cargar habilidades
        p.setHabilidadesIds(
                obtenerHabilidadesIds(p.getId())
        );

        return p;
    }
}