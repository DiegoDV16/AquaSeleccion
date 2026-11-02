<?php

/**
 * dashboard.php
 * POST /backend/api/admin/dashboard.php
 * Resumen operativo del panel Administrador calculado desde MySQL.
 */

declare(strict_types=1);

require_once __DIR__ . '/../../config/conexion.php';
require_once __DIR__ . '/../../helpers/autorizacion.php';
require_once __DIR__ . '/../../helpers/consulta_solicitudes.php';
require_once __DIR__ . '/../../helpers/mapeos.php';

requerirPost();
requerirRoles(['administrador', 'jefatura']);

try {
    $pdo = obtenerConexion();

    $candidatos = $pdo->query(
        'SELECT COUNT(*) AS total,
                COALESCE(SUM(idUsuario IS NULL), 0) AS externas,
                COALESCE(SUM(idUsuario IS NOT NULL), 0) AS internas
           FROM candidato'
    )->fetch();

    $porEstadoRaw = $pdo->query(
        'SELECT estadoSolicitudEvaluacion AS estado, COUNT(*) AS total
           FROM solicitudevaluacion
          GROUP BY estadoSolicitudEvaluacion'
    )->fetchAll();

    $conteosEstado = [
        'pendiente' => 0,
        'en_proceso' => 0,
        'finalizada' => 0,
    ];

    foreach ($porEstadoRaw as $fila) {
        $clave = (string) $fila['estado'];
        if (array_key_exists($clave, $conteosEstado)) {
            $conteosEstado[$clave] = (int) $fila['total'];
        }
    }

    $totalSolicitudes = array_sum($conteosEstado);
    $finalizadas = $conteosEstado['finalizada'];
    $pendientes = $conteosEstado['pendiente'];

    $aptos = (int) $pdo->query(
        "SELECT COUNT(*)
           FROM evaluacion e
           INNER JOIN solicitudevaluacion s ON s.idSolicitudEvaluacion = e.idSolicitudEvaluacion
          WHERE s.estadoSolicitudEvaluacion = 'finalizada'
            AND e.estadoEvaluacion = 'apto'"
    )->fetchColumn();

    $usuariosActivos = (int) $pdo->query(
        'SELECT COUNT(*) FROM usuario WHERE estado = 1'
    )->fetchColumn();
    $usuariosTotal = (int) $pdo->query('SELECT COUNT(*) FROM usuario')->fetchColumn();

    $resumen = [
        'total_candidatos' => (int) ($candidatos['total'] ?? 0),
        'externas' => (int) ($candidatos['externas'] ?? 0),
        'internas' => (int) ($candidatos['internas'] ?? 0),
        'solicitudes_total' => $totalSolicitudes,
        'pendientes' => $pendientes,
        'en_proceso' => $conteosEstado['en_proceso'],
        'finalizadas' => $finalizadas,
        'aptos' => $aptos,
        'usuarios_activos' => $usuariosActivos,
        'usuarios_total' => $usuariosTotal,
        'tasa_aprobacion' => $finalizadas > 0 ? (int) round(($aptos / $finalizadas) * 100) : 0,
    ];

    $recientesConsulta = $pdo->query(
        sqlSolicitudes()
        . ' ORDER BY s.fechaSolicitud DESC, s.idSolicitudEvaluacion DESC LIMIT 5'
    );
    $recientes = array_map('normalizarSolicitud', $recientesConsulta->fetchAll());

    $porEstado = [
        ['clave' => 'pendiente', 'nombre' => 'Pendiente', 'total' => $conteosEstado['pendiente']],
        ['clave' => 'en_proceso', 'nombre' => 'En proceso', 'total' => $conteosEstado['en_proceso']],
        ['clave' => 'finalizada', 'nombre' => 'Finalizada', 'total' => $conteosEstado['finalizada']],
    ];

    $porFamilia = $pdo->query(
        'SELECT fc.idFamiliaCargo AS clave,
                fc.familiaCargo AS nombre,
                COUNT(c.idCandidato) AS total
           FROM familiacargo fc
           INNER JOIN cargo ca ON ca.idFamiliaCargo = fc.idFamiliaCargo
           LEFT JOIN candidato c ON c.idCargo = ca.idCargo
          GROUP BY fc.idFamiliaCargo, fc.familiaCargo
         HAVING COUNT(c.idCandidato) > 0
          ORDER BY total DESC, nombre ASC'
    )->fetchAll();

    $topCargos = $pdo->query(
        'SELECT ca.idCargo AS clave,
                ca.cargo AS nombre,
                COUNT(c.idCandidato) AS postulaciones
           FROM cargo ca
           INNER JOIN candidato c ON c.idCargo = ca.idCargo
          GROUP BY ca.idCargo, ca.cargo
          ORDER BY postulaciones DESC, ca.cargo ASC
          LIMIT 5'
    )->fetchAll();

    $porEvaluador = $pdo->query(
        "SELECT u.idUsuario AS clave,
                TRIM(CONCAT_WS(' ', u.nombres, u.apellidoPaterno, u.apellidoMaterno)) AS nombre,
                COUNT(e.idEvaluacion) AS total,
                COALESCE(SUM(e.estadoEvaluacion = 'apto'), 0) AS aptos,
                COALESCE(SUM(e.estadoEvaluacion = 'no_apto'), 0) AS no_aptos,
                COALESCE(SUM(e.estadoEvaluacion = 'con_observaciones'), 0) AS observaciones
           FROM evaluacion e
           INNER JOIN solicitudevaluacion s ON s.idSolicitudEvaluacion = e.idSolicitudEvaluacion
           INNER JOIN usuario u ON u.idUsuario = e.idUsuario
          WHERE s.estadoSolicitudEvaluacion = 'finalizada'
          GROUP BY u.idUsuario, u.nombres, u.apellidoPaterno, u.apellidoMaterno
          ORDER BY total DESC, nombre ASC"
    )->fetchAll();

    $actividad = [];

    $candidatosActividad = $pdo->query(
        'SELECT c.idCandidato,
                c.idUsuario,
                c.nombres,
                c.apellidoPaterno,
                c.apellidoMaterno,
                c.fechaSolicitud,
                ca.cargo
           FROM candidato c
           INNER JOIN cargo ca ON ca.idCargo = c.idCargo
          ORDER BY c.fechaSolicitud DESC, c.idCandidato DESC
          LIMIT 2'
    )->fetchAll();

    foreach ($candidatosActividad as $fila) {
        $nombre = trim(
            (string) $fila['nombres'] . ' ' . (string) $fila['apellidoPaterno'] . ' ' . (string) $fila['apellidoMaterno']
        );
        $fecha = (string) ($fila['fechaSolicitud'] ?? '');
        $esExterna = $fila['idUsuario'] === null;

        $actividad[] = [
            'id' => 'candidato-' . $fila['idCandidato'],
            'titulo' => $esExterna ? 'Nueva postulación externa' : 'Postulación interna registrada',
            'detalle' => $nombre . ' - ' . (string) $fila['cargo'],
            'fecha' => $fecha,
            'orden' => $fecha . ' 00:00:00',
            'icono' => $esExterna ? 'envelope-paper' : 'building-add',
            'tinte' => $esExterna ? 'bg-tint-primary' : 'bg-tint-info',
        ];
    }

    $solicitudesActividad = $pdo->query(
        'SELECT s.idSolicitudEvaluacion,
                s.fechaSolicitud,
                c.nombres,
                c.apellidoPaterno,
                c.apellidoMaterno,
                u.nombres AS evaluadorNombres,
                u.apellidoPaterno AS evaluadorApellidoPaterno
           FROM solicitudevaluacion s
           INNER JOIN candidato c ON c.idCandidato = s.idCandidato
           INNER JOIN usuario u ON u.idUsuario = s.idUsuario
          ORDER BY s.fechaSolicitud DESC, s.idSolicitudEvaluacion DESC
          LIMIT 2'
    )->fetchAll();

    foreach ($solicitudesActividad as $fila) {
        $fecha = (string) ($fila['fechaSolicitud'] ?? '');
        $nombre = trim(
            (string) $fila['nombres'] . ' ' . (string) $fila['apellidoPaterno'] . ' ' . (string) $fila['apellidoMaterno']
        );
        $evaluador = trim((string) $fila['evaluadorNombres'] . ' ' . (string) $fila['evaluadorApellidoPaterno']);
        $codigo = 'SOL-' . str_pad((string) $fila['idSolicitudEvaluacion'], 4, '0', STR_PAD_LEFT);

        $actividad[] = [
            'id' => 'solicitud-' . $fila['idSolicitudEvaluacion'],
            'titulo' => 'Solicitud de evaluación creada',
            'detalle' => $codigo . ' · ' . $nombre . ' · Evaluador: ' . $evaluador,
            'fecha' => $fecha,
            'orden' => $fecha . ' 00:00:00',
            'icono' => 'clipboard2-plus',
            'tinte' => 'bg-tint-info',
        ];
    }

    $evaluacionesActividad = $pdo->query(
        "SELECT e.idEvaluacion,
                e.fechaEvaluacion,
                e.estadoEvaluacion,
                c.nombres,
                c.apellidoPaterno,
                c.apellidoMaterno
           FROM evaluacion e
           INNER JOIN solicitudevaluacion s ON s.idSolicitudEvaluacion = e.idSolicitudEvaluacion
           INNER JOIN candidato c ON c.idCandidato = s.idCandidato
          WHERE s.estadoSolicitudEvaluacion = 'finalizada'
          ORDER BY e.fechaEvaluacion DESC, e.idEvaluacion DESC
          LIMIT 2"
    )->fetchAll();

    $resultados = [
        'apto' => 'Apto',
        'no_apto' => 'No Apto',
        'con_observaciones' => 'Con observaciones',
    ];

    foreach ($evaluacionesActividad as $fila) {
        $fecha = (string) ($fila['fechaEvaluacion'] ?? '');
        $nombre = trim(
            (string) $fila['nombres'] . ' ' . (string) $fila['apellidoPaterno'] . ' ' . (string) $fila['apellidoMaterno']
        );
        $resultado = $resultados[(string) $fila['estadoEvaluacion']] ?? 'Sin resultado';

        $actividad[] = [
            'id' => 'evaluacion-' . $fila['idEvaluacion'],
            'titulo' => 'Evaluación finalizada',
            'detalle' => $nombre . ' · ' . $resultado,
            'fecha' => $fecha,
            'orden' => $fecha . ' 00:00:00',
            'icono' => 'check2-circle',
            'tinte' => 'bg-tint-success',
        ];
    }

    usort($actividad, static function (array $a, array $b): int {
        return strcmp($b['orden'], $a['orden']);
    });

    $actividad = array_slice($actividad, 0, 6);
    foreach ($actividad as &$evento) {
        unset($evento['orden']);
    }
    unset($evento);

    responder([
        'ok' => true,
        'resumen' => $resumen,
        'recientes' => $recientes,
        'actividad' => $actividad,
        'porEstado' => $porEstado,
        'porFamilia' => $porFamilia,
        'topCargos' => $topCargos,
        'porEvaluador' => $porEvaluador,
    ]);
} catch (PDOException $e) {
    error_log('Error al obtener el dashboard administrativo: ' . $e->getMessage());
    responder(['ok' => false, 'mensaje' => 'No fue posible obtener el resumen del panel.'], 500);
}
