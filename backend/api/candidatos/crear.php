<?php

/**
 * crear.php
 * POST /backend/api/candidatos/crear.php
 * Registra un candidato externo creado manualmente por el Analista.
 * El origen queda determinado por idUsuario = NULL, igual que la postulacion
 * publica; las postulaciones internas las sigue registrando el Administrador.
 */

declare(strict_types=1);

require_once __DIR__ . '/../../config/conexion.php';
require_once __DIR__ . '/../../helpers/autorizacion.php';
require_once __DIR__ . '/../../helpers/validacion_candidato.php';

requerirPost();
requerirRoles(['analista']);

$validacion = validarDatosCandidato($_POST);

if (!$validacion['ok']) {
    responder(['ok' => false, 'mensaje' => $validacion['mensaje']], 400);
}

$datos = $validacion['datos'];

try {
    $pdo = obtenerConexion();

    if (!cargoPerteneceAFamilia($pdo, $datos['idCargo'], $datos['idFamiliaCargo'])) {
        responder(['ok' => false, 'mensaje' => 'El cargo seleccionado no pertenece a la familia indicada.'], 400);
    }

    $consulta = $pdo->prepare(
        'INSERT INTO candidato
            (idUsuario, idCargo, nombres, apellidoPaterno, apellidoMaterno, correo, telefono, curriculumCv, fechaSolicitud, observaciones)
         VALUES
            (NULL, :idCargo, :nombres, :apellidoPaterno, :apellidoMaterno, :correo, :telefono, NULL, CURDATE(), :observaciones)'
    );

    $consulta->execute([
        ':idCargo' => $datos['idCargo'],
        ':nombres' => $datos['nombres'],
        ':apellidoPaterno' => $datos['apellidoPaterno'],
        ':apellidoMaterno' => $datos['apellidoMaterno'],
        ':correo' => $datos['correo'],
        ':telefono' => $datos['telefono'],
        ':observaciones' => $datos['observaciones'],
    ]);

    $idCandidato = (int) $pdo->lastInsertId();

    if ($idCandidato <= 0) {
        throw new RuntimeException('La base de datos no devolvio el identificador del candidato.');
    }

    responder([
        'ok' => true,
        'mensaje' => 'Candidato registrado correctamente.',
        'idCandidato' => $idCandidato,
    ], 201);
} catch (PDOException $e) {
    error_log('Error al crear candidato: ' . $e->getMessage());
    responder(['ok' => false, 'mensaje' => 'No fue posible registrar el candidato.'], 500);
} catch (RuntimeException $e) {
    error_log('Error al crear candidato: ' . $e->getMessage());
    responder(['ok' => false, 'mensaje' => 'No fue posible registrar el candidato.'], 500);
}
