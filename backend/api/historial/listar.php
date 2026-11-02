<?php

/**
 * listar.php
 * POST /backend/api/historial/listar.php
 * Lista los movimientos reales del historial con filtros de tipo, estado,
 * texto y mes. Solo accesible con sesion de Administrador.
 */

declare(strict_types=1);

require_once __DIR__ . '/../../config/conexion.php';
require_once __DIR__ . '/../../helpers/autorizacion.php';

requerirPost();
requerirRoles(['administrador']);

$tipoGestion = trim((string) ($_POST['tipoGestion'] ?? 'todas'));
$estado = trim((string) ($_POST['estado'] ?? 'todos'));
$texto = trim((string) ($_POST['texto'] ?? ''));
$mes = trim((string) ($_POST['mes'] ?? ''));

if (!in_array($tipoGestion, ['todas', 'externa', 'interna'], true)) {
    responder(['ok' => false, 'mensaje' => 'El tipo de gestion indicado no es valido.'], 400);
}

if (!in_array($estado, ['todos', 'pendiente', 'en_proceso', 'finalizada'], true)) {
    responder(['ok' => false, 'mensaje' => 'El estado indicado no es valido.'], 400);
}

if ($mes !== '' && preg_match('/^\d{4}-(0[1-9]|1[0-2])$/', $mes) !== 1) {
    responder(['ok' => false, 'mensaje' => 'El mes indicado no es valido.'], 400);
}

if (mb_strlen($texto, 'UTF-8') > 80) {
    responder(['ok' => false, 'mensaje' => 'El texto de busqueda es demasiado largo.'], 400);
}

$condiciones = [];
$parametros = [];

if ($tipoGestion !== 'todas') {
    $condiciones[] = 'h.tipoGestion = :tipoGestion';
    $parametros[':tipoGestion'] = $tipoGestion;
}

if ($estado !== 'todos') {
    $condiciones[] = 'h.estado = :estado';
    $parametros[':estado'] = $estado;
}

if ($mes !== '') {
    $condiciones[] = "DATE_FORMAT(h.fechaMovimiento, '%Y-%m') = :mes";
    $parametros[':mes'] = $mes;
}

if ($texto !== '') {
    $condiciones[] = '(c.nombres LIKE :texto1
        OR c.apellidoPaterno LIKE :texto2
        OR c.apellidoMaterno LIKE :texto3
        OR h.accion LIKE :texto4
        OR h.detalle LIKE :texto5
        OR CAST(h.idSolicitudEvaluacion AS CHAR) LIKE :texto6
        OR CONCAT(\'SOL-\', LPAD(h.idSolicitudEvaluacion, 4, \'0\')) LIKE :texto7)';
    $patron = '%' . $texto . '%';
    foreach (range(1, 7) as $indice) {
        $parametros[':texto' . $indice] = $patron;
    }
}

try {
    $pdo = obtenerConexion();
    $sql = "SELECT h.idHistorial AS id,
                   h.idSolicitudEvaluacion,
                   h.tipoGestion,
                   h.accion,
                   h.detalle,
                   h.estado,
                   h.fechaMovimiento,
                   TRIM(CONCAT_WS(' ', c.nombres, c.apellidoPaterno, c.apellidoMaterno)) AS candidato,
                   TRIM(CONCAT_WS(' ', u.nombres, u.apellidoPaterno, u.apellidoMaterno)) AS usuario
              FROM historialsolicitudes h
              INNER JOIN candidato c ON c.idCandidato = h.idCandidato
              LEFT JOIN usuario u ON u.idUsuario = h.idUsuario";

    if ($condiciones !== []) {
        $sql .= ' WHERE ' . implode(' AND ', $condiciones);
    }

    $sql .= ' ORDER BY h.fechaMovimiento DESC, h.idHistorial DESC';

    $consulta = $pdo->prepare($sql);
    $consulta->execute($parametros);
    $filas = $consulta->fetchAll();

    $movimientos = array_map(static function (array $fila): array {
        $idSolicitud = $fila['idSolicitudEvaluacion'] !== null
            ? (int) $fila['idSolicitudEvaluacion']
            : null;

        return [
            'id' => (int) $fila['id'],
            'idSolicitud' => $idSolicitud,
            'solicitud' => $idSolicitud !== null
                ? 'SOL-' . str_pad((string) $idSolicitud, 4, '0', STR_PAD_LEFT)
                : 'Sin solicitud',
            'candidato' => (string) $fila['candidato'],
            'tipoGestion' => (string) $fila['tipoGestion'],
            'accion' => (string) $fila['accion'],
            'detalle' => (string) ($fila['detalle'] ?? ''),
            'usuario' => !empty($fila['usuario']) ? (string) $fila['usuario'] : 'No registrado',
            'estado' => (string) $fila['estado'],
            'fecha' => (string) $fila['fechaMovimiento'],
        ];
    }, $filas);

    responder([
        'ok' => true,
        'movimientos' => $movimientos,
        'total' => count($movimientos),
    ]);
} catch (PDOException $e) {
    error_log('Error al listar historial: ' . $e->getMessage());
    responder(['ok' => false, 'mensaje' => 'No fue posible obtener el historial.'], 500);
}
