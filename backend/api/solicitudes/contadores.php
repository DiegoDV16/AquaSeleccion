<?php

/**
 * contadores.php
 * POST /backend/api/solicitudes/contadores.php
 * Devuelve los contadores del menu lateral para el usuario autenticado.
 * El Analista ve el total de solicitudes registradas; el Evaluador solo sus
 * solicitudes pendientes.
 */

declare(strict_types=1);

require_once __DIR__ . '/../../config/conexion.php';
require_once __DIR__ . '/../../helpers/autorizacion.php';

requerirPost();
$sesion = requerirRoles(['analista', 'evaluador']);
$rol = (string) ($sesion['rol_id'] ?? '');
$idUsuario = (int) ($sesion['id'] ?? 0);

try {
    $pdo = obtenerConexion();
    $contadores = [
        'solicitudes' => 0,
        'misSolicitudes' => 0,
    ];

    if ($rol === 'analista') {
        $contadores['solicitudes'] = (int) $pdo->query(
            'SELECT COUNT(*) FROM solicitudevaluacion'
        )->fetchColumn();
    }

    if ($rol === 'evaluador') {
        $consulta = $pdo->prepare(
            'SELECT COUNT(*)
               FROM solicitudevaluacion
              WHERE idUsuario = :idUsuario
                AND estadoSolicitudEvaluacion = :estado'
        );
        $consulta->execute([
            ':idUsuario' => $idUsuario,
            ':estado' => 'pendiente',
        ]);
        $contadores['misSolicitudes'] = (int) $consulta->fetchColumn();
    }

    responder(['ok' => true, 'contadores' => $contadores]);
} catch (PDOException $e) {
    error_log('Error al obtener contadores de solicitudes: ' . $e->getMessage());
    responder(['ok' => false, 'mensaje' => 'No fue posible obtener los contadores.'], 500);
}
