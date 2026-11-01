<?php

/**
 * crear.php
 * POST /backend/api/solicitudes/crear.php
 * Crea una solicitud de evaluacion y asigna un evaluador responsable.
 * Una solicitud nueva queda en estado `pendiente` hasta que el evaluador
 * inicie el proceso. Se evita duplicar solicitudes activas para el mismo
 * candidato.
 */

declare(strict_types=1);

require_once __DIR__ . '/../../config/conexion.php';
require_once __DIR__ . '/../../helpers/autorizacion.php';

requerirPost();
requerirRoles(['analista']);

$idCandidato = filter_var($_POST['idCandidato'] ?? null, FILTER_VALIDATE_INT);
$idEvaluador = filter_var($_POST['idEvaluador'] ?? null, FILTER_VALIDATE_INT);
$prioridad = trim((string) ($_POST['prioridad'] ?? 'normal'));
$observaciones = trim((string) ($_POST['observaciones'] ?? ''));

if ($idCandidato === false || $idCandidato < 1) {
    responder(['ok' => false, 'mensaje' => 'Selecciona el candidato a evaluar.'], 400);
}

if ($idEvaluador === false || $idEvaluador < 1) {
    responder(['ok' => false, 'mensaje' => 'Selecciona el evaluador responsable.'], 400);
}

if ($prioridad === '') {
    $prioridad = 'normal';
}

if (!in_array($prioridad, ['baja', 'normal', 'alta'], true)) {
    responder(['ok' => false, 'mensaje' => 'La prioridad seleccionada no es valida.'], 400);
}

if (mb_strlen($observaciones, 'UTF-8') > 250) {
    responder(['ok' => false, 'mensaje' => 'Las observaciones no pueden superar los 250 caracteres.'], 400);
}

try {
    $pdo = obtenerConexion();
    $pdo->beginTransaction();

    $candidato = $pdo->prepare('SELECT idCandidato FROM candidato WHERE idCandidato = :idCandidato FOR UPDATE');
    $candidato->execute([':idCandidato' => $idCandidato]);

    if (!$candidato->fetchColumn()) {
        $pdo->rollBack();
        responder(['ok' => false, 'mensaje' => 'El candidato indicado no existe.'], 404);
    }

    $evaluador = $pdo->prepare(
        'SELECT idUsuario FROM usuario WHERE idUsuario = :idEvaluador AND idRol = 3 AND estado = 1 LIMIT 1'
    );
    $evaluador->execute([':idEvaluador' => $idEvaluador]);

    if (!$evaluador->fetchColumn()) {
        $pdo->rollBack();
        responder(['ok' => false, 'mensaje' => 'El evaluador seleccionado no existe o no esta activo.'], 400);
    }

    $duplicada = $pdo->prepare(
        "SELECT idSolicitudEvaluacion
           FROM solicitudevaluacion
          WHERE idCandidato = :idCandidato
            AND estadoSolicitudEvaluacion IN ('pendiente', 'en_proceso')
          LIMIT 1
          FOR UPDATE"
    );
    $duplicada->execute([':idCandidato' => $idCandidato]);

    if ($duplicada->fetchColumn()) {
        $pdo->rollBack();
        responder([
            'ok' => false,
            'mensaje' => 'El candidato ya tiene una solicitud de evaluacion pendiente o en proceso.',
        ], 409);
    }

    $consulta = $pdo->prepare(
        "INSERT INTO solicitudevaluacion
            (idUsuario, idCandidato, estadoSolicitudEvaluacion, prioridad, fechaSolicitud, fechaAsignacion, Observaciones)
         VALUES
            (:idEvaluador, :idCandidato, 'pendiente', :prioridad, CURDATE(), CURDATE(), :observaciones)"
    );

    $consulta->execute([
        ':idEvaluador' => $idEvaluador,
        ':idCandidato' => $idCandidato,
        ':prioridad' => $prioridad,
        ':observaciones' => $observaciones,
    ]);

    $idSolicitud = (int) $pdo->lastInsertId();

    if ($idSolicitud <= 0) {
        throw new RuntimeException('La base de datos no devolvio el identificador de la solicitud.');
    }

    $pdo->commit();

    responder([
        'ok' => true,
        'mensaje' => 'Solicitud de evaluacion creada correctamente.',
        'idSolicitud' => $idSolicitud,
    ], 201);
} catch (PDOException $e) {
    if (isset($pdo) && $pdo->inTransaction()) {
        $pdo->rollBack();
    }
    error_log('Error al crear solicitud: ' . $e->getMessage());
    responder(['ok' => false, 'mensaje' => 'No fue posible crear la solicitud de evaluacion.'], 500);
} catch (RuntimeException $e) {
    if (isset($pdo) && $pdo->inTransaction()) {
        $pdo->rollBack();
    }
    error_log('Error al crear solicitud: ' . $e->getMessage());
    responder(['ok' => false, 'mensaje' => 'No fue posible crear la solicitud de evaluacion.'], 500);
}
