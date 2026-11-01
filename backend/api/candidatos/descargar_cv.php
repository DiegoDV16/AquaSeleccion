<?php

/**
 * descargar_cv.php
 * POST /backend/api/candidatos/descargar_cv.php
 * Entrega el archivo del curriculum como descarga. La sesion y los permisos se
 * validan igual que en la vista previa: el analista accede a cualquier CV y el
 * evaluador solo a los de sus solicitudes asignadas.
 */

declare(strict_types=1);

require_once __DIR__ . '/../../config/conexion.php';
require_once __DIR__ . '/../../helpers/autorizacion.php';
require_once __DIR__ . '/../../helpers/curriculum.php';

$metodo = $_SERVER['REQUEST_METHOD'] ?? '';

if (!in_array($metodo, ['GET', 'POST'], true)) {
    responder(['ok' => false, 'mensaje' => 'Metodo no permitido.'], 405);
}

$sesion = requerirRoles(['analista', 'evaluador']);

$idCandidato = filter_var($_GET['idCandidato'] ?? $_POST['idCandidato'] ?? null, FILTER_VALIDATE_INT);

if ($idCandidato === false || $idCandidato < 1) {
    responder(['ok' => false, 'mensaje' => 'El candidato indicado no es valido.'], 400);
}

try {
    $pdo = obtenerConexion();
    $curriculum = resolverCurriculum($pdo, $sesion, $idCandidato);
    $extension = $curriculum['extension'];

    $tiposPermitidos = [
        'pdf' => 'application/pdf',
        'doc' => 'application/msword',
        'docx' => 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ];

    if (!isset($tiposPermitidos[$extension])) {
        responder(['ok' => false, 'mensaje' => 'El formato del curriculum no se puede descargar.'], 415);
    }

    $rutaAbsoluta = $curriculum['rutaAbsoluta'];
    $tamano = filesize($rutaAbsoluta);
    $nombreDescarga = 'CV_' . $idCandidato . '.' . $extension;

    header('Content-Type: ' . $tiposPermitidos[$extension]);
    header('Content-Disposition: attachment; filename="' . $nombreDescarga . '"');
    header('X-Content-Type-Options: nosniff');
    header('Cache-Control: private, no-store');

    if ($tamano !== false) {
        header('Content-Length: ' . $tamano);
    }

    readfile($rutaAbsoluta);
    exit;
} catch (PDOException $e) {
    error_log('Error al descargar CV: ' . $e->getMessage());
    responder(['ok' => false, 'mensaje' => 'No fue posible descargar el curriculum.'], 500);
} catch (Throwable $e) {
    error_log('Error inesperado al descargar CV: ' . $e->getMessage());
    responder(['ok' => false, 'mensaje' => 'No fue posible descargar el curriculum.'], 500);
}
