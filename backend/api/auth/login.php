<?php

/**
 * login.php
 * POST /backend/api/auth/login.php
 * Cuerpo JSON: { "correo": "...", "contrasena": "..." }
 *
 * Valida que el usuario exista, que este activo y que la contrasena coincida
 * con el hash almacenado (password_verify). Si todo es correcto abre la sesion
 * PHP y responde con el usuario y el modulo al que debe entrar segun su rol.
 */

declare(strict_types=1);

require_once __DIR__ . '/../../config/conexion.php';
require_once __DIR__ . '/../../config/sesion.php';
require_once __DIR__ . '/../../config/roles.php';
require_once __DIR__ . '/../../helpers/respuesta.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    responder(['ok' => false, 'mensaje' => 'Metodo no permitido.'], 405);
}

$datos = cuerpoJson();
$correo = trim((string) ($datos['correo'] ?? ''));
$contrasena = (string) ($datos['contrasena'] ?? $datos['clave'] ?? '');

if ($correo === '' || $contrasena === '') {
    responder(['ok' => false, 'mensaje' => 'Ingresa tu correo institucional y contrasena.'], 400);
}

try {
    $pdo = obtenerConexion();

    $sql = 'SELECT u.idUsuario,
                   u.idRol,
                   u.nombres,
                   u.apellidoPaterno,
                   u.apellidoMaterno,
                   u.correo,
                   u.contrasena,
                   u.estado
            FROM usuario u
            WHERE u.correo = :correo
            LIMIT 1';

    $stmt = $pdo->prepare($sql);
    $stmt->execute([':correo' => $correo]);
    $registro = $stmt->fetch();

    if (!$registro) {
        responder(['ok' => false, 'mensaje' => 'El correo no esta registrado en el sistema.'], 401);
    }

    if ((int) $registro['estado'] !== 1) {
        responder([
            'ok' => false,
            'mensaje' => 'Tu usuario se encuentra inactivo. Contacta al administrador del sistema.',
        ], 403);
    }

    if (!password_verify($contrasena, $registro['contrasena'])) {
        responder(['ok' => false, 'mensaje' => 'La contrasena es incorrecta. Vuelve a intentarlo.'], 401);
    }

    $rolSistema = rolDelSistema((int) $registro['idRol']);

    if ($rolSistema === null) {
        responder([
            'ok' => false,
            'mensaje' => 'Tu rol no tiene un modulo asignado. Contacta al administrador del sistema.',
        ], 403);
    }

    $nombreCompleto = trim(
        $registro['nombres'] . ' ' . $registro['apellidoPaterno'] . ' ' . ($registro['apellidoMaterno'] ?? '')
    );

    $usuario = [
        'id' => (int) $registro['idUsuario'],
        'idRol' => (int) $registro['idRol'],
        'nombres' => $registro['nombres'],
        'apellidoPaterno' => $registro['apellidoPaterno'],
        'apellidoMaterno' => $registro['apellidoMaterno'],
        'nombre' => $nombreCompleto,
        'correo' => $registro['correo'],
        'rol_id' => $rolSistema['clave'],
        'estado' => 'activo',
    ];

    iniciarSesion();
    session_regenerate_id(true);
    $_SESSION['usuario'] = $usuario;
    $_SESSION['rol'] = $rolSistema;

    responder([
        'ok' => true,
        'usuario' => $usuario,
        'rol' => array_merge(['id' => (int) $registro['idRol']], $rolSistema),
    ]);
} catch (PDOException $e) {
    responder([
        'ok' => false,
        'mensaje' => 'Ocurrio un error al procesar el inicio de sesion.',
    ], 500);
}
