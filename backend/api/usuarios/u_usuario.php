<?php

/**
 * u_usuario.php
 * POST /backend/api/usuarios/u_usuario.php
 * Actualiza datos de un usuario. Permite editar rol, nombres, apellidos, correo, contrasena y estado.
 * Requiere sesion activa de Administrador.
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
    responder(['ok' => false, 'mensaje' => 'No tienes permisos para actualizar usuarios.'], 403);
}

$datos = cuerpoJson();
if (empty($datos) && !empty($_POST)) {
    $datos = $_POST;
}

$idUsuario = isset($datos['idUsuario']) ? (int) $datos['idUsuario'] : 0;
$idRol = isset($datos['idRol']) ? (int) $datos['idRol'] : 0;
$nombres = trim((string) ($datos['nombres'] ?? ''));
$apellidoPaterno = trim((string) ($datos['apellidoPaterno'] ?? ''));
$apellidoMaterno = trim((string) ($datos['apellidoMaterno'] ?? ''));
$correo = trim((string) ($datos['correo'] ?? ''));
$contrasena = (string) ($datos['contrasena'] ?? '');
$estado = array_key_exists('estado', $datos) ? $datos['estado'] : null;

if ($idUsuario <= 0) {
    responder(['ok' => false, 'mensaje' => 'idUsuario es obligatorio.'], 400);
}

if ($idRol <= 0 || $nombres === '' || $apellidoPaterno === '' || $correo === '') {
    responder(['ok' => false, 'mensaje' => 'Completa los campos obligatorios: idRol, nombres, apellidoPaterno y correo.'], 400);
}

if (!filter_var($correo, FILTER_VALIDATE_EMAIL)) {
    responder(['ok' => false, 'mensaje' => 'El correo electronico no es valido.'], 400);
}

try {
    $pdo = obtenerConexion();

    $stmtExiste = $pdo->prepare('SELECT idUsuario FROM usuario WHERE correo = :correo AND idUsuario != :idUsuario LIMIT 1');
    $stmtExiste->execute([':correo' => $correo, ':idUsuario' => $idUsuario]);
    if ($stmtExiste->fetch()) {
        responder(['ok' => false, 'mensaje' => 'El correo ya se encuentra registrado por otro usuario.'], 409);
    }

    $campos = [];
    $params = [':idUsuario' => $idUsuario];

    $campos[] = 'idRol = :idRol';
    $params[':idRol'] = $idRol;

    $campos[] = 'nombres = :nombres';
    $params[':nombres'] = $nombres;

    $campos[] = 'apellidoPaterno = :apellidoPaterno';
    $params[':apellidoPaterno'] = $apellidoPaterno;

    $campos[] = 'apellidoMaterno = :apellidoMaterno';
    $params[':apellidoMaterno'] = $apellidoMaterno === '' ? null : $apellidoMaterno;

    $campos[] = 'correo = :correo';
    $params[':correo'] = $correo;

    if ($contrasena !== '') {
        $campos[] = 'contrasena = :contrasena';
        $params[':contrasena'] = password_hash($contrasena, PASSWORD_DEFAULT);
    }

    if ($estado !== null && $estado !== '') {
        $estadoInt = (int) $estado === 1 ? 1 : 0;
        $campos[] = 'estado = :estado';
        $params[':estado'] = $estadoInt;
    }

    $sql = 'UPDATE usuario SET ' . implode(', ', $campos) . ' WHERE idUsuario = :idUsuario';
    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);

    responder([
        'ok' => true,
        'mensaje' => 'Usuario actualizado correctamente.',
    ]);
} catch (PDOException $e) {
    responder(['ok' => false, 'mensaje' => 'No se pudo actualizar el usuario.'], 500);
}
