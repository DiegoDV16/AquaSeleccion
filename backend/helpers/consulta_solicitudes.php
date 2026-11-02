<?php

/**
 * consulta_solicitudes.php
 * Consulta base de solicitudes de evaluacion con candidato, cargo, familia,
 * evaluador y evaluacion. La comparten el listado y el detalle.
 */

declare(strict_types=1);

/**
 * Devuelve el SELECT base (sin WHERE ni ORDER BY).
 */
function sqlSolicitudes(): string
{
    return 'SELECT s.idSolicitudEvaluacion AS idSolicitud,
                   s.idCandidato,
                   s.idUsuario AS idEvaluadorUsuario,
                   s.estadoSolicitudEvaluacion AS estado,
                   s.prioridad,
                   s.fechaSolicitud,
                   s.fechaAsignacion,
                   s.Observaciones AS observacionesSolicitud,
                   c.idUsuario AS idUsuarioCandidato,
                   c.nombres,
                   c.apellidoPaterno,
                   c.apellidoMaterno,
                   c.correo,
                   c.telefono,
                   c.curriculumCv,
                   c.fechaSolicitud AS fechaPostulacion,
                   c.observaciones AS observacionesCandidato,
                   ca.idCargo,
                   ca.cargo,
                   fc.idFamiliaCargo,
                   fc.familiaCargo,
                   u.nombres AS evaluadorNombres,
                   u.apellidoPaterno AS evaluadorApellidoPaterno,
                   u.apellidoMaterno AS evaluadorApellidoMaterno,
                   u.correo AS evaluadorCorreo,
                   e.idEvaluacion,
                   e.estadoEvaluacion AS resultadoEvaluacion,
                   e.fechaEvaluacion,
                   e.cargoActual,
                   e.comentarioEntrevista,
                   e.Observacion AS observacionEvaluacion
            FROM solicitudevaluacion s
            INNER JOIN candidato c ON c.idCandidato = s.idCandidato
            INNER JOIN cargo ca ON ca.idCargo = c.idCargo
            INNER JOIN familiacargo fc ON fc.idFamiliaCargo = ca.idFamiliaCargo
            INNER JOIN usuario u ON u.idUsuario = s.idUsuario
            LEFT JOIN evaluacion e ON e.idSolicitudEvaluacion = s.idSolicitudEvaluacion';
}
