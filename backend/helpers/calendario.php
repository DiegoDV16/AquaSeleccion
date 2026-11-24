<?php

/**
 * calendario.php
 * Agenda la evaluacion en Google Calendar mediante el Web App de Apps Script
 * (ver service/calendar.gs). Devuelve el ID del evento y su inicio.
 */

declare(strict_types=1);

require_once __DIR__ . '/../config/calendario.php';

/**
 * Lanza RuntimeException con un mensaje seguro para mostrar si no se pudo agendar.
 * No registra nombres ni correos.
 */
function agendarEvaluacion(string $nombreCandidato, string $correoEvaluador): array
{
    $cuerpo = http_build_query([
        'token' => CALENDAR_TOKEN,
        'candidato' => $nombreCandidato,
        'evaluador' => $correoEvaluador,
    ]);

    $ch = curl_init(CALENDAR_SCRIPT_URL);
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
        throw new RuntimeException('No se pudo conectar con Google Calendar.');
    }

    $datos = json_decode((string) $respuesta, true);
    if ($codigo !== 200 || !is_array($datos)) {
        throw new RuntimeException('Google Calendar no respondió correctamente (HTTP ' . $codigo . ').');
    }

    if (($datos['ok'] ?? false) !== true) {
        throw new RuntimeException((string) ($datos['mensaje'] ?? 'No se pudo agendar la evaluación en el calendario.'));
    }

    return [
        'idEvento' => (string) ($datos['idEvento'] ?? ''),
        'inicio' => (string) ($datos['inicio'] ?? ''),
    ];
}
