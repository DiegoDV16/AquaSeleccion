<?php

/**
 * mapeos.php
 * Normaliza las filas de MySQL al contrato JSON que consume el frontend.
 * Se usan en los endpoints de candidatos y solicitudes del modulo Analista.
 */

declare(strict_types=1);

/**
 * Convierte una fila de `candidato` (con cargo, familia y ultima solicitud)
 * al objeto de candidato que usa el frontend.
 *
 * @param array<string, mixed> $fila
 * @return array<string, mixed>
 */
function normalizarCandidato(array $fila): array
{
    $nombres = trim((string) ($fila['nombres'] ?? ''));
    $apellidoPaterno = trim((string) ($fila['apellidoPaterno'] ?? ''));
    $apellidoMaterno = trim((string) ($fila['apellidoMaterno'] ?? ''));

    $estadoSolicitud = $fila['estadoSolicitud'] ?? null;
    $resultado = $fila['resultadoEvaluacion'] ?? null;
    $estado = 'pendiente';

    if ($estadoSolicitud === 'en_proceso') {
        $estado = 'en_proceso';
    } elseif ($estadoSolicitud === 'finalizada') {
        $estado = in_array($resultado, ['apto', 'no_apto', 'con_observaciones'], true)
            ? $resultado
            : 'en_proceso';
    }

    return [
        'id' => (int) ($fila['idCandidato'] ?? 0),
        'nombres' => $nombres,
        'apellidoPaterno' => $apellidoPaterno,
        'apellidoMaterno' => $apellidoMaterno,
        'nombreCompleto' => trim($nombres . ' ' . $apellidoPaterno . ' ' . $apellidoMaterno),
        'correo' => (string) ($fila['correo'] ?? ''),
        'telefono' => (string) ($fila['telefono'] ?? ''),
        'idCargo' => (int) ($fila['idCargo'] ?? 0),
        'cargo' => (string) ($fila['cargo'] ?? ''),
        'idFamiliaCargo' => (int) ($fila['idFamiliaCargo'] ?? 0),
        'familiaCargo' => (string) ($fila['familiaCargo'] ?? ''),
        'tipoPostulacion' => ($fila['idUsuario'] ?? null) === null ? 'externa' : 'interna',
        'fechaPostulacion' => $fila['fechaSolicitud'] ?? null,
        'cvArchivo' => !empty($fila['curriculumCv']) ? (string) $fila['curriculumCv'] : null,
        'observaciones' => (string) ($fila['observaciones'] ?? ''),
        'estado' => $estado,
        'idSolicitudReciente' => isset($fila['idSolicitudReciente']) && $fila['idSolicitudReciente'] !== null
            ? (int) $fila['idSolicitudReciente']
            : null,
        'tieneSolicitudActiva' => in_array($estadoSolicitud, ['pendiente', 'en_proceso'], true),
    ];
}

/**
 * Convierte una fila de `solicitudevaluacion` (con candidato, evaluador y
 * evaluacion) al objeto de solicitud que usa el frontend.
 *
 * @param array<string, mixed> $fila
 * @return array<string, mixed>
 */
function normalizarSolicitud(array $fila): array
{
    $candidato = normalizarCandidato([
        'idCandidato' => $fila['idCandidato'] ?? 0,
        'idUsuario' => $fila['idUsuarioCandidato'] ?? null,
        'nombres' => $fila['nombres'] ?? '',
        'apellidoPaterno' => $fila['apellidoPaterno'] ?? '',
        'apellidoMaterno' => $fila['apellidoMaterno'] ?? '',
        'correo' => $fila['correo'] ?? '',
        'telefono' => $fila['telefono'] ?? '',
        'idCargo' => $fila['idCargo'] ?? 0,
        'cargo' => $fila['cargo'] ?? '',
        'idFamiliaCargo' => $fila['idFamiliaCargo'] ?? 0,
        'familiaCargo' => $fila['familiaCargo'] ?? '',
        'curriculumCv' => $fila['curriculumCv'] ?? null,
        'fechaSolicitud' => $fila['fechaPostulacion'] ?? null,
        'observaciones' => $fila['observacionesCandidato'] ?? '',
        'estadoSolicitud' => $fila['estado'] ?? null,
        'resultadoEvaluacion' => $fila['resultadoEvaluacion'] ?? null,
        'idSolicitudReciente' => $fila['idSolicitud'] ?? null,
    ]);

    $evaluador = null;
    if (!empty($fila['idEvaluadorUsuario'])) {
        $nombresEvaluador = trim((string) ($fila['evaluadorNombres'] ?? ''));
        $apellidoPaternoEvaluador = trim((string) ($fila['evaluadorApellidoPaterno'] ?? ''));
        $apellidoMaternoEvaluador = trim((string) ($fila['evaluadorApellidoMaterno'] ?? ''));

        $evaluador = [
            'id' => (int) $fila['idEvaluadorUsuario'],
            'nombre' => trim($nombresEvaluador . ' ' . $apellidoPaternoEvaluador . ' ' . $apellidoMaternoEvaluador),
            'correo' => (string) ($fila['evaluadorCorreo'] ?? ''),
        ];
    }

    $evaluacion = null;
    if (!empty($fila['idEvaluacion'])) {
        $evaluacion = [
            'id' => (int) $fila['idEvaluacion'],
            'resultado' => !empty($fila['resultadoEvaluacion']) ? (string) $fila['resultadoEvaluacion'] : null,
            'fechaEvaluacion' => $fila['fechaEvaluacion'] ?? null,
            'observacion' => (string) ($fila['observacionEvaluacion'] ?? ''),
        ];
    }

    return [
        'id' => (int) ($fila['idSolicitud'] ?? 0),
        'estado' => (string) ($fila['estado'] ?? 'pendiente'),
        'prioridad' => (string) ($fila['prioridad'] ?? 'normal'),
        'fechaSolicitud' => $fila['fechaSolicitud'] ?? null,
        'fechaAsignacion' => $fila['fechaAsignacion'] ?? null,
        'observaciones' => (string) ($fila['observacionesSolicitud'] ?? ''),
        'candidato' => $candidato,
        'evaluador' => $evaluador,
        'evaluacion' => $evaluacion,
    ];
}
