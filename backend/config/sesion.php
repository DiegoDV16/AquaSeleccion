<?php

/**
 * sesion.php
 * Arranque seguro de la sesion PHP. La sesion es la unica fuente de verdad
 * de la autenticacion del lado servidor.
 */

declare(strict_types=1);

function iniciarSesion(): void
{
    if (session_status() === PHP_SESSION_ACTIVE) {
        return;
    }

    $esHttps = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off')
        || (($_SERVER['HTTP_X_FORWARDED_PROTO'] ?? '') === 'https');

    ini_set('session.use_strict_mode', '1');
    ini_set('session.use_only_cookies', '1');

    session_set_cookie_params([
        'lifetime' => 0,
        'path' => '/',
        'secure' => $esHttps,
        'httponly' => true,
        'samesite' => 'Lax',
    ]);

    session_start();

    header('X-Content-Type-Options: nosniff');
    header('X-Frame-Options: DENY');
    header('Referrer-Policy: same-origin');
}

/**
 * Devuelve el usuario de la sesion activa, o null si no hay sesion.
 */
function usuarioAutenticado(): ?array
{
    iniciarSesion();

    return $_SESSION['usuario'] ?? null;
}
