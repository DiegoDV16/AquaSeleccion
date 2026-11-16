<?php

/**
 * drive_cv.php
 * Envio del curriculum a Google Drive mediante el Web App de Google Apps Script
 * (ver docs/drive/Code.gs). Crea una carpeta por postulante y guarda el archivo dentro.
 */

declare(strict_types=1);

require_once __DIR__ . '/../config/drive.php';

/**
 * Quita caracteres no permitidos en nombres de carpetas y archivos de Drive.
 */
function nombreSeguroDrive(string $texto): string
{
    $limpio = preg_replace('/[\\\\\/:*?"<>|\x00-\x1F]+/', '', $texto) ?? '';
    $limpio = trim(preg_replace('/\s+/', ' ', $limpio) ?? '');

    return mb_substr($limpio, 0, 120, 'UTF-8');
}

/**
 * Sube el curriculum a Drive. Lanza RuntimeException si no se pudo guardar.
 * No registra el contenido del archivo ni los datos del postulante.
 */
function subirCvADrive(string $rutaAbsoluta, string $nombreCarpeta, string $nombreArchivo, string $mime): void
{
    $contenido = @file_get_contents($rutaAbsoluta);
    if ($contenido === false) {
        throw new RuntimeException('No se pudo leer el currículum para enviarlo a Drive.');
    }

    $cuerpo = http_build_query([
        'token' => DRIVE_TOKEN,
        'nombreCarpeta' => $nombreCarpeta,
        'nombreArchivo' => $nombreArchivo,
        'mimeType' => $mime,
        'contenidoBase64' => base64_encode($contenido),
    ]);

    $ch = curl_init(DRIVE_SCRIPT_URL);
    curl_setopt_array($ch, [
        CURLOPT_POST => true,
        CURLOPT_POSTFIELDS => $cuerpo,
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_FOLLOWLOCATION => true,
        CURLOPT_TIMEOUT => 60,
    ]);

    $respuesta = curl_exec($ch);
    $codigo = (int) curl_getinfo($ch, CURLINFO_RESPONSE_CODE);
    curl_close($ch);

    if ($respuesta === false) {
        throw new RuntimeException('No se pudo conectar con Google Drive.');
    }

    $datos = json_decode((string) $respuesta, true);
    if ($codigo !== 200 || !is_array($datos) || ($datos['ok'] ?? false) !== true) {
        throw new RuntimeException('Google Drive rechazó la subida del currículum (HTTP ' . $codigo . ').');
    }
}
