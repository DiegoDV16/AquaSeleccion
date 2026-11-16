<?php

/**
 * mailer.php
 * Envio de correos transaccionales con Resend desde PHP.
 * La API key se lee de backend/config/resend.php o del entorno.
 */

declare(strict_types=1);

function configuracionResend(): array
{
    static $config = null;

    if (is_array($config)) {
        return $config;
    }

    $config = [
        'api_key' => trim((string) (getenv('RESEND_API_KEY') ?: '')),
        'from' => (string) (getenv('RESEND_FROM') ?: 'AquaSeleccion <onboarding@resend.dev>'),
        'analyst_fallback' => (string) (getenv('RESEND_ANALYST_EMAIL') ?: 'analista@aquachile.cl'),
        'app_url' => (string) (getenv('APP_URL') ?: 'http://localhost:5173'),
    ];

    $archivo = __DIR__ . '/../config/resend.php';
    if (is_file($archivo)) {
        $local = require $archivo;
        if (is_array($local)) {
            $config = array_merge($config, $local);
        }
    }

    return $config;
}

/**
 * Analistas activos que deben recibir la notificación.
 *
 * @return array<int, array{correo: string, nombre: string}>
 */
function obtenerAnalistasNotificacion(PDO $pdo, array $config): array
{
    $testRecipient = trim((string) (getenv('RESEND_TEST_RECIPIENT') ?: ($config['test_recipient'] ?? '')));

    if ($testRecipient !== '') {
        return [[
            'correo' => $testRecipient,
            'nombre' => 'Destinatario de prueba Resend',
        ]];
    }

    $consulta = $pdo->query(
        "SELECT u.correo,
                TRIM(CONCAT_WS(' ', u.nombres, u.apellidoPaterno, u.apellidoMaterno)) AS nombre
           FROM usuario u
           INNER JOIN rol r ON r.idRol = u.idRol
          WHERE r.rol = 'Analista'
            AND u.estado = 1
          ORDER BY u.idUsuario"
    );

    $analistas = $consulta->fetchAll();
    if ($analistas !== []) {
        return $analistas;
    }

    return [[
        'correo' => (string) $config['analyst_fallback'],
        'nombre' => 'Equipo de Reclutamiento',
    ]];
}

function enviarCorreoResend(string $destinatario, string $asunto, string $html, string $texto): array
{
    $config = configuracionResend();
    $apiKey = trim((string) ($config['api_key'] ?? ''));

    if ($apiKey === '' || $apiKey === 're_TU_API_KEY') {
        error_log('Resend no configurado: falta RESEND_API_KEY.');

        return ['ok' => false, 'mensaje' => 'Resend no esta configurado.'];
    }

    $payload = [
        'from' => (string) $config['from'],
        'to' => [$destinatario],
        'subject' => $asunto,
        'html' => $html,
        'text' => $texto,
    ];

    $ch = curl_init('https://api.resend.com/emails');
    if ($ch === false) {
        return ['ok' => false, 'mensaje' => 'No se pudo iniciar la conexion con Resend.'];
    }

    curl_setopt_array($ch, [
        CURLOPT_POST => true,
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_HTTPHEADER => [
            'Authorization: Bearer ' . $apiKey,
            'Content-Type: application/json',
        ],
        CURLOPT_POSTFIELDS => json_encode($payload, JSON_UNESCAPED_UNICODE),
        CURLOPT_CONNECTTIMEOUT => 10,
        CURLOPT_TIMEOUT => 20,
    ]);

    $respuesta = curl_exec($ch);
    $errorCurl = curl_error($ch);
    $codigo = (int) curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    if ($respuesta === false || $errorCurl !== '') {
        error_log('Error de conexion con Resend: ' . $errorCurl);

        return ['ok' => false, 'mensaje' => 'No se pudo conectar con Resend.'];
    }

    $datos = json_decode((string) $respuesta, true);
    if ($codigo < 200 || $codigo >= 300 || !is_array($datos)) {
        error_log('Resend rechazo el correo: HTTP ' . $codigo . ' ' . mb_substr((string) $respuesta, 0, 500));

        return ['ok' => false, 'mensaje' => 'Resend rechazo el correo.'];
    }

    return [
        'ok' => true,
        'mensaje' => 'Correo enviado.',
        'id' => (string) ($datos['id'] ?? ''),
    ];
}

/**
 * Notifica a los analistas activos sobre una nueva postulación.
 *
 * @param array<string, mixed> $datos
 * @return array{ok: bool, enviados: int, destinatarios: int}
 */
function notificarNuevaPostulacion(PDO $pdo, array $datos): array
{
    $config = configuracionResend();
    $analistas = obtenerAnalistasNotificacion($pdo, $config);
    $enlace = rtrim((string) $config['app_url'], '/') . '/analista/candidatos';

    $plantilla = __DIR__ . '/../templates/emails/postulacion_analista.php';
    if (!is_file($plantilla)) {
        error_log('No se encontro la plantilla de correo de postulacion.');

        return ['ok' => false, 'enviados' => 0, 'destinatarios' => count($analistas)];
    }

    ob_start();
    include $plantilla;
    $html = (string) ob_get_clean();

    $nombre = trim(implode(' ', array_filter([
        $datos['nombres'] ?? '',
        $datos['apellidoPaterno'] ?? '',
        $datos['apellidoMaterno'] ?? '',
    ])));
    $asunto = 'Nueva postulación: ' . $nombre . ' · ' . ($datos['cargo'] ?? 'Cargo');
    $texto = "Nueva postulación recibida\n\n"
        . 'Candidato: ' . $nombre . "\n"
        . 'Correo: ' . ($datos['correo'] ?? '-') . "\n"
        . 'Teléfono: ' . ($datos['telefono'] ?? '-') . "\n"
        . 'Cargo: ' . ($datos['cargo'] ?? '-') . "\n"
        . 'Familia: ' . ($datos['familia'] ?? '-') . "\n"
        . 'Fecha: ' . ($datos['fecha'] ?? '-') . "\n\n"
        . 'Revisar en: ' . $enlace . "\n";

    $enviados = 0;

    foreach ($analistas as $analista) {
        $correo = trim((string) ($analista['correo'] ?? ''));
        if ($correo === '') {
            continue;
        }

        $resultado = enviarCorreoResend($correo, $asunto, $html, $texto);
        if ($resultado['ok']) {
            $enviados += 1;
            error_log('Notificacion de postulacion enviada a ' . $correo . ' (Resend ID: ' . ($resultado['id'] ?? 'sin-id') . ')');
        } else {
            error_log('No se pudo notificar a ' . $correo . ': ' . ($resultado['mensaje'] ?? 'error'));
        }
    }

    return [
        'ok' => $enviados > 0,
        'enviados' => $enviados,
        'destinatarios' => count($analistas),
    ];
}
