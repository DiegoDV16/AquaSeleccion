<?php

/**
 * actualizar.php
 * POST /backend/api/candidatos/actualizar.php
 * Actualiza los datos principales de un candidato existente. No modifica el
 * origen, la fecha de postulacion ni el curriculum adjunto.
 */

declare(strict_types=1);

require_once __DIR__ . '/../../config/conexion.php';
require_once __DIR__ . '/../../helpers/autorizacion.php';
require_once __DIR__ . '/../../helpers/validacion_candidato.php';

requerirPost();
requerirRoles(['analista']);

$idCandidato = filter_var($_POST['idCandidato'] ?? null, FILTER_VALIDATE_INT);

if ($idCandidato === false || $idCandidato < 1) {
    responder(['ok' => false, 'mensaje' => 'El candidato indicado no es valido.'], 400);
}

$validacion = validarDatosCandidato($_POST);

if (!$validacion['ok']) {
    responder(['ok' => false, 'mensaje' => $validacion['mensaje']], 400);
}

$datos = $validacion['datos'];

try {
    $pdo = obtenerConexion();

    $existe = $pdo->prepare('SELECT 1 FROM candidato WHERE idCandidato = :idCandidato LIMIT 1');
    $existe->execute([':idCandidato' => $idCandidato]);

    if (!$existe->fetchColumn()) {
        responder(['ok' => false, 'mensaje' => 'El candidato indicado no existe.'], 404);
    }

    if (!cargoPerteneceAFamilia($pdo, $datos['idCargo'], $datos['idFamiliaCargo'])) {
        responder(['ok' => false, 'mensaje' => 'El cargo seleccionado no pertenece a la familia indicada.'], 400);
    }

    $consulta = $pdo->prepare(
        'UPDATE candidato
            SET idCargo = :idCargo,
                nombres = :nombres,
                apellidoPaterno = :apellidoPaterno,
                apellidoMaterno = :apellidoMaterno,
                correo = :correo,
                telefono = :telefono,
                observaciones = :observaciones
          WHERE idCandidato = :idCandidato'
    );

    $consulta->execute([
        ':idCargo' => $datos['idCargo'],
        ':nombres' => $datos['nombres'],
        ':apellidoPaterno' => $datos['apellidoPaterno'],
        ':apellidoMaterno' => $datos['apellidoMaterno'],
        ':correo' => $datos['correo'],
        ':telefono' => $datos['telefono'],
        ':observaciones' => $datos['observaciones'],
        ':idCandidato' => $idCandidato,
    ]);

    responder(['ok' => true, 'mensaje' => 'Datos del candidato actualizados correctamente.']);
} catch (PDOException $e) {
    error_log('Error al actualizar candidato: ' . $e->getMessage());
    responder(['ok' => false, 'mensaje' => 'No fue posible actualizar el candidato.'], 500);
}
