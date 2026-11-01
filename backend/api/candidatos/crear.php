<?php

/**
 * crear.php
 * POST /backend/api/candidatos/crear.php
 * Registra una postulacion interna creada por el Analista. El candidato queda
 * vinculado al usuario de la sesion, por lo que el origen se muestra como
 * `interna`; el curriculum adjunto es opcional y se guarda en uploads/cv.
 */

declare(strict_types=1);

require_once __DIR__ . '/../../config/conexion.php';
require_once __DIR__ . '/../../helpers/autorizacion.php';
require_once __DIR__ . '/../../helpers/validacion_candidato.php';
require_once __DIR__ . '/../../helpers/archivo_cv.php';

requerirPost();
$sesion = requerirRoles(['analista']);

$idUsuario = (int) ($sesion['id'] ?? 0);

if ($idUsuario <= 0) {
    responder(['ok' => false, 'mensaje' => 'No se pudo identificar al analista de la sesion.'], 401);
}

$validacion = validarDatosCandidato($_POST);

if (!$validacion['ok']) {
    responder(['ok' => false, 'mensaje' => $validacion['mensaje']], 400);
}

$datos = $validacion['datos'];
$rutaCv = null;

try {
    $pdo = obtenerConexion();

    if (!cargoPerteneceAFamilia($pdo, $datos['idCargo'], $datos['idFamiliaCargo'])) {
        responder(['ok' => false, 'mensaje' => 'El cargo seleccionado no pertenece a la familia indicada.'], 400);
    }

    $rutaCv = guardarCurriculum($_FILES['curriculumCv'] ?? []);

    $consulta = $pdo->prepare(
        'INSERT INTO candidato
            (idUsuario, idCargo, nombres, apellidoPaterno, apellidoMaterno, correo, telefono, curriculumCv, fechaSolicitud, observaciones)
         VALUES
            (:idUsuario, :idCargo, :nombres, :apellidoPaterno, :apellidoMaterno, :correo, :telefono, :curriculumCv, CURDATE(), :observaciones)'
    );

    $consulta->execute([
        ':idUsuario' => $idUsuario,
        ':idCargo' => $datos['idCargo'],
        ':nombres' => $datos['nombres'],
        ':apellidoPaterno' => $datos['apellidoPaterno'],
        ':apellidoMaterno' => $datos['apellidoMaterno'],
        ':correo' => $datos['correo'],
        ':telefono' => $datos['telefono'],
        ':curriculumCv' => $rutaCv,
        ':observaciones' => $datos['observaciones'],
    ]);

    $idCandidato = (int) $pdo->lastInsertId();

    if ($idCandidato <= 0) {
        throw new RuntimeException('La base de datos no devolvio el identificador del candidato.');
    }

    responder([
        'ok' => true,
        'mensaje' => 'Postulacion interna registrada correctamente.',
        'idCandidato' => $idCandidato,
    ], 201);
} catch (InvalidArgumentException $e) {
    eliminarCurriculum($rutaCv);
    responder(['ok' => false, 'mensaje' => $e->getMessage()], 400);
} catch (PDOException $e) {
    eliminarCurriculum($rutaCv);
    error_log('Error al crear candidato: ' . $e->getMessage());
    responder(['ok' => false, 'mensaje' => 'No fue posible registrar la postulacion interna.'], 500);
} catch (RuntimeException $e) {
    eliminarCurriculum($rutaCv);
    error_log('Error al crear candidato: ' . $e->getMessage());
    responder(['ok' => false, 'mensaje' => 'No fue posible registrar la postulacion interna.'], 500);
}
