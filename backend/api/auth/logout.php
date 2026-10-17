<?php

/**
 * logout.php
 * POST /backend/api/auth/logout.php
 * Destruye la sesion PHP y elimina la cookie de sesion.
 */

declare(strict_types=1);

require_once __DIR__ . '/../../config/sesion.php';
require_once __DIR__ . '/../../helpers/respuesta.php';

iniciarSesion();

$_SESSION = [];

if (ini_get('session.use_cookies')) {
    $params = session_get_cookie_params();
    setcookie(
        session_name(),
        '',
        time() - 42000,
        $params['path'],
        $params['domain'],
        $params['secure'],
        $params['httponly']
    );
}

session_destroy();

responder(['ok' => true, 'mensaje' => 'Sesion cerrada correctamente.']);
