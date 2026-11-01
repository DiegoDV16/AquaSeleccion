<?php

declare(strict_types=1);

require_once __DIR__ . '/conexion.php';
require_once __DIR__ . '/sesion.php';

header('Content-Type: text/html; charset=utf-8');

function destinoFormulario(): string
{
    $referer = $_SERVER['HTTP_REFERER'] ?? '';
    $partes = parse_url($referer);
    $esInterna = !empty($_POST['idUsuario']);

    if (is_array($partes) && isset($partes['scheme'], $partes['host'])) {
        $puerto = isset($partes['port']) ? ':' . $partes['port'] : '';
        $ruta = $partes['path'] ?? '';
        $esInterna = $esInterna || str_contains($ruta, '/admin/');
        $marcador = $esInterna ? '/admin/' : '/postular';
        $posicion = strpos($ruta, $marcador);
        $base = $posicion !== false ? substr($ruta, 0, $posicion) : '';
        $destino = $esInterna ? '/admin/postular-interno' : '/postular';

        return $partes['scheme'] . '://' . $partes['host'] . $puerto . $base . $destino;
    }

    return $esInterna
        ? 'http://localhost:5173/admin/postular-interno'
        : 'http://localhost:5173/postular';
}

function responder(int $estado, string $mensaje): void
{
    http_response_code($estado);
    $mensajeJson = json_encode(
        $mensaje,
        JSON_UNESCAPED_UNICODE | JSON_HEX_TAG | JSON_HEX_AMP | JSON_HEX_APOS | JSON_HEX_QUOT
    );
    $destinoJson = json_encode(destinoFormulario(), JSON_UNESCAPED_SLASHES);

    echo '<!doctype html><html lang="es"><head><meta charset="utf-8"><title>Postulación</title></head><body>';
    echo '<script>alert(' . $mensajeJson . '); window.location.replace(' . $destinoJson . ');</script>';
    echo '</body></html>';
    exit;
}

set_error_handler(static function (int $nivel, string $mensaje, string $archivo, int $linea): bool {
    if (!(error_reporting() & $nivel)) {
        return false;
    }

    throw new ErrorException($mensaje, 0, $nivel, $archivo, $linea);
});

$destinoCv = null;

try {
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    responder(405, 'No se pudo enviar el formulario. Vuelve a la página de postulación e inténtalo nuevamente.');
}

$nombres = trim($_POST['nombres'] ?? '');
$apellidoPaterno = trim($_POST['apellidoPaterno'] ?? '');
$apellidoMaterno = trim($_POST['apellidoMaterno'] ?? '');
$correo = trim($_POST['correo'] ?? '');
$telefono = trim($_POST['telefono'] ?? '');
$observaciones = trim($_POST['observaciones'] ?? '');
$idFamiliaCargo = filter_var($_POST['idFamiliaCargo'] ?? '', FILTER_VALIDATE_INT);
$idCargo = filter_var($_POST['idCargo'] ?? '', FILTER_VALIDATE_INT);
$autorizacion = trim($_POST['autorizacion'] ?? '');
$idUsuarioSolicitado = filter_var($_POST['idUsuario'] ?? '', FILTER_VALIDATE_INT);
$idUsuario = null;

if ($idUsuarioSolicitado !== false && $idUsuarioSolicitado > 0) {
    $sesion = usuarioAutenticado();

    if ($sesion === null || ($sesion['rol_id'] ?? null) !== 'administrador') {
        responder(403, 'No tienes permisos para registrar una postulación interna.');
    }

    $idUsuario = (int) ($sesion['id'] ?? 0);
    if ($idUsuario <= 0) {
        responder(401, 'No se pudo identificar al usuario administrador.');
    }
}

if (
    empty($nombres)
    || empty($apellidoPaterno)
    || empty($apellidoMaterno)
    || empty($correo)
    || empty($telefono)
    || empty($idFamiliaCargo)
    || empty($idCargo)
    || ($idUsuario === null && empty($autorizacion))
) {
    responder(400, 'Completa todos los campos obligatorios y acepta el consentimiento para continuar.');
}

$archivo = $_FILES['curriculumCv'] ?? null;
if (
    !is_array($archivo)
    || !isset($archivo['error'], $archivo['name'], $archivo['tmp_name'], $archivo['size'])
    || $archivo['error'] !== UPLOAD_ERR_OK
) {
    responder(400, 'Adjunta tu currículum antes de enviar la postulación.');
}

if (mb_strlen($nombres, 'UTF-8') > 50) {
    responder(400, 'El nombre no puede superar los 50 caracteres.');
}
if (mb_strlen($apellidoPaterno, 'UTF-8') > 25) {
    responder(400, 'El apellido paterno no puede superar los 25 caracteres.');
}
if (mb_strlen($apellidoMaterno, 'UTF-8') > 25) {
    responder(400, 'El apellido materno no puede superar los 25 caracteres.');
}
if (mb_strlen($correo, 'UTF-8') > 50) {
    responder(400, 'El correo no puede superar los 50 caracteres.');
}
if (mb_strlen($telefono, 'UTF-8') > 15) {
    responder(400, 'El teléfono no puede superar los 15 caracteres.');
}
if (mb_strlen($observaciones, 'UTF-8') > 500) {
    responder(400, 'Las observaciones no pueden superar los 500 caracteres.');
}

if (!filter_var($correo, FILTER_VALIDATE_EMAIL)) {
    responder(400, 'Revisa el correo electrónico; el formato ingresado no parece válido.');
}

if ($idFamiliaCargo === false || $idFamiliaCargo < 1 || $idCargo === false || $idCargo < 1) {
    responder(400, 'Selecciona una familia y un cargo válidos para tu postulación.');
}

$pdo = obtenerConexion();
$consultaCargo = $pdo->prepare(
    'SELECT 1 FROM cargo WHERE idCargo = :idCargo AND idFamiliaCargo = :idFamiliaCargo'
);
$consultaCargo->execute([
    'idCargo' => $idCargo,
    'idFamiliaCargo' => $idFamiliaCargo,
]);
if ($consultaCargo->fetchColumn() === false) {
    responder(400, 'El cargo seleccionado no está disponible en esa familia. Vuelve a elegirlo.');
}

$directorioCv = __DIR__ . '/../uploads/cv';
if (!is_dir($directorioCv) && !mkdir($directorioCv, 0750, true) && !is_dir($directorioCv)) {
    responder(500, 'No se pudo preparar el almacenamiento del currículum. Inténtalo más tarde.');
}

$extensionCv = strtolower(pathinfo($archivo['name'], PATHINFO_EXTENSION));
$mimeCv = strtolower((new finfo(FILEINFO_MIME_TYPE))->file($archivo['tmp_name']));
$tiposCvPermitidos = [
    'pdf' => ['application/pdf'],
    'doc' => ['application/msword', 'application/x-ole-storage', 'application/cdfv2'],
    'docx' => [
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/zip',
        'application/x-zip-compressed',
    ],
];

if (
    !isset($tiposCvPermitidos[$extensionCv])
    || !in_array($mimeCv, $tiposCvPermitidos[$extensionCv], true)
) {
    responder(400, 'El currículum debe ser un PDF o un documento Word (.doc o .docx).');
}

$nombreCv = bin2hex(random_bytes(16)) . '.' . $extensionCv;
$destinoCv = $directorioCv . DIRECTORY_SEPARATOR . $nombreCv;
if (!move_uploaded_file($archivo['tmp_name'], $destinoCv)) {
    responder(500, 'No se pudo guardar el archivo adjunto. Inténtalo nuevamente.');
}

$rutaCv = 'uploads/cv/' . $nombreCv;
$fechaSolicitud = date('Y-m-d');

$stmt = $pdo->prepare(
    'INSERT INTO candidato
        (idUsuario, idCargo, nombres, apellidoPaterno, apellidoMaterno, correo, telefono, curriculumCv, fechaSolicitud, observaciones)
     VALUES
        (:idUsuario, :idCargo, :nombres, :apellidoPaterno, :apellidoMaterno, :correo, :telefono, :curriculumCv, :fechaSolicitud, :observaciones)'
);
if ($idUsuario === null) {
    $stmt->bindValue(':idUsuario', null, PDO::PARAM_NULL);
} else {
    $stmt->bindValue(':idUsuario', $idUsuario, PDO::PARAM_INT);
}
$stmt->bindParam(':idCargo', $idCargo, PDO::PARAM_INT);
$stmt->bindParam(':nombres', $nombres);
$stmt->bindParam(':apellidoPaterno', $apellidoPaterno);
$stmt->bindParam(':apellidoMaterno', $apellidoMaterno);
$stmt->bindParam(':correo', $correo);
$stmt->bindParam(':telefono', $telefono);
$stmt->bindParam(':curriculumCv', $rutaCv);
$stmt->bindParam(':fechaSolicitud', $fechaSolicitud);
$stmt->bindParam(':observaciones', $observaciones);
if (!$stmt->execute() || $stmt->rowCount() !== 1) {
    throw new RuntimeException('La base de datos no confirmó la inserción del candidato.');
}

$idCandidato = $pdo->lastInsertId();
if ($idCandidato === false || $idCandidato === '0' || $idCandidato === '') {
    throw new RuntimeException('La base de datos no devolvió el identificador del candidato.');
}

$fechaSolicitudMostrar = date('d-m-y');

if ($idUsuario !== null) {
    responder(201, "Postulación interna registrada el {$fechaSolicitudMostrar}. Número de seguimiento: {$idCandidato}.");
}

responder(201, "¡Listo! Recibimos tu postulación el {$fechaSolicitudMostrar}. Tu número de seguimiento es {$idCandidato}.");
} catch (Throwable $e) {
    restore_error_handler();

    if ($destinoCv !== null && is_file($destinoCv) && !@unlink($destinoCv)) {
        error_log('No fue posible eliminar el CV tras fallar el registro: ' . $destinoCv);
    }

    error_log($e->getMessage());
    responder(500, 'Ocurrió un problema al registrar tu postulación. Inténtalo nuevamente más tarde.');
}
