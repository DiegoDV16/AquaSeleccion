<?php

/**
 * conexion.example.php
 * Plantilla de configuracion. Copiala como `conexion.php` (ese archivo esta
 * ignorado por git) y ajusta los valores segun tu entorno.
 *
 *   cp backend/config/conexion.example.php backend/config/conexion.php
 */

declare(strict_types=1);

const DB_HOST = '127.0.0.1';
const DB_PORT = 3306;
const DB_NOMBRE = 'aquaseleccion';
const DB_USUARIO = 'root';
const DB_CLAVE = '';
const DB_CHARSET = 'utf8mb4';

/**
 * Devuelve una unica instancia de PDO (patron singleton por peticion).
 */
function obtenerConexion(): PDO
{
    static $pdo = null;

    if ($pdo instanceof PDO) {
        return $pdo;
    }

    $dsn = sprintf(
        'mysql:host=%s;port=%d;dbname=%s;charset=%s',
        DB_HOST,
        DB_PORT,
        DB_NOMBRE,
        DB_CHARSET
    );

    try {
        $pdo = new PDO($dsn, DB_USUARIO, DB_CLAVE, [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES => false,
        ]);
    } catch (PDOException $e) {
        http_response_code(500);
        header('Content-Type: application/json; charset=utf-8');
        echo json_encode([
            'ok' => false,
            'mensaje' => 'No se pudo conectar con la base de datos.',
        ], JSON_UNESCAPED_UNICODE);
        exit;
    }

    return $pdo;
}
