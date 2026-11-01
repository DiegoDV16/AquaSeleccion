<?php

/**
 * validacion_candidato.php
 * Validaciones compartidas por los endpoints de creacion y edicion de
 * candidatos. Las mismas reglas se aplican en el navegador, pero el servidor
 * es la fuente de verdad.
 */

declare(strict_types=1);

/**
 * Valida y normaliza los datos principales de un candidato.
 *
 * @param array<string, mixed> $datos
 * @return array{ok: bool, mensaje?: string, datos?: array<string, mixed>}
 */
function validarDatosCandidato(array $datos): array
{
    $nombres = trim((string) ($datos['nombres'] ?? ''));
    $apellidoPaterno = trim((string) ($datos['apellidoPaterno'] ?? ''));
    $apellidoMaterno = trim((string) ($datos['apellidoMaterno'] ?? ''));
    $correo = trim((string) ($datos['correo'] ?? ''));
    $telefono = trim((string) ($datos['telefono'] ?? ''));
    $observaciones = trim((string) ($datos['observaciones'] ?? ''));
    $idCargo = filter_var($datos['idCargo'] ?? null, FILTER_VALIDATE_INT);
    $idFamiliaCargo = filter_var($datos['idFamiliaCargo'] ?? null, FILTER_VALIDATE_INT);

    if ($nombres === '') {
        return ['ok' => false, 'mensaje' => 'Ingresa los nombres del candidato.'];
    }
    if (mb_strlen($nombres, 'UTF-8') > 50) {
        return ['ok' => false, 'mensaje' => 'Los nombres no pueden superar los 50 caracteres.'];
    }
    if ($apellidoPaterno === '') {
        return ['ok' => false, 'mensaje' => 'Ingresa el apellido paterno.'];
    }
    if (mb_strlen($apellidoPaterno, 'UTF-8') > 25) {
        return ['ok' => false, 'mensaje' => 'El apellido paterno no puede superar los 25 caracteres.'];
    }
    if ($apellidoMaterno === '') {
        return ['ok' => false, 'mensaje' => 'Ingresa el apellido materno.'];
    }
    if (mb_strlen($apellidoMaterno, 'UTF-8') > 25) {
        return ['ok' => false, 'mensaje' => 'El apellido materno no puede superar los 25 caracteres.'];
    }
    if ($correo === '' || mb_strlen($correo, 'UTF-8') > 50 || !filter_var($correo, FILTER_VALIDATE_EMAIL)) {
        return ['ok' => false, 'mensaje' => 'Ingresa un correo electronico valido (maximo 50 caracteres).'];
    }
    if ($telefono === '') {
        return ['ok' => false, 'mensaje' => 'Ingresa un telefono de contacto.'];
    }
    if (mb_strlen($telefono, 'UTF-8') > 15) {
        return ['ok' => false, 'mensaje' => 'El telefono no puede superar los 15 caracteres.'];
    }
    if ($idCargo === false || $idCargo < 1) {
        return ['ok' => false, 'mensaje' => 'Selecciona el cargo al que postula el candidato.'];
    }
    if ($idFamiliaCargo === false || $idFamiliaCargo < 1) {
        return ['ok' => false, 'mensaje' => 'Selecciona la familia de cargo.'];
    }
    if (mb_strlen($observaciones, 'UTF-8') > 500) {
        return ['ok' => false, 'mensaje' => 'Las observaciones no pueden superar los 500 caracteres.'];
    }

    return [
        'ok' => true,
        'datos' => [
            'nombres' => $nombres,
            'apellidoPaterno' => $apellidoPaterno,
            'apellidoMaterno' => $apellidoMaterno,
            'correo' => $correo,
            'telefono' => $telefono,
            'idCargo' => (int) $idCargo,
            'idFamiliaCargo' => (int) $idFamiliaCargo,
            'observaciones' => $observaciones,
        ],
    ];
}

/**
 * Comprueba que el cargo exista y pertenezca a la familia indicada.
 */
function cargoPerteneceAFamilia(PDO $pdo, int $idCargo, int $idFamiliaCargo): bool
{
    $consulta = $pdo->prepare(
        'SELECT 1 FROM cargo WHERE idCargo = :idCargo AND idFamiliaCargo = :idFamiliaCargo LIMIT 1'
    );
    $consulta->execute([
        ':idCargo' => $idCargo,
        ':idFamiliaCargo' => $idFamiliaCargo,
    ]);

    return (bool) $consulta->fetchColumn();
}
