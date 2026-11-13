<?php

/**
 * ia.php
 * Integracion con un proveedor compatible con OpenAI para generar el
 * borrador del documento de entrevista. La clave se lee del entorno y nunca
 * se envia al frontend.
 */

declare(strict_types=1);

function configuracionIA(): array
{
    $apiKey = trim((string) (getenv('IA_API_KEY') ?: ($_SERVER['IA_API_KEY'] ?? '')));
    $baseUrl = rtrim((string) (getenv('IA_BASE_URL') ?: 'https://api.openai.com/v1'), '/');
    $modelo = trim((string) (getenv('IA_CHAT_MODEL') ?: 'gpt-4o-mini'));

    if ($apiKey === '') {
        throw new RuntimeException('IA_NO_CONFIGURADA');
    }

    return [
        'api_key' => $apiKey,
        'base_url' => $baseUrl,
        'modelo' => $modelo,
    ];
}

function generarDocumentoEntrevista(string $transcripcion, array $contexto): string
{
    $config = configuracionIA();

    $sistema = <<<'PROMPT'
Eres un asistente de apoyo para entrevistas psicolaborales.
Genera un borrador de documento en espanol, claro y profesional, usando
exclusivamente la transcripcion entregada. No inventes hechos, nombres,
fechas ni resultados. Si un dato no aparece, escribe "No mencionado".
Separa los hechos de las impresiones del entrevistador. No emitas una
decision de contratacion ni un diagnostico clinico.

Usa estas secciones:
1. Datos generales
2. Motivacion por el cargo
3. Experiencia y trayectoria
4. Competencias y conductas observadas
5. Disponibilidad y condiciones
6. Alertas o informacion por profundizar
7. Sintesis del entrevistador
8. Recomendacion para la siguiente etapa

Al final agrega una nota: "Borrador generado por IA. Requiere revision humana."
PROMPT;

    $usuario = "Contexto de la solicitud:\n"
        . 'Candidato: ' . ($contexto['candidato'] ?? 'No mencionado') . "\n"
        . 'Cargo: ' . ($contexto['cargo'] ?? 'No mencionado') . "\n"
        . 'Fecha: ' . ($contexto['fecha'] ?? 'No mencionada') . "\n\n"
        . "Transcripcion:\n" . $transcripcion;

    $payload = [
        'model' => $config['modelo'],
        'temperature' => 0.2,
        'messages' => [
            ['role' => 'system', 'content' => $sistema],
            ['role' => 'user', 'content' => $usuario],
        ],
    ];

    $ch = curl_init($config['base_url'] . '/chat/completions');
    if ($ch === false) {
        throw new RuntimeException('No se pudo iniciar la conexion con el proveedor de IA.');
    }

    curl_setopt_array($ch, [
        CURLOPT_POST => true,
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_HTTPHEADER => [
            'Authorization: Bearer ' . $config['api_key'],
            'Content-Type: application/json',
        ],
        CURLOPT_POSTFIELDS => json_encode($payload, JSON_UNESCAPED_UNICODE),
        CURLOPT_TIMEOUT => 90,
    ]);

    $respuesta = curl_exec($ch);
    $errorCurl = curl_error($ch);
    $codigo = (int) curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    if ($respuesta === false || $errorCurl !== '') {
        throw new RuntimeException('No se pudo conectar con el proveedor de IA.');
    }

    $datos = json_decode((string) $respuesta, true);
    if ($codigo < 200 || $codigo >= 300 || !is_array($datos)) {
        throw new RuntimeException('El proveedor de IA rechazo la solicitud.');
    }

    $contenido = $datos['choices'][0]['message']['content'] ?? '';
    if (!is_string($contenido) || trim($contenido) === '') {
        throw new RuntimeException('El proveedor de IA no devolvio un documento.');
    }

    return trim($contenido);
}
