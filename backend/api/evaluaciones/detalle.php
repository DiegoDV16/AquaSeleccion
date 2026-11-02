<?php

/**
 * detalle.php
 * POST /backend/api/evaluaciones/detalle.php
 * Devuelve una solicitud asignada al evaluador autenticado. Si la solicitud
 * existe pero pertenece a otro evaluador, responde 404 para no filtrar datos.
 */

declare(strict_types=1);

require_once __DIR__ . '/../../config/conexion.php';
require_once __DIR__ . '/../../helpers/autorizacion.php';
require_once __DIR__ . '/../../helpers/consulta_solicitudes.php';
require_once __DIR__ . '/../../helpers/mapeos.php';

requerirPost();
$sesion = requerirRoles(['evaluador']);
$idEvaluador = (int) ($sesion['id'] ?? 0);
$idSolicitud = filter_var($_POST['idSolicitud'] ?? null, FILTER_VALIDATE_INT);

if ($idEvaluador <= 0) {
    responder(['ok' => false, 'mensaje' => 'No se pudo identificar al evaluador de la sesion.'], 401);
}

if ($idSolicitud === false || $idSolicitud < 1) {
    responder(['ok' => false, 'mensaje' => 'La solicitud indicada no es valida.'], 400);
}

try {
    $pdo = obtenerConexion();
    $sql = sqlSolicitudes()
        . ' WHERE s.idSolicitudEvaluacion = :idSolicitud
              AND s.idUsuario = :idEvaluador
            LIMIT 1';

    $consulta = $pdo->prepare($sql);
    $consulta->execute([
        ':idSolicitud' => $idSolicitud,
        ':idEvaluador' => $idEvaluador,
    ]);
    $fila = $consulta->fetch();

    if (!$fila) {
        responder(['ok' => false, 'mensaje' => 'La solicitud no existe o no esta asignada a tu usuario.'], 404);
    }

    responder(['ok' => true, 'solicitud' => normalizarSolicitud($fila)]);
} catch (PDOException $e) {
    error_log('Error al obtener evaluacion del evaluador: ' . $e->getMessage());
    responder(['ok' => false, 'mensaje' => 'No fue posible obtener la solicitud.'], 500);
}
