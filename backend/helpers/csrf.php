<?php

/**
 * csrf.php
 * Token por sesion para proteger las mutaciones autenticadas contra CSRF.
 */

declare(strict_types=1);

require_once __DIR__ . '/../config/sesion.php';
require_once __DIR__ . '/respuesta.php';

function tokenCsrf(): string
{
    iniciarSesion();

    if (empty($_SESSION['csrf_token'])) {
        $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
    }

    return (string) $_SESSION['csrf_token'];
}

/**
 * Valida el token enviado en X-CSRF-Token o en el campo _csrf.
 * Las peticiones autenticadas de escritura deben llamar a esta funcion.
 */
function validarCsrf(): void
{
    iniciarSesion();

    $recibido = (string) ($_SERVER['HTTP_X_CSRF_TOKEN'] ?? ($_POST['_csrf'] ?? ''));
    $esperado = (string) ($_SESSION['csrf_token'] ?? '');

    if ($esperado === '' || $recibido === '' || !hash_equals($esperado, $recibido)) {
        responder([
            'ok' => false,
            'mensaje' => 'La sesion de seguridad expiro. Recarga la pagina e intenta nuevamente.',
        ], 403);
    }
}
