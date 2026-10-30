<?php

/**
 * listar.php
 * GET /backend/api/usuarios/listar.php
 * Devuelve los usuarios registrados en la tabla `usuario`, uniendo su rol.
 * Solo accesible con una sesion activa de Administrador.
 */

declare(strict_types=1);

require_once __DIR__ . '/../../config/conexion.php';
require_once __DIR__ . '/../../config/sesion.php';
require_once __DIR__ . '/../../config/roles.php';
require_once __DIR__ . '/../../helpers/respuesta.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    responder(['ok' => false, 'mensaje' => 'Metodo no permitido.'], 405);
}

$sesion = usuarioAutenticado();

if ($sesion === null) {
    responder(['ok' => false, 'mensaje' => 'Sesion no iniciada.'], 401);
}

if (($sesion['rol_id'] ?? null) !== 'administrador') {
    responder(['ok' => false, 'mensaje' => 'No tienes permisos para ver los usuarios.'], 403);
}

try {
    $pdo = obtenerConexion();

    $sql = 'SELECT u.idUsuario,
                   u.idRol,
                   u.nombres,
                   u.apellidoPaterno,
                   u.apellidoMaterno,
                   u.correo,
                   u.estado,
                   r.rol AS nombreRol
            FROM usuario u
            INNER JOIN rol r ON r.idRol = u.idRol
            ORDER BY u.idUsuario';

    $filas = $pdo->query($sql)->fetchAll();

    $usuarios = array_map(static function (array $fila): array {
        $rol = rolDelSistema((int) $fila['idRol']);

        return [
            'id' => (int) $fila['idUsuario'],
            'nombre' => trim(
                $fila['nombres'] . ' ' . $fila['apellidoPaterno'] . ' ' . ($fila['apellidoMaterno'] ?? '')
            ),
            'correo' => $fila['correo'],
            'rol_id' => $rol['clave'] ?? '',
            'rol_nombre' => $fila['nombreRol'],
            'estado' => (int) $fila['estado'] === 1 ? 'activo' : 'inactivo',
        ];
    }, $filas);

    responder(['ok' => true, 'usuarios' => $usuarios]);
} catch (PDOException $e) {
    responder(['ok' => false, 'mensaje' => 'No se pudo obtener el listado de usuarios.'], 500);
}
