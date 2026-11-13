<?php

/**
 * generar.php
 * POST /backend/api/entrevistas/generar.php
 * Genera un borrador de documento a partir de la transcripcion guardada.
 */

declare(strict_types=1);

require_once __DIR__ . '/../../config/conexion.php';
require_once __DIR__ . '/../../helpers/autorizacion.php';
require_once __DIR__ . '/../../helpers/ia.php';
require_once __DIR__ . '/../../helpers/respuesta.php';

requerirPost();
$sesion = requerirRoles(['evaluador']);
$idEvaluador = (int) ($sesion['id'] ?? 0);
$idSolicitud = filter_var($_POST['idSolicitud'] ?? null, FILTER_VALIDATE_INT);

if ($idSolicitud === false || $idSolicitud < 1) {
    responder(['ok' => false, 'mensaje' => 'Selecciona una solicitud valida.'], 400);
}

try {
    $pdo = obtenerConexion();

    $consulta = $pdo->prepare(
        'SELECT e.idEntrevista,
                e.transcripcion,
                e.consentimiento,
                TRIM(CONCAT_WS(\' \', c.nombres, c.apellidoPaterno, c.apellidoMaterno)) AS candidato,
                ca.cargo,
                DATE_FORMAT(e.fechaEntrevista, \'%d/%m/%Y\') AS fecha
           FROM entrevista_ia e
           INNER JOIN solicitudevaluacion s ON s.idSolicitudEvaluacion = e.idSolicitudEvaluacion
           INNER JOIN candidato c ON c.idCandidato = e.idCandidato
           INNER JOIN cargo ca ON ca.idCargo = c.idCargo
          WHERE e.idSolicitudEvaluacion = :idSolicitud
            AND e.idEvaluador = :idEvaluador
          LIMIT 1'
    );
    $consulta->execute([
        ':idSolicitud' => $idSolicitud,
        ':idEvaluador' => $idEvaluador,
    ]);
    $entrevista = $consulta->fetch();

    if (!$entrevista) {
        responder(['ok' => false, 'mensaje' => 'La entrevista no existe o no esta asignada a tu usuario.'], 404);
    }

    if ((int) $entrevista['consentimiento'] !== 1) {
        responder(['ok' => false, 'mensaje' => 'Registra el consentimiento del postulante antes de generar el documento.'], 400);
    }

    $transcripcion = trim((string) ($entrevista['transcripcion'] ?? ''));
    if (mb_strlen($transcripcion, 'UTF-8') < 50) {
        responder(['ok' => false, 'mensaje' => 'La transcripcion es demasiado corta para generar un documento.'], 400);
    }

    $documento = generarDocumentoEntrevista($transcripcion, [
        'candidato' => $entrevista['candidato'],
        'cargo' => $entrevista['cargo'],
        'fecha' => $entrevista['fecha'],
    ]);

    $actualizar = $pdo->prepare(
        'UPDATE entrevista_ia
            SET documento = :documento
          WHERE idSolicitudEvaluacion = :idSolicitud
            AND idEvaluador = :idEvaluador'
    );
    $actualizar->execute([
        ':documento' => $documento,
        ':idSolicitud' => $idSolicitud,
        ':idEvaluador' => $idEvaluador,
    ]);

    responder([
        'ok' => true,
        'mensaje' => 'Borrador generado. Revisalo antes de guardarlo como definitivo.',
        'documento' => $documento,
    ]);
} catch (RuntimeException $e) {
    if ($e->getMessage() === 'IA_NO_CONFIGURADA') {
        responder([
            'ok' => false,
            'mensaje' => 'La IA no esta configurada. Configura IA_API_KEY en el servidor para generar el documento.',
        ], 503);
    }

    error_log('Error de IA en entrevista: ' . $e->getMessage());
    responder(['ok' => false, 'mensaje' => 'No fue posible generar el documento con IA.'], 502);
} catch (PDOException $e) {
    error_log('Error al generar entrevista: ' . $e->getMessage());
    responder(['ok' => false, 'mensaje' => 'No fue posible generar el documento.'], 500);
}
