<?php
session_start();
require_once __DIR__ . '/conexion.php';

if (
    empty($_POST['fechaSolicitud'])
    || empty($_POST['nombres'])
    || empty($_POST['apellidoPaterno'])
    || empty($_POST['apellidoMaterno'])
    || empty($_POST['correo'])
    || empty($_POST['telefono'])
    || empty($_POST['idFamiliaCargo'])
    || empty($_POST['idCargo'])
    || empty($_POST['autorizacion'])
    || empty($_FILES['curriculumCv']['name'])
    || $_FILES['curriculumCv']['error'] !== UPLOAD_ERR_OK
) {
    echo 'Faltan datos obligatorios o no se recibió correctamente el archivo curriculumCv.';
    exit;
}

$fechaSolicitud = trim($_POST['fechaSolicitud']);
$nombres = trim($_POST['nombres']);
$apellidoPaterno = trim($_POST['apellidoPaterno']);
$apellidoMaterno = trim($_POST['apellidoMaterno']);
$correo = trim($_POST['correo']);
$telefono = trim($_POST['telefono']);
$idFamiliaCargo = trim($_POST['idFamiliaCargo']);
$idCargo = trim($_POST['idCargo']);
$autorizacion = trim($_POST['autorizacion']);
$archivo = $_FILES['curriculumCv'];

echo "Fecha de solicitud: " . htmlspecialchars($fechaSolicitud, ENT_QUOTES, 'UTF-8') . "<br>";
echo "Nombres: " . htmlspecialchars($nombres, ENT_QUOTES, 'UTF-8') . "<br>";
echo "Apellido Paterno: " . htmlspecialchars($apellidoPaterno, ENT_QUOTES, 'UTF-8') . "<br>";
echo "Apellido Materno: " . htmlspecialchars($apellidoMaterno, ENT_QUOTES, 'UTF-8') . "<br>";
echo "Correo: " . htmlspecialchars($correo, ENT_QUOTES, 'UTF-8') . "<br>";
echo "Teléfono: " . htmlspecialchars($telefono, ENT_QUOTES, 'UTF-8') . "<br>";
echo "ID Familia Cargo: " . htmlspecialchars($idFamiliaCargo, ENT_QUOTES, 'UTF-8') . "<br>";
echo "ID Cargo: " . htmlspecialchars($idCargo, ENT_QUOTES, 'UTF-8') . "<br>";
echo "Autorización: " . htmlspecialchars($autorizacion, ENT_QUOTES, 'UTF-8') . "<br>";
echo "CV: " . htmlspecialchars($archivo['name'], ENT_QUOTES, 'UTF-8') . " (" . (int) $archivo['size'] . " bytes)";