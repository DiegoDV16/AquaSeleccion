<?php

/**
 * d_usuario.php
 * POST /backend/api/usuarios/d_usuario.php
 * Elimina un usuario. Requiere sesion activa de Administrador.
 */

declare(strict_types=1);

require_once __DIR__ . '/../../config/conexion.php';
require_once __DIR__ . '/../../config/sesion.php';
require_once __DIR__ . '/../../config/roles.php';
require_once __DIR__ . '/../../helpers/respuesta.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    responder(['ok' => false, 'mensaje' => 'Metodo no permitido.'], 405);
}

$sesion = usuarioAutenticado();

if ($sesion === null) {
    responder(['ok' => false, 'mensaje' => 'Sesion no iniciada.'], 401);
}

if (($sesion['rol_id'] ?? null) !== 'administrador') {
    responder(['ok' => false, 'mensaje' => 'No tienes permisos para eliminar usuarios.'], 403);
}

$datos = cuerpoJson();
if (empty($datos) && !empty($_POST)) {
    $datos = $_POST;
}

$idUsuario = isset($datos['idUsuario']) ? (int) $datos['idUsuario'] : 0;

if ($idUsuario <= 0) {
    responder(['ok' => false, 'mensaje' => 'idUsuario es obligatorio.'], 400);
}

$sesionId = (int) ($sesion['id'] ?? 0);
if ($sesionId === $idUsuario) {
    responder(['ok' => false, 'mensaje' => 'No puedes eliminar tu propio usuario.'], 400);
}

try {
    $pdo = obtenerConexion();
    $stmt = $pdo->prepare('DELETE FROM usuario WHERE idUsuario = :idUsuario');
    $stmt->execute([':idUsuario' => $idUsuario]);

    if ($stmt->rowCount() === 0) {
        responder(['ok' => false, 'mensaje' => 'El usuario no existe o ya fue eliminado.'], 404);
    }

    responder(['ok' => true, 'mensaje' => 'Usuario eliminado correctamente.']);
} catch (PDOException $e) {
    responder(['ok' => false, 'mensaje' => 'No se pudo eliminar el usuario.'], 500);
}
