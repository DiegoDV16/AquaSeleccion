<?php

/**
 * guardar.php
 * POST /backend/api/entrevistas/guardar.php
 * Guarda consentimiento, transcripcion y documento de una entrevista asignada.
 */

declare(strict_types=1);

require_once __DIR__ . '/../../config/conexion.php';
require_once __DIR__ . '/../../helpers/autorizacion.php';
require_once __DIR__ . '/../../helpers/respuesta.php';

requerirPost();
$sesion = requerirRoles(['evaluador']);
$idEvaluador = (int) ($sesion['id'] ?? 0);
$idSolicitud = filter_var($_POST['idSolicitud'] ?? null, FILTER_VALIDATE_INT);
$transcripcion = trim((string) ($_POST['transcripcion'] ?? ''));
$documento = trim((string) ($_POST['documento'] ?? ''));
$consentimiento = (string) ($_POST['consentimiento'] ?? '0') === '1';
$estado = trim((string) ($_POST['estado'] ?? 'en_curso'));

if ($idSolicitud === false || $idSolicitud < 1) {
    responder(['ok' => false, 'mensaje' => 'Selecciona una solicitud valida.'], 400);
}

if (!in_array($estado, ['en_curso', 'finalizada'], true)) {
    responder(['ok' => false, 'mensaje' => 'El estado de la entrevista no es valido.'], 400);
}

if (mb_strlen($transcripcion, 'UTF-8') > 200000 || mb_strlen($documento, 'UTF-8') > 200000) {
    responder(['ok' => false, 'mensaje' => 'La entrevista supera el tamano maximo permitido.'], 400);
}

try {
    $pdo = obtenerConexion();

    $existe = $pdo->prepare(
        'SELECT idEntrevista
           FROM entrevista_ia
          WHERE idSolicitudEvaluacion = :idSolicitud
            AND idEvaluador = :idEvaluador
          LIMIT 1'
    );
    $existe->execute([
        ':idSolicitud' => $idSolicitud,
        ':idEvaluador' => $idEvaluador,
    ]);

    if (!$existe->fetchColumn()) {
        responder(['ok' => false, 'mensaje' => 'La entrevista no existe o no esta asignada a tu usuario.'], 404);
    }

    $actualizar = $pdo->prepare(
        'UPDATE entrevista_ia
            SET consentimiento = :consentimiento,
                transcripcion = :transcripcion,
                documento = :documento,
                estado = :estado
          WHERE idSolicitudEvaluacion = :idSolicitud
            AND idEvaluador = :idEvaluador'
    );
    $actualizar->execute([
        ':consentimiento' => $consentimiento ? 1 : 0,
        ':transcripcion' => $transcripcion,
        ':documento' => $documento,
        ':estado' => $estado,
        ':idSolicitud' => $idSolicitud,
        ':idEvaluador' => $idEvaluador,
    ]);

    responder([
        'ok' => true,
        'mensaje' => 'Entrevista guardada correctamente.',
        'estado' => $estado,
        'consentimiento' => $consentimiento,
    ]);
} catch (PDOException $e) {
    error_log('Error al guardar entrevista: ' . $e->getMessage());
    responder(['ok' => false, 'mensaje' => 'No fue posible guardar la entrevista.'], 500);
}
