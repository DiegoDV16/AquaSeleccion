<?php

declare(strict_types=1);

require_once __DIR__ . '/conexion.php';

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode([
        'ok' => false,
        'mensaje' => 'Este servicio solo acepta solicitudes GET.',
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

try {
    $consulta = obtenerConexion()->query(
        'SELECT
            fc.idFamiliaCargo,
            fc.familiaCargo,
            c.idCargo,
            c.cargo
         FROM familiacargo AS fc
         LEFT JOIN cargo AS c ON c.idFamiliaCargo = fc.idFamiliaCargo
         ORDER BY fc.familiaCargo, c.cargo'
    );

    $familias = [];
    foreach ($consulta->fetchAll() as $fila) {
        $idFamilia = (int) $fila['idFamiliaCargo'];
        if (!isset($familias[$idFamilia])) {
            $familias[$idFamilia] = [
                'id' => $idFamilia,
                'nombre' => $fila['familiaCargo'],
                'cargos' => [],
            ];
        }

        if ($fila['idCargo'] !== null) {
            $familias[$idFamilia]['cargos'][] = [
                'id' => (int) $fila['idCargo'],
                'nombre' => $fila['cargo'],
            ];
        }
    }

    echo json_encode([
        'ok' => true,
        'familias' => array_values($familias),
    ], JSON_UNESCAPED_UNICODE);
} catch (PDOException $e) {
    error_log($e->getMessage());
    http_response_code(500);
    echo json_encode([
        'ok' => false,
        'mensaje' => 'No fue posible cargar las familias y cargos.',
    ], JSON_UNESCAPED_UNICODE);
}
