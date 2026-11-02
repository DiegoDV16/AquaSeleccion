<?php

/**
 * guardar.php
 * POST /backend/api/evaluaciones/guardar.php
 * Guarda el borrador o finaliza la evaluacion de una solicitud asignada al
 * evaluador autenticado. Actualiza la evaluacion y el estado de la solicitud
 * dentro de una misma transaccion.
 */

declare(strict_types=1);

require_once __DIR__ . '/../../config/conexion.php';
require_once __DIR__ . '/../../helpers/autorizacion.php';
require_once __DIR__ . '/../../helpers/historial.php';

requerirPost();
$sesion = requerirRoles(['evaluador']);
$idEvaluador = (int) ($sesion['id'] ?? 0);

if ($idEvaluador <= 0) {
    responder(['ok' => false, 'mensaje' => 'No se pudo identificar al evaluador de la sesion.'], 401);
}

$idSolicitud = filter_var($_POST['idSolicitud'] ?? null, FILTER_VALIDATE_INT);
$accion = trim((string) ($_POST['accion'] ?? 'borrador'));
$resultado = trim((string) ($_POST['resultado'] ?? ''));
$observaciones = trim((string) ($_POST['observaciones'] ?? ''));
$cargoActual = trim((string) ($_POST['cargoActual'] ?? ''));
$comentarioEntrevista = trim((string) ($_POST['comentarioEntrevista'] ?? ''));
$resultadosValidos = ['apto', 'no_apto', 'con_observaciones'];

if ($idSolicitud === false || $idSolicitud < 1) {
    responder(['ok' => false, 'mensaje' => 'La solicitud indicada no es valida.'], 400);
}

if (!in_array($accion, ['borrador', 'finalizar'], true)) {
    responder(['ok' => false, 'mensaje' => 'La accion indicada no es valida.'], 400);
}

if ($resultado !== '' && !in_array($resultado, $resultadosValidos, true)) {
    responder(['ok' => false, 'mensaje' => 'El resultado seleccionado no es valido.'], 400);
}

if (mb_strlen($observaciones, 'UTF-8') > 250) {
    responder(['ok' => false, 'mensaje' => 'Las observaciones no pueden superar los 250 caracteres.'], 400);
}

if (mb_strlen($cargoActual, 'UTF-8') > 100) {
    responder(['ok' => false, 'mensaje' => 'El cargo actual no puede superar los 100 caracteres.'], 400);
}

if (mb_strlen($comentarioEntrevista, 'UTF-8') > 250) {
    responder(['ok' => false, 'mensaje' => 'El comentario de entrevista no puede superar los 250 caracteres.'], 400);
}

if ($accion === 'finalizar') {
    if (!in_array($resultado, $resultadosValidos, true)) {
        responder(['ok' => false, 'mensaje' => 'Selecciona el resultado de la evaluacion.'], 400);
    }

    if (mb_strlen($observaciones, 'UTF-8') < 20) {
        responder(['ok' => false, 'mensaje' => 'Detalla las observaciones con al menos 20 caracteres.'], 400);
    }
}

try {
    $pdo = obtenerConexion();
    $pdo->beginTransaction();

    $solicitud = $pdo->prepare(
        'SELECT s.estadoSolicitudEvaluacion,
                s.idCandidato,
                c.idUsuario AS idUsuarioCandidato
           FROM solicitudevaluacion s
           INNER JOIN candidato c ON c.idCandidato = s.idCandidato
          WHERE s.idSolicitudEvaluacion = :idSolicitud
            AND s.idUsuario = :idEvaluador
          FOR UPDATE'
    );
    $solicitud->execute([
        ':idSolicitud' => $idSolicitud,
        ':idEvaluador' => $idEvaluador,
    ]);
    $solicitudFila = $solicitud->fetch();
    $estadoActual = $solicitudFila['estadoSolicitudEvaluacion'] ?? null;

    if (!$solicitudFila) {
        $pdo->rollBack();
        responder(['ok' => false, 'mensaje' => 'La solicitud no existe o no esta asignada a tu usuario.'], 404);
    }

    if ($estadoActual === 'finalizada') {
        $pdo->rollBack();
        responder(['ok' => false, 'mensaje' => 'La solicitud ya esta finalizada y no se puede modificar.'], 409);
    }

    $nuevoEstado = $accion === 'finalizar' ? 'finalizada' : 'en_proceso';
    $estadoEvaluacion = $resultado !== '' ? $resultado : 'en_proceso';
    $observacionGuardar = $observaciones !== '' ? $observaciones : null;
    $cargoActualGuardar = $cargoActual !== '' ? $cargoActual : null;
    $comentarioGuardar = $comentarioEntrevista !== '' ? $comentarioEntrevista : null;

    $existente = $pdo->prepare(
        'SELECT idEvaluacion
           FROM evaluacion
          WHERE idSolicitudEvaluacion = :idSolicitud
          ORDER BY idEvaluacion DESC
          LIMIT 1
          FOR UPDATE'
    );
    $existente->execute([':idSolicitud' => $idSolicitud]);
    $idEvaluacion = (int) ($existente->fetchColumn() ?: 0);

    if ($idEvaluacion > 0) {
        $actualizar = $pdo->prepare(
            'UPDATE evaluacion
                SET idUsuario = :idEvaluador,
                    estadoEvaluacion = :estadoEvaluacion,
                    fechaEvaluacion = CURDATE(),
                    cargoActual = :cargoActual,
                    comentarioEntrevista = :comentarioEntrevista,
                    Observacion = :observaciones
              WHERE idEvaluacion = :idEvaluacion'
        );
        $actualizar->execute([
            ':idEvaluador' => $idEvaluador,
            ':estadoEvaluacion' => $estadoEvaluacion,
            ':cargoActual' => $cargoActualGuardar,
            ':comentarioEntrevista' => $comentarioGuardar,
            ':observaciones' => $observacionGuardar,
            ':idEvaluacion' => $idEvaluacion,
        ]);
    } else {
        $insertar = $pdo->prepare(
            'INSERT INTO evaluacion
                (idSolicitudEvaluacion, idUsuario, estadoEvaluacion, fechaEvaluacion, cargoActual, comentarioEntrevista, Observacion)
             VALUES
                (:idSolicitud, :idEvaluador, :estadoEvaluacion, CURDATE(), :cargoActual, :comentarioEntrevista, :observaciones)'
        );
        $insertar->execute([
            ':idSolicitud' => $idSolicitud,
            ':idEvaluador' => $idEvaluador,
            ':estadoEvaluacion' => $estadoEvaluacion,
            ':cargoActual' => $cargoActualGuardar,
            ':comentarioEntrevista' => $comentarioGuardar,
            ':observaciones' => $observacionGuardar,
        ]);
        $idEvaluacion = (int) $pdo->lastInsertId();
    }

    $actualizarSolicitud = $pdo->prepare(
        'UPDATE solicitudevaluacion
            SET estadoSolicitudEvaluacion = :estado
          WHERE idSolicitudEvaluacion = :idSolicitud'
    );
    $actualizarSolicitud->execute([
        ':estado' => $nuevoEstado,
        ':idSolicitud' => $idSolicitud,
    ]);

    $resultadoEtiquetas = [
        'apto' => 'Apto',
        'no_apto' => 'No Apto',
        'con_observaciones' => 'Con observaciones',
    ];

    if ($accion === 'finalizar') {
        $accionHistorial = 'Evaluación finalizada';
        $detalleHistorial = 'Resultado: ' . ($resultadoEtiquetas[$resultado] ?? $resultado) . '.';
        if ($observaciones !== '') {
            $detalleHistorial .= ' Observaciones: ' . $observaciones;
        }
    } elseif ($estadoActual === 'pendiente') {
        $accionHistorial = 'Evaluación iniciada';
        $detalleHistorial = 'El evaluador inició la evaluación.';
    } else {
        $accionHistorial = 'Borrador actualizado';
        $detalleHistorial = 'Se actualizó el borrador de la evaluación.';
    }

    registrarHistorial($pdo, [
        'idSolicitud' => $idSolicitud,
        'idCandidato' => (int) $solicitudFila['idCandidato'],
        'tipoGestion' => $solicitudFila['idUsuarioCandidato'] === null ? 'externa' : 'interna',
        'accion' => $accionHistorial,
        'detalle' => $detalleHistorial,
        'idUsuario' => $idEvaluador,
        'estado' => $nuevoEstado,
    ]);

    $fechaServidor = (string) $pdo->query('SELECT CURDATE()')->fetchColumn();

    $pdo->commit();

    responder([
        'ok' => true,
        'mensaje' => $accion === 'finalizar'
            ? 'Evaluacion finalizada correctamente.'
            : 'Borrador guardado correctamente.',
        'idEvaluacion' => $idEvaluacion,
        'estado' => $nuevoEstado,
        'resultado' => $accion === 'finalizar' ? $resultado : null,
        'fechaEvaluacion' => $fechaServidor,
    ]);
} catch (PDOException $e) {
    if (isset($pdo) && $pdo->inTransaction()) {
        $pdo->rollBack();
    }
    error_log('Error al guardar evaluacion: ' . $e->getMessage());
    responder(['ok' => false, 'mensaje' => 'No fue posible guardar la evaluacion.'], 500);
} catch (RuntimeException $e) {
    if (isset($pdo) && $pdo->inTransaction()) {
        $pdo->rollBack();
    }
    error_log('Error al guardar evaluacion: ' . $e->getMessage());
    responder(['ok' => false, 'mensaje' => 'No fue posible guardar la evaluacion.'], 500);
}
