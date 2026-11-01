<?php

/**
 * detalle.php
 * POST /backend/api/solicitudes/detalle.php
 * Devuelve una solicitud de evaluacion con su candidato, evaluador y
 * evaluacion asociada. Solo accesible para el Analista de Reclutamiento.
 */

declare(strict_types=1);

require_once __DIR__ . '/../../config/conexion.php';
require_once __DIR__ . '/../../helpers/autorizacion.php';
require_once __DIR__ . '/../../helpers/consulta_solicitudes.php';
require_once __DIR__ . '/../../helpers/mapeos.php';

requerirPost();
requerirRoles(['analista']);

$idSolicitud = filter_var($_POST['idSolicitud'] ?? null, FILTER_VALIDATE_INT);

if ($idSolicitud === false || $idSolicitud < 1) {
    responder(['ok' => false, 'mensaje' => 'La solicitud indicada no es valida.'], 400);
}

try {
    $pdo = obtenerConexion();
    $sql = sqlSolicitudes() . ' WHERE s.idSolicitudEvaluacion = :idSolicitud LIMIT 1';
    $consulta = $pdo->prepare($sql);
    $consulta->execute([':idSolicitud' => $idSolicitud]);
    $fila = $consulta->fetch();

    if (!$fila) {
        responder(['ok' => false, 'mensaje' => 'La solicitud indicada no existe.'], 404);
    }

    responder(['ok' => true, 'solicitud' => normalizarSolicitud($fila)]);
} catch (PDOException $e) {
    error_log('Error al obtener solicitud: ' . $e->getMessage());
    responder(['ok' => false, 'mensaje' => 'No fue posible obtener la solicitud.'], 500);
}
