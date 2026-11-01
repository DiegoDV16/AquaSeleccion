<?php

/**
 * autorizacion.php
 * Utilidades compartidas para proteger los endpoints del modulo Analista.
 * La sesion PHP es la unica fuente de verdad de la autenticacion y del rol.
 */

declare(strict_types=1);

require_once __DIR__ . '/../config/sesion.php';
require_once __DIR__ . '/respuesta.php';

/**
 * Exige que la peticion use POST (convencion del proyecto para las llamadas
 * de la aplicacion al backend).
 */
function requerirPost(): void
{
    if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
        responder(['ok' => false, 'mensaje' => 'Metodo no permitido.'], 405);
    }
}

/**
 * Exige una sesion activa con uno de los roles indicados.
 * Responde 401 si no hay sesion y 403 si el rol no esta autorizado.
 *
 * @param string[] $roles Claves de rol, por ejemplo ['analista'].
 * @return array Datos del usuario en sesion.
 */
function requerirRoles(array $roles): array
{
    $sesion = usuarioAutenticado();

    if ($sesion === null) {
        responder(['ok' => false, 'mensaje' => 'Sesion no iniciada.'], 401);
    }

    if (!in_array($sesion['rol_id'] ?? '', $roles, true)) {
        responder(['ok' => false, 'mensaje' => 'No tienes permisos para realizar esta accion.'], 403);
    }

    return $sesion;
}

/**
 * Valida una fecha en formato Y-m-d y devuelve true si es correcta.
 */
function fechaValida(string $fecha): bool
{
    $objeto = DateTimeImmutable::createFromFormat('!Y-m-d', $fecha);

    return $objeto instanceof DateTimeImmutable && $objeto->format('Y-m-d') === $fecha;
}
