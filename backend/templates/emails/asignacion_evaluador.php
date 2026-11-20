<?php

/**
 * Plantilla HTML del correo de asignación de evaluación al evaluador.
 * Variables: $datos, $enlace.
 */

$escapar = static fn ($valor): string => htmlspecialchars((string) $valor, ENT_QUOTES, 'UTF-8');
$prioridades = ['baja' => 'Baja', 'normal' => 'Normal', 'alta' => 'Alta'];
$prioridad = $prioridades[$datos['prioridad'] ?? 'normal'] ?? 'Normal';
$candidato = trim((string) ($datos['candidato'] ?? '')) ?: 'Postulante';
$cargo = trim((string) ($datos['cargo'] ?? '')) ?: 'No informado';
$familia = trim((string) ($datos['familia'] ?? '')) ?: 'No informada';
$evaluador = trim((string) ($datos['evaluador'] ?? '')) ?: 'Evaluador';
$idSolicitud = (int) ($datos['idSolicitud'] ?? 0);
$observaciones = trim((string) ($datos['observaciones'] ?? ''));
$filas = [
    'Evaluador asignado' => $evaluador,
    'Candidato' => $candidato,
    'Cargo' => $cargo,
    'Familia de cargo' => $familia,
    'Prioridad' => $prioridad,
    'Fecha de asignación' => $datos['fecha'] ?? '-',
    'Solicitud' => $idSolicitud > 0 ? '#' . $idSolicitud : '-',
    'Observaciones' => $observaciones !== '' ? $observaciones : 'Sin observaciones adicionales.',
];
?>
<!doctype html>
<html lang="es">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Evaluación asignada</title>
</head>
<body style="margin:0;padding:0;background-color:#eef4f8;font-family:Arial,Helvetica,sans-serif;color:#17324d;">
    <div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;">
        Evaluación asignada: <?= $escapar($candidato) ?> · <?= $escapar($cargo) ?> · Prioridad <?= $escapar($prioridad) ?>
    </div>

    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color:#eef4f8;padding:24px 12px;">
        <tr>
            <td align="center">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width:620px;background-color:#ffffff;border:1px solid #d9e4ec;border-radius:12px;overflow:hidden;">
                    <tr>
                        <td style="background-color:#0e3a5d;padding:22px 28px;">
                            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                                <tr>
                                    <td style="color:#ffffff;font-size:18px;font-weight:700;letter-spacing:0.2px;">AquaChile</td>
                                    <td align="right" style="color:#b9dced;font-size:11px;text-transform:uppercase;letter-spacing:1px;">Evaluación psicolaboral</td>
                                </tr>
                            </table>
                        </td>
                    </tr>

                    <tr>
                        <td style="padding:26px 28px 12px;">
                            <span style="display:inline-block;padding:5px 10px;border-radius:999px;background-color:#e8f5f8;color:#006973;font-size:11px;font-weight:700;letter-spacing:0.5px;text-transform:uppercase;">Nueva asignación</span>
                            <h1 style="margin:14px 0 8px;font-size:22px;line-height:1.25;color:#0e3a5d;">Tienes una evaluación asignada</h1>
                            <p style="margin:0;color:#5d7183;font-size:14px;line-height:1.6;">
                                Hola <?= $escapar($evaluador) ?>, se te asignó la evaluación de
                                <strong style="color:#0e3a5d;"><?= $escapar($candidato) ?></strong>
                                para el cargo <strong style="color:#0e3a5d;"><?= $escapar($cargo) ?></strong>.
                            </p>
                        </td>
                    </tr>

                    <tr>
                        <td style="padding:12px 28px 4px;">
                            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="border:1px solid #e1eaf0;border-radius:10px;border-collapse:separate;overflow:hidden;">
                                <tr>
                                    <td colspan="2" style="padding:12px 16px;background-color:#f7fafc;border-bottom:1px solid #e1eaf0;color:#0e3a5d;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:0.6px;">
                                        Datos de la evaluación
                                    </td>
                                </tr>
                                <?php foreach ($filas as $etiqueta => $valor): ?>
                                    <tr>
                                        <td width="38%" style="padding:11px 16px;border-bottom:1px solid #eef3f7;color:#718191;font-size:12px;vertical-align:top;"><?= $escapar($etiqueta) ?></td>
                                        <td style="padding:11px 16px;border-bottom:1px solid #eef3f7;color:#17324d;font-size:13px;font-weight:<?= in_array($etiqueta, ['Candidato', 'Cargo', 'Prioridad'], true) ? '700' : '400' ?>;vertical-align:top;">
                                            <?= $escapar($valor) ?>
                                        </td>
                                    </tr>
                                <?php endforeach; ?>
                            </table>
                        </td>
                    </tr>

                    <tr>
                        <td style="padding:20px 28px 28px;">
                            <a href="<?= $escapar($enlace) ?>" style="display:inline-block;background-color:#0e3a5d;color:#ffffff;text-decoration:none;padding:11px 18px;border-radius:7px;font-size:13px;font-weight:700;">Abrir solicitud asignada</a>
                            <p style="margin:16px 0 0;color:#8a9aaa;font-size:11px;line-height:1.5;">Ingresa con tu cuenta de evaluador. No reenvíes este correo ni compartas los antecedentes del postulante.</p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
