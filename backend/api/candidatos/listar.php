<?php

/**
 * listar.php
 * POST /backend/api/candidatos/listar.php
 * Devuelve los candidatos registrados (externos e internos) con su cargo,
 * familia, ultima solicitud y estado derivado del proceso de evaluacion.
 * Solo accesible con sesion activa de Analista de Reclutamiento.
 */

declare(strict_types=1);

require_once __DIR__ . '/../../config/conexion.php';
require_once __DIR__ . '/../../helpers/autorizacion.php';
require_once __DIR__ . '/../../helpers/mapeos.php';

requerirPost();
requerirRoles(['analista', 'administrador']);

try {
    $pdo = obtenerConexion();

    $sql = 'SELECT c.idCandidato,
                   c.idUsuario,
                   c.idCargo,
                   c.nombres,
                   c.apellidoPaterno,
                   c.apellidoMaterno,
                   c.correo,
                   c.telefono,
                   c.curriculumCv,
                   c.fechaSolicitud,
                   c.observaciones,
                   ca.cargo,
                   ca.idFamiliaCargo,
                   fc.familiaCargo,
                   s.idSolicitudEvaluacion AS idSolicitudReciente,
                   s.estadoSolicitudEvaluacion AS estadoSolicitud,
                   e.estadoEvaluacion AS resultadoEvaluacion
            FROM candidato c
            INNER JOIN cargo ca ON ca.idCargo = c.idCargo
            INNER JOIN familiacargo fc ON fc.idFamiliaCargo = ca.idFamiliaCargo
            LEFT JOIN solicitudevaluacion s ON s.idSolicitudEvaluacion = (
                SELECT MAX(s2.idSolicitudEvaluacion)
                FROM solicitudevaluacion s2
                WHERE s2.idCandidato = c.idCandidato
            )
            LEFT JOIN evaluacion e ON e.idSolicitudEvaluacion = s.idSolicitudEvaluacion
            ORDER BY c.fechaSolicitud DESC, c.idCandidato DESC';

    $filas = $pdo->query($sql)->fetchAll();
    $candidatos = array_map('normalizarCandidato', $filas);

    responder(['ok' => true, 'candidatos' => $candidatos]);
} catch (PDOException $e) {
    error_log('Error al listar candidatos: ' . $e->getMessage());
    responder(['ok' => false, 'mensaje' => 'No fue posible obtener el listado de candidatos.'], 500);
}
