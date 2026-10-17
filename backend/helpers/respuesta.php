<?php

/**
 * respuesta.php
 * Utilidades para responder JSON y leer el cuerpo de la peticion.
 */

declare(strict_types=1);

/**
 * Envia una respuesta JSON y termina la ejecucion.
 */
function responder(array $datos, int $codigo = 200): void
{
    http_response_code($codigo);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode($datos, JSON_UNESCAPED_UNICODE);
    exit;
}

/**
 * Lee el cuerpo JSON de la peticion (o un arreglo vacio si no viene).
 */
function cuerpoJson(): array
{
    $cuerpo = file_get_contents('php://input');

    if ($cuerpo === false || trim($cuerpo) === '') {
        return [];
    }

    $datos = json_decode($cuerpo, true);

    return is_array($datos) ? $datos : [];
}
