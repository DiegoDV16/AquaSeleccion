<?php

/**
 * c_usuario.php
 * POST /backend/api/usuarios/c_usuario.php
 * Crea un nuevo usuario en la tabla `usuario`.
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
    responder(['ok' => false, 'mensaje' => 'No tienes permisos para crear usuarios.'], 403);
}

$datos = cuerpoJson();
if (empty($datos) && !empty($_POST)) {
    $datos = $_POST;
}

$idRol = isset($datos['idRol']) ? (int) $datos['idRol'] : 0;
$nombres = trim((string) ($datos['nombres'] ?? ''));
$apellidoPaterno = trim((string) ($datos['apellidoPaterno'] ?? ''));
$apellidoMaterno = trim((string) ($datos['apellidoMaterno'] ?? ''));
$correo = trim((string) ($datos['correo'] ?? ''));
$contrasena = (string) ($datos['contrasena'] ?? '');
$estado = $datos['estado'] ?? '1';

if ($idRol <= 0 || $nombres === '' || $apellidoPaterno === '' || $correo === '' || $contrasena === '') {
    responder(['ok' => false, 'mensaje' => 'Completa los campos obligatorios: idRol, nombres, apellidoPaterno, correo y contraseña.'], 400);
}

if (!filter_var($correo, FILTER_VALIDATE_EMAIL)) {
    responder(['ok' => false, 'mensaje' => 'El correo electronico no es valido.'], 400);
}

$estadoInt = (int) $estado === 1 ? 1 : 0;

try {
    $pdo = obtenerConexion();

    $stmtExiste = $pdo->prepare('SELECT idUsuario FROM usuario WHERE correo = :correo LIMIT 1');
    $stmtExiste->execute([':correo' => $correo]);
    if ($stmtExiste->fetch()) {
        responder(['ok' => false, 'mensaje' => 'El correo ya se encuentra registrado.'], 409);
    }

    $hash = password_hash($contrasena, PASSWORD_DEFAULT);

    $sql = 'INSERT INTO usuario (idRol, nombres, apellidoPaterno, apellidoMaterno, correo, contrasena, estado)
            VALUES (:idRol, :nombres, :apellidoPaterno, :apellidoMaterno, :correo, :contrasena, :estado)';

    $stmt = $pdo->prepare($sql);
    $stmt->execute([
        ':idRol' => $idRol,
        ':nombres' => $nombres,
        ':apellidoPaterno' => $apellidoPaterno,
        ':apellidoMaterno' => $apellidoMaterno === '' ? null : $apellidoMaterno,
        ':correo' => $correo,
        ':contrasena' => $hash,
        ':estado' => $estadoInt,
    ]);

    $idUsuario = (int) $pdo->lastInsertId();

    responder([
        'ok' => true,
        'mensaje' => 'Usuario creado correctamente.',
        'idUsuario' => $idUsuario,
    ]);
} catch (PDOException $e) {
    responder(['ok' => false, 'mensaje' => 'No se pudo crear el usuario.'], 500);
}
