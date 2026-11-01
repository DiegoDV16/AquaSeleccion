<?php

/**
 * evaluadores.php
 * POST /backend/api/solicitudes/evaluadores.php
 * Lista los usuarios activos con rol Evaluador para asignarlos a una
 * solicitud de evaluacion.
 */

declare(strict_types=1);

require_once __DIR__ . '/../../config/conexion.php';
require_once __DIR__ . '/../../helpers/autorizacion.php';

requerirPost();
requerirRoles(['analista']);

try {
    $pdo = obtenerConexion();

    $sql = "SELECT u.idUsuario AS id,
                   TRIM(CONCAT(u.nombres, ' ', u.apellidoPaterno, ' ', COALESCE(u.apellidoMaterno, ''))) AS nombre,
                   u.correo
            FROM usuario u
            WHERE u.idRol = 3 AND u.estado = 1
            ORDER BY u.apellidoPaterno, u.nombres";

    $filas = $pdo->query($sql)->fetchAll();

    $evaluadores = array_map(static function (array $fila): array {
        return [
            'id' => (int) $fila['id'],
            'nombre' => trim((string) $fila['nombre']),
            'correo' => (string) $fila['correo'],
        ];
    }, $filas);

    responder(['ok' => true, 'evaluadores' => $evaluadores]);
} catch (PDOException $e) {
    error_log('Error al listar evaluadores: ' . $e->getMessage());
    responder(['ok' => false, 'mensaje' => 'No fue posible obtener el listado de evaluadores.'], 500);
}
