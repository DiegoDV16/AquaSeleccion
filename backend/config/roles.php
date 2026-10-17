<?php

/**
 * roles.php
 * Mapa idRol (tabla `rol`) -> modulo del sistema.
 * Debe reflejar src/mock/catalogoRoles.js del frontend.
 */

declare(strict_types=1);

const ROLES_SISTEMA = [
    1 => [
        'clave' => 'administrador',
        'nombre' => 'Administrador',
        'rutaInicio' => '/admin/dashboard',
    ],
    2 => [
        'clave' => 'analista',
        'nombre' => 'Analista de Reclutamiento',
        'rutaInicio' => '/analista/candidatos',
    ],
    3 => [
        'clave' => 'evaluador',
        'nombre' => 'Profesional Evaluador',
        'rutaInicio' => '/evaluador/mis-solicitudes',
    ],
];

/**
 * Devuelve la configuracion del modulo para un idRol, o null si no tiene acceso.
 */
function rolDelSistema(int $idRol): ?array
{
    return ROLES_SISTEMA[$idRol] ?? null;
}
