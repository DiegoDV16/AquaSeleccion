<?php

/**
 * cv.php
 * POST /backend/api/candidatos/cv.php
 * Devuelve una vista previa del curriculum del candidato. Para PDF informa la
 * URL del archivo; para DOCX convierte el documento a HTML seguro. El analista
 * puede ver cualquier CV y el evaluador solo los de solicitudes asignadas.
 */

declare(strict_types=1);

require_once __DIR__ . '/../../config/conexion.php';
require_once __DIR__ . '/../../helpers/autorizacion.php';
require_once __DIR__ . '/../../helpers/curriculum.php';
require_once __DIR__ . '/../../helpers/docx.php';

requerirPost();
$sesion = requerirRoles(['analista', 'evaluador']);

$idCandidato = filter_var($_POST['idCandidato'] ?? null, FILTER_VALIDATE_INT);

if ($idCandidato === false || $idCandidato < 1) {
    responder(['ok' => false, 'mensaje' => 'El candidato indicado no es valido.'], 400);
}

try {
    $pdo = obtenerConexion();
    $curriculum = resolverCurriculum($pdo, $sesion, $idCandidato);
    $extension = $curriculum['extension'];
    $nombre = $curriculum['nombre'];

    if ($extension === 'pdf') {
        responder([
            'ok' => true,
            'tipo' => 'pdf',
            'url' => 'backend/' . $curriculum['rutaRelativa'],
            'nombre' => $nombre,
        ]);
    }

    if ($extension === 'docx') {
        $html = docxAHtml($curriculum['rutaAbsoluta']);

        responder([
            'ok' => true,
            'tipo' => 'html',
            'html' => $html,
            'nombre' => $nombre,
        ]);
    }

    if ($extension === 'doc') {
        responder([
            'ok' => false,
            'mensaje' => 'El formato Word antiguo (.doc) no se puede previsualizar. Solicita el curriculum en PDF o .docx.',
        ], 415);
    }

    responder(['ok' => false, 'mensaje' => 'El formato del curriculum no se puede previsualizar.'], 415);
} catch (PDOException $e) {
    error_log('Error al previsualizar CV: ' . $e->getMessage());
    responder(['ok' => false, 'mensaje' => 'No fue posible cargar el curriculum.'], 500);
} catch (RuntimeException $e) {
    error_log('Error al convertir CV Word: ' . $e->getMessage());
    responder(['ok' => false, 'mensaje' => 'No fue posible convertir el documento Word para previsualizarlo.'], 500);
} catch (Throwable $e) {
    error_log('Error inesperado al previsualizar CV: ' . $e->getMessage());
    responder(['ok' => false, 'mensaje' => 'No fue posible cargar el curriculum.'], 500);
}
