<?php

/**
 * curriculum.php
 * Resuelve y autoriza el acceso al curriculum de un candidato. Lo comparten
 * la vista previa y la descarga para no duplicar las validaciones de permisos
 * ni de rutas.
 */

declare(strict_types=1);

require_once __DIR__ . '/respuesta.php';

/**
 * Devuelve los datos del curriculum si la sesion puede verlo.
 * Responde con error y termina si no existe, no tiene CV o no esta autorizado.
 *
 * @param array<string, mixed> $sesion
 * @return array{rutaRelativa: string, rutaAbsoluta: string, extension: string, nombre: string}
 */
function resolverCurriculum(PDO $pdo, array $sesion, int $idCandidato): array
{
    $consulta = $pdo->prepare(
        'SELECT idCandidato, curriculumCv FROM candidato WHERE idCandidato = :idCandidato LIMIT 1'
    );
    $consulta->execute([':idCandidato' => $idCandidato]);
    $candidato = $consulta->fetch();

    if (!$candidato) {
        responder(['ok' => false, 'mensaje' => 'El candidato indicado no existe.'], 404);
    }

    if (($sesion['rol_id'] ?? '') === 'evaluador') {
        $asignada = $pdo->prepare(
            'SELECT 1
               FROM solicitudevaluacion
              WHERE idCandidato = :idCandidato AND idUsuario = :idEvaluador
              LIMIT 1'
        );
        $asignada->execute([
            ':idCandidato' => $idCandidato,
            ':idEvaluador' => (int) ($sesion['id'] ?? 0),
        ]);

        if (!$asignada->fetchColumn()) {
            responder(['ok' => false, 'mensaje' => 'No tienes acceso al curriculum de este candidato.'], 403);
        }
    }

    $rutaRelativa = ltrim(str_replace('\\', '/', (string) $candidato['curriculumCv']), '/');

    if ($rutaRelativa === '') {
        responder(['ok' => false, 'mensaje' => 'El candidato no tiene curriculum adjunto.'], 404);
    }

    $rutaRelativa = preg_replace('#^backend/#', '', $rutaRelativa);

    if (!str_starts_with($rutaRelativa, 'uploads/cv/')) {
        responder(['ok' => false, 'mensaje' => 'La ruta del curriculum no es valida.'], 400);
    }

    $directorioCv = realpath(__DIR__ . '/../uploads/cv');
    $rutaAbsoluta = realpath(__DIR__ . '/../' . $rutaRelativa);

    if (
        $directorioCv === false
        || $rutaAbsoluta === false
        || !is_file($rutaAbsoluta)
        || !str_starts_with($rutaAbsoluta, $directorioCv . DIRECTORY_SEPARATOR)
    ) {
        responder(['ok' => false, 'mensaje' => 'No se encontro el archivo del curriculum.'], 404);
    }

    return [
        'rutaRelativa' => $rutaRelativa,
        'rutaAbsoluta' => $rutaAbsoluta,
        'extension' => strtolower(pathinfo($rutaAbsoluta, PATHINFO_EXTENSION)),
        'nombre' => basename($rutaAbsoluta),
    ];
}
