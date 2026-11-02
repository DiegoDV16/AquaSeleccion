<?php

/**
 * historial.php
 * Registro de movimientos del ciclo de vida de las solicitudes.
 */

declare(strict_types=1);

/**
 * Inserta un movimiento de historial dentro de la transaccion actual.
 *
 * @param array{idSolicitud?: int|null, idCandidato: int, idCargo?: int|null, tipoGestion: string, accion: string, detalle?: string, idUsuario?: int|null, estado: string} $datos
 */
function registrarHistorial(PDO $pdo, array $datos): void
{
    $detalle = trim((string) ($datos['detalle'] ?? ''));
    if (mb_strlen($detalle, 'UTF-8') > 250) {
        $detalle = mb_substr($detalle, 0, 250, 'UTF-8');
    }

    $consulta = $pdo->prepare(
        'INSERT INTO historialsolicitudes
            (idSolicitudEvaluacion, idCandidato, idCargo, tipoGestion, accion, detalle, idUsuario, estado)
         VALUES
            (:idSolicitud, :idCandidato, :idCargo, :tipoGestion, :accion, :detalle, :idUsuario, :estado)'
    );

    $consulta->execute([
        ':idSolicitud' => $datos['idSolicitud'] ?? null,
        ':idCandidato' => (int) $datos['idCandidato'],
        ':idCargo' => $datos['idCargo'] ?? null,
        ':tipoGestion' => (string) $datos['tipoGestion'],
        ':accion' => (string) $datos['accion'],
        ':detalle' => $detalle !== '' ? $detalle : null,
        ':idUsuario' => $datos['idUsuario'] ?? null,
        ':estado' => (string) $datos['estado'],
    ]);
}
