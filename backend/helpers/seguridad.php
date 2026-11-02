<?php

/**
 * seguridad.php
 * Controles basicos de seguridad para el inicio de sesion.
 */

declare(strict_types=1);

const LOGIN_MAX_INTENTOS = 5;
const LOGIN_VENTANA_MINUTOS = 15;

function ipCliente(): string
{
    $ip = (string) ($_SERVER['REMOTE_ADDR'] ?? '');

    return filter_var($ip, FILTER_VALIDATE_IP) ? $ip : '0.0.0.0';
}

function loginBloqueado(PDO $pdo, string $correo, string $ip): bool
{
    $consulta = $pdo->prepare(
        'SELECT COUNT(*) AS intentos
           FROM intentos_login
          WHERE correo = :correo
            AND ip = :ip
            AND exitoso = 0
            AND fecha >= DATE_SUB(NOW(), INTERVAL ' . LOGIN_VENTANA_MINUTOS . ' MINUTE)'
    );
    $consulta->execute([
        ':correo' => $correo,
        ':ip' => $ip,
    ]);

    return (int) $consulta->fetchColumn() >= LOGIN_MAX_INTENTOS;
}

function registrarIntentoLogin(PDO $pdo, string $correo, string $ip, bool $exitoso): void
{
    $consulta = $pdo->prepare(
        'INSERT INTO intentos_login (correo, ip, exitoso)
         VALUES (:correo, :ip, :exitoso)'
    );
    $consulta->execute([
        ':correo' => $correo,
        ':ip' => $ip,
        ':exitoso' => $exitoso ? 1 : 0,
    ]);
}
