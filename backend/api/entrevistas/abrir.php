<?php

/**
 * abrir.php
 * POST /backend/api/entrevistas/abrir.php
 * Abre o recupera la entrevista asistida de una solicitud asignada al evaluador.
 */

declare(strict_types=1);

require_once __DIR__ . '/../../config/conexion.php';
require_once __DIR__ . '/../../helpers/autorizacion.php';
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

    $solicitud = $pdo->prepare(
        'SELECT s.idSolicitudEvaluacion,
                s.idCandidato,
                s.estadoSolicitudEvaluacion,
                TRIM(CONCAT_WS(\' \', c.nombres, c.apellidoPaterno, c.apellidoMaterno)) AS candidato,
                ca.cargo
           FROM solicitudevaluacion s
           INNER JOIN candidato c ON c.idCandidato = s.idCandidato
           INNER JOIN cargo ca ON ca.idCargo = c.idCargo
          WHERE s.idSolicitudEvaluacion = :idSolicitud
            AND s.idUsuario = :idEvaluador
          LIMIT 1'
    );
    $solicitud->execute([
        ':idSolicitud' => $idSolicitud,
        ':idEvaluador' => $idEvaluador,
    ]);
    $fila = $solicitud->fetch();

    if (!$fila) {
        responder(['ok' => false, 'mensaje' => 'La solicitud no existe o no esta asignada a tu usuario.'], 404);
    }

    $existente = $pdo->prepare(
        'SELECT idEntrevista, consentimiento, transcripcion, documento, estado
           FROM entrevista_ia
          WHERE idSolicitudEvaluacion = :idSolicitud
          LIMIT 1'
    );
    $existente->execute([':idSolicitud' => $idSolicitud]);
    $entrevista = $existente->fetch();

    if (!$entrevista) {
        $insertar = $pdo->prepare(
            'INSERT INTO entrevista_ia
                (idSolicitudEvaluacion, idCandidato, idEvaluador, estado)
             VALUES
                (:idSolicitud, :idCandidato, :idEvaluador, \'en_curso\')'
        );
        $insertar->execute([
            ':idSolicitud' => $idSolicitud,
            ':idCandidato' => (int) $fila['idCandidato'],
            ':idEvaluador' => $idEvaluador,
        ]);

        $entrevista = [
            'idEntrevista' => (int) $pdo->lastInsertId(),
            'consentimiento' => 0,
            'transcripcion' => '',
            'documento' => '',
            'estado' => 'en_curso',
        ];
    }

    responder([
        'ok' => true,
        'entrevista' => [
            'idEntrevista' => (int) $entrevista['idEntrevista'],
            'consentimiento' => (int) $entrevista['consentimiento'] === 1,
            'transcripcion' => (string) ($entrevista['transcripcion'] ?? ''),
            'documento' => (string) ($entrevista['documento'] ?? ''),
            'estado' => (string) $entrevista['estado'],
        ],
        'solicitud' => [
            'idSolicitud' => (int) $fila['idSolicitudEvaluacion'],
            'idCandidato' => (int) $fila['idCandidato'],
            'candidato' => (string) $fila['candidato'],
            'cargo' => (string) $fila['cargo'],
            'estado' => (string) $fila['estadoSolicitudEvaluacion'],
        ],
    ]);
} catch (PDOException $e) {
    error_log('Error al abrir entrevista: ' . $e->getMessage());
    responder(['ok' => false, 'mensaje' => 'No fue posible abrir la entrevista.'], 500);
}
