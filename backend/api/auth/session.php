<?php

/**
 * session.php
 * GET /backend/api/auth/session.php
 * Devuelve la sesion activa (usuario + rol) o { autenticado: false }.
 * El frontend lo usa al recargar la pagina para restaurar la sesion.
 */

declare(strict_types=1);

require_once __DIR__ . '/../../config/sesion.php';
require_once __DIR__ . '/../../helpers/respuesta.php';

iniciarSesion();

if (empty($_SESSION['usuario'])) {
    responder(['ok' => true, 'autenticado' => false], 200);
}

responder([
    'ok' => true,
    'autenticado' => true,
    'usuario' => $_SESSION['usuario'],
    'rol' => $_SESSION['rol'] ?? null,
]);
