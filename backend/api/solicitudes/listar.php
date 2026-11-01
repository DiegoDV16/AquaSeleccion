<?php

/**
 * listar.php
 * POST /backend/api/solicitudes/listar.php
 * Lista las solicitudes de evaluacion con filtros opcionales por estado,
 * cargo, evaluador, texto y rango de fecha de solicitud.
 * Solo accesible con sesion activa de Analista de Reclutamiento.
 */

declare(strict_types=1);

require_once __DIR__ . '/../../config/conexion.php';
require_once __DIR__ . '/../../helpers/autorizacion.php';
require_once __DIR__ . '/../../helpers/consulta_solicitudes.php';
require_once __DIR__ . '/../../helpers/mapeos.php';

requerirPost();
requerirRoles(['analista']);

$estadosValidos = ['pendiente', 'en_proceso', 'finalizada'];
$prioridadesValidas = ['baja', 'normal', 'alta'];

$estado = trim((string) ($_POST['estado'] ?? ''));
$prioridad = trim((string) ($_POST['prioridad'] ?? ''));
$texto = trim((string) ($_POST['texto'] ?? ''));
$idCargo = filter_var($_POST['idCargo'] ?? null, FILTER_VALIDATE_INT);
$idEvaluador = filter_var($_POST['idEvaluador'] ?? null, FILTER_VALIDATE_INT);
$fechaDesde = trim((string) ($_POST['fechaDesde'] ?? ''));
$fechaHasta = trim((string) ($_POST['fechaHasta'] ?? ''));

$condiciones = [];
$parametros = [];

if ($estado !== '') {
    if (!in_array($estado, $estadosValidos, true)) {
        responder(['ok' => false, 'mensaje' => 'El estado indicado no es valido.'], 400);
    }
    $condiciones[] = 's.estadoSolicitudEvaluacion = :estado';
    $parametros[':estado'] = $estado;
}

if ($prioridad !== '') {
    if (!in_array($prioridad, $prioridadesValidas, true)) {
        responder(['ok' => false, 'mensaje' => 'La prioridad indicada no es valida.'], 400);
    }
    $condiciones[] = 's.prioridad = :prioridad';
    $parametros[':prioridad'] = $prioridad;
}

if ($idCargo !== false && $idCargo > 0) {
    $condiciones[] = 'c.idCargo = :idCargo';
    $parametros[':idCargo'] = $idCargo;
}

if ($idEvaluador !== false && $idEvaluador > 0) {
    $condiciones[] = 's.idUsuario = :idEvaluador';
    $parametros[':idEvaluador'] = $idEvaluador;
}

if ($texto !== '') {
    if (mb_strlen($texto, 'UTF-8') > 60) {
        responder(['ok' => false, 'mensaje' => 'El texto de busqueda es demasiado largo.'], 400);
    }

    $condiciones[] = '(c.nombres LIKE :texto1
                       OR c.apellidoPaterno LIKE :texto2
                       OR c.apellidoMaterno LIKE :texto3
                       OR c.correo LIKE :texto4
                       OR CAST(s.idSolicitudEvaluacion AS CHAR) LIKE :texto5)';
    $patron = '%' . $texto . '%';
    foreach (range(1, 5) as $indice) {
        $parametros[':texto' . $indice] = $patron;
    }
}

if ($fechaDesde !== '') {
    if (!fechaValida($fechaDesde)) {
        responder(['ok' => false, 'mensaje' => 'La fecha desde no es valida.'], 400);
    }
    $condiciones[] = 's.fechaSolicitud >= :fechaDesde';
    $parametros[':fechaDesde'] = $fechaDesde;
}

if ($fechaHasta !== '') {
    if (!fechaValida($fechaHasta)) {
        responder(['ok' => false, 'mensaje' => 'La fecha hasta no es valida.'], 400);
    }
    $condiciones[] = 's.fechaSolicitud <= :fechaHasta';
    $parametros[':fechaHasta'] = $fechaHasta;
}

try {
    $pdo = obtenerConexion();
    $sql = sqlSolicitudes();

    if ($condiciones !== []) {
        $sql .= ' WHERE ' . implode(' AND ', $condiciones);
    }

    $sql .= ' ORDER BY s.fechaSolicitud DESC, s.idSolicitudEvaluacion DESC';

    $consulta = $pdo->prepare($sql);
    $consulta->execute($parametros);
    $solicitudes = array_map('normalizarSolicitud', $consulta->fetchAll());

    responder(['ok' => true, 'solicitudes' => $solicitudes]);
} catch (PDOException $e) {
    error_log('Error al listar solicitudes: ' . $e->getMessage());
    responder(['ok' => false, 'mensaje' => 'No fue posible obtener el listado de solicitudes.'], 500);
}
