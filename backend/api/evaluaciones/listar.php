<?php

/**
 * listar.php
 * POST /backend/api/evaluaciones/listar.php
 * Devuelve las solicitudes de evaluacion asignadas al evaluador autenticado.
 * El evaluador solo puede ver sus propias solicitudes; el filtro por usuario
 * se aplica siempre desde la sesion, no desde el cliente.
 */

declare(strict_types=1);

require_once __DIR__ . '/../../config/conexion.php';
require_once __DIR__ . '/../../helpers/autorizacion.php';
require_once __DIR__ . '/../../helpers/consulta_solicitudes.php';
require_once __DIR__ . '/../../helpers/mapeos.php';

requerirPost();
$sesion = requerirRoles(['evaluador']);
$idEvaluador = (int) ($sesion['id'] ?? 0);

if ($idEvaluador <= 0) {
    responder(['ok' => false, 'mensaje' => 'No se pudo identificar al evaluador de la sesion.'], 401);
}

try {
    $pdo = obtenerConexion();
    $sql = sqlSolicitudes()
        . " WHERE s.idUsuario = :idEvaluador
            ORDER BY CASE s.estadoSolicitudEvaluacion
                        WHEN 'pendiente' THEN 1
                        WHEN 'en_proceso' THEN 2
                        ELSE 3
                     END,
                     s.fechaAsignacion DESC,
                     s.idSolicitudEvaluacion DESC";

    $consulta = $pdo->prepare($sql);
    $consulta->execute([':idEvaluador' => $idEvaluador]);
    $solicitudes = array_map('normalizarSolicitud', $consulta->fetchAll());

    responder(['ok' => true, 'solicitudes' => $solicitudes]);
} catch (PDOException $e) {
    error_log('Error al listar evaluaciones del evaluador: ' . $e->getMessage());
    responder(['ok' => false, 'mensaje' => 'No fue posible obtener tus solicitudes asignadas.'], 500);
}
