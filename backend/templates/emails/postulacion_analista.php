<?php

/**
 * Plantilla HTML del correo de nueva postulación.
 * Variables: $datos, $enlace.
 */

$escapar = static fn ($valor): string => htmlspecialchars((string) $valor, ENT_QUOTES, 'UTF-8');
$nombreCompleto = trim(implode(' ', array_filter([
    $datos['nombres'] ?? '',
    $datos['apellidoPaterno'] ?? '',
    $datos['apellidoMaterno'] ?? '',
])));
$iniciales = strtoupper(mb_substr((string) ($datos['nombres'] ?? '?'), 0, 1) . mb_substr((string) ($datos['apellidoPaterno'] ?? ''), 0, 1));
$comentarios = trim((string) ($datos['observaciones'] ?? ''));
?>
<!doctype html>
<html lang="es">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Nueva postulación</title>
</head>
<body style="margin:0;padding:0;background-color:#eef4f8;font-family:Arial,Helvetica,sans-serif;color:#17324d;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color:#eef4f8;padding:24px 12px;">
        <tr>
            <td align="center">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width:620px;background-color:#ffffff;border:1px solid #d9e4ec;border-radius:12px;overflow:hidden;">
                    <tr>
                        <td style="background-color:#0e3a5d;padding:22px 28px;">
                            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                                <tr>
                                    <td style="color:#ffffff;font-size:18px;font-weight:700;letter-spacing:0.2px;">AquaChile</td>
                                    <td align="right" style="color:#b9dced;font-size:11px;text-transform:uppercase;letter-spacing:1px;">Selección de Talento</td>
                                </tr>
                            </table>
                        </td>
                    </tr>

                    <tr>
                        <td style="padding:26px 28px 10px;">
                            <span style="display:inline-block;padding:5px 10px;border-radius:999px;background-color:#e8f5f8;color:#006973;font-size:11px;font-weight:700;letter-spacing:0.5px;text-transform:uppercase;">Nueva postulación</span>
                            <h1 style="margin:14px 0 8px;font-size:22px;line-height:1.25;color:#0e3a5d;"><?= $escapar($nombreCompleto) ?></h1>
                            <p style="margin:0;color:#5d7183;font-size:14px;line-height:1.6;">Se recibió una nueva postulación y requiere revisión del equipo de Reclutamiento.</p>
                        </td>
                    </tr>

                    <tr>
                        <td style="padding:18px 28px 4px;">
                            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="border:1px solid #e1eaf0;border-radius:10px;border-collapse:separate;overflow:hidden;">
                                <tr>
                                    <td width="38" style="padding:14px 0 14px 16px;vertical-align:top;">
                                        <span style="display:inline-block;width:34px;height:34px;border-radius:50%;background-color:#e8f5f8;color:#0e3a5d;text-align:center;line-height:34px;font-size:12px;font-weight:700;"><?= $escapar($iniciales ?: '?') ?></span>
                                    </td>
                                    <td style="padding:14px 16px 14px 10px;">
                                        <strong style="display:block;color:#0e3a5d;font-size:14px;"><?= $escapar($nombreCompleto) ?></strong>
                                        <span style="display:block;color:#5d7183;font-size:12px;margin-top:3px;"><?= $escapar($datos['correo'] ?? '') ?></span>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>

                    <tr>
                        <td style="padding:12px 28px 0;">
                            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="font-size:13px;line-height:1.5;">
                                <tr>
                                    <td width="34%" style="padding:9px 0;color:#718191;">Cargo</td>
                                    <td style="padding:9px 0;color:#17324d;font-weight:700;"><?= $escapar($datos['cargo'] ?? '-') ?></td>
                                </tr>
                                <tr>
                                    <td style="padding:9px 0;color:#718191;">Familia de cargo</td>
                                    <td style="padding:9px 0;color:#17324d;"><?= $escapar($datos['familia'] ?? '-') ?></td>
                                </tr>
                                <tr>
                                    <td style="padding:9px 0;color:#718191;">Teléfono</td>
                                    <td style="padding:9px 0;color:#17324d;"><?= $escapar($datos['telefono'] ?? '-') ?></td>
                                </tr>
                                <tr>
                                    <td style="padding:9px 0;color:#718191;">Fecha</td>
                                    <td style="padding:9px 0;color:#17324d;"><?= $escapar($datos['fecha'] ?? '-') ?></td>
                                </tr>
                                <tr>
                                    <td style="padding:9px 0;color:#718191;vertical-align:top;">Comentarios</td>
                                    <td style="padding:9px 0;color:#17324d;"><?= $escapar($comentarios !== '' ? $comentarios : 'Sin comentarios adicionales.') ?></td>
                                </tr>
                            </table>
                        </td>
                    </tr>

                    <tr>
                        <td style="padding:20px 28px 28px;">
                            <a href="<?= $escapar($enlace) ?>" style="display:inline-block;background-color:#0e3a5d;color:#ffffff;text-decoration:none;padding:11px 18px;border-radius:7px;font-size:13px;font-weight:700;">Revisar postulación</a>
                            <p style="margin:16px 0 0;color:#8a9aaa;font-size:11px;line-height:1.5;">Este correo fue generado automáticamente por AquaSeleccion. No adjuntes documentos personales en respuestas.</p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
