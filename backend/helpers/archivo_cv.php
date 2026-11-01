<?php

/**
 * archivo_cv.php
 * Validacion y almacenamiento del curriculum adjunto en las postulaciones
 * internas creadas desde el modulo Analista.
 */

declare(strict_types=1);

const CV_TAMANO_MAXIMO_BYTES = 5 * 1024 * 1024;
const CV_EXTENSIONES_PERMITIDAS = ['pdf', 'doc', 'docx'];

/**
 * Guarda el curriculum si se adjunto. Devuelve null cuando no se envio archivo.
 * Lanza InvalidArgumentException para errores del formulario y RuntimeException
 * para fallos del servidor.
 */
function guardarCurriculum(array $archivo): ?string
{
    $codigo = $archivo['error'] ?? UPLOAD_ERR_NO_FILE;

    if ($codigo === UPLOAD_ERR_NO_FILE) {
        return null;
    }

    if ($codigo !== UPLOAD_ERR_OK) {
        throw new InvalidArgumentException('No se pudo subir el curriculum. Vuelve a intentarlo.');
    }

    $nombreOriginal = (string) ($archivo['name'] ?? '');
    $rutaTemporal = (string) ($archivo['tmp_name'] ?? '');
    $tamano = (int) ($archivo['size'] ?? 0);
    $extension = strtolower(pathinfo($nombreOriginal, PATHINFO_EXTENSION));

    if (mb_strlen($nombreOriginal, 'UTF-8') > 255) {
        throw new InvalidArgumentException('El nombre del archivo no puede superar los 255 caracteres.');
    }

    if (!in_array($extension, CV_EXTENSIONES_PERMITIDAS, true)) {
        throw new InvalidArgumentException('El curriculum debe ser un PDF o un documento Word (.doc o .docx).');
    }

    if ($tamano <= 0 || $tamano > CV_TAMANO_MAXIMO_BYTES) {
        throw new InvalidArgumentException('El curriculum supera el tamano maximo de 5 MB.');
    }

    $mime = strtolower((new finfo(FILEINFO_MIME_TYPE))->file($rutaTemporal) ?: '');
    $mimesPermitidos = [
        'pdf' => ['application/pdf'],
        'doc' => ['application/msword', 'application/x-ole-storage', 'application/cdfv2'],
        'docx' => [
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'application/zip',
            'application/x-zip-compressed',
        ],
    ];

    if (!in_array($mime, $mimesPermitidos[$extension], true)) {
        throw new InvalidArgumentException('El contenido del archivo no corresponde a un curriculum valido.');
    }

    $directorio = __DIR__ . '/../uploads/cv';

    if (!is_dir($directorio) && !mkdir($directorio, 0750, true) && !is_dir($directorio)) {
        throw new RuntimeException('No se pudo preparar el almacenamiento del curriculum.');
    }

    $nombreArchivo = bin2hex(random_bytes(16)) . '.' . $extension;
    $destino = $directorio . DIRECTORY_SEPARATOR . $nombreArchivo;

    if (!move_uploaded_file($rutaTemporal, $destino)) {
        throw new RuntimeException('No se pudo guardar el archivo del curriculum.');
    }

    return 'uploads/cv/' . $nombreArchivo;
}

/**
 * Elimina un curriculum almacenado, solo si la ruta pertenece a uploads/cv.
 */
function eliminarCurriculum(?string $rutaRelativa): void
{
    if ($rutaRelativa === null || $rutaRelativa === '') {
        return;
    }

    $base = realpath(__DIR__ . '/../uploads/cv');
    $ruta = realpath(__DIR__ . '/../' . ltrim($rutaRelativa, '/'));

    if ($base !== false && $ruta !== false && str_starts_with($ruta, $base . DIRECTORY_SEPARATOR) && is_file($ruta)) {
        @unlink($ruta);
    }
}
