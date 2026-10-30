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

    session_set_cookie_params([
        'lifetime' => 0,
        'path' => '/',
        'httponly' => true,
        'samesite' => 'Lax',
    ]);

    session_start();
}

/**
 * Devuelve el usuario de la sesion activa, o null si no hay sesion.
 */
function usuarioAutenticado(): ?array
{
    iniciarSesion();

    return $_SESSION['usuario'] ?? null;
}
