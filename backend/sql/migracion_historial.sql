-- Migracion del historial de solicitudes
-- Registra los movimientos del ciclo de vida y carga los datos existentes.

SET NAMES utf8mb4;

CREATE TABLE IF NOT EXISTS historialsolicitudes (
    idHistorial INT NOT NULL AUTO_INCREMENT,
    idSolicitudEvaluacion INT NULL,
    idCandidato INT NOT NULL,
    tipoGestion VARCHAR(10) NOT NULL,
    accion VARCHAR(100) NOT NULL,
    detalle VARCHAR(250) NULL,
    idUsuario INT NULL,
    estado VARCHAR(15) NOT NULL,
    fechaMovimiento DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (idHistorial),
    KEY idxHistorialFecha (fechaMovimiento),
    KEY idxHistorialTipo (tipoGestion),
    KEY idxHistorialEstado (estado),
    CONSTRAINT fkHistorialSolicitud
        FOREIGN KEY (idSolicitudEvaluacion) REFERENCES solicitudevaluacion (idSolicitudEvaluacion)
        ON DELETE SET NULL,
    CONSTRAINT fkHistorialCandidato
        FOREIGN KEY (idCandidato) REFERENCES candidato (idCandidato)
        ON DELETE CASCADE,
    CONSTRAINT fkHistorialUsuario
        FOREIGN KEY (idUsuario) REFERENCES usuario (idUsuario)
        ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO historialsolicitudes
    (idSolicitudEvaluacion, idCandidato, tipoGestion, accion, detalle, idUsuario, estado, fechaMovimiento)
SELECT
    NULL,
    c.idCandidato,
    CASE WHEN c.idUsuario IS NULL THEN 'externa' ELSE 'interna' END,
    CASE WHEN c.idUsuario IS NULL THEN 'Postulación externa registrada' ELSE 'Postulación interna registrada' END,
    CONCAT('Cargo: ', ca.cargo),
    NULL,
    'pendiente',
    TIMESTAMP(c.fechaSolicitud, '09:00:00')
FROM candidato c
INNER JOIN cargo ca ON ca.idCargo = c.idCargo
WHERE c.fechaSolicitud IS NOT NULL
  AND NOT EXISTS (
      SELECT 1
        FROM historialsolicitudes h
       WHERE h.idCandidato = c.idCandidato
         AND h.idSolicitudEvaluacion IS NULL
         AND h.accion LIKE 'Postulación%'
  );

INSERT INTO historialsolicitudes
    (idSolicitudEvaluacion, idCandidato, tipoGestion, accion, detalle, idUsuario, estado, fechaMovimiento)
SELECT
    s.idSolicitudEvaluacion,
    s.idCandidato,
    CASE WHEN c.idUsuario IS NULL THEN 'externa' ELSE 'interna' END,
    'Solicitud de evaluación creada',
    CONCAT(
        'Asignada a ',
        TRIM(CONCAT(u.nombres, ' ', u.apellidoPaterno)),
        ' · Prioridad ',
        s.prioridad,
        '.'
    ),
    NULL,
    'pendiente',
    TIMESTAMP(s.fechaSolicitud, '10:00:00')
FROM solicitudevaluacion s
INNER JOIN candidato c ON c.idCandidato = s.idCandidato
INNER JOIN usuario u ON u.idUsuario = s.idUsuario
WHERE s.fechaSolicitud IS NOT NULL
  AND NOT EXISTS (
      SELECT 1
        FROM historialsolicitudes h
       WHERE h.idSolicitudEvaluacion = s.idSolicitudEvaluacion
         AND h.accion = 'Solicitud de evaluación creada'
  );

INSERT INTO historialsolicitudes
    (idSolicitudEvaluacion, idCandidato, tipoGestion, accion, detalle, idUsuario, estado, fechaMovimiento)
SELECT
    s.idSolicitudEvaluacion,
    s.idCandidato,
    CASE WHEN c.idUsuario IS NULL THEN 'externa' ELSE 'interna' END,
    'Evaluación finalizada',
    CONCAT(
        'Resultado: ',
        CASE e.estadoEvaluacion
            WHEN 'apto' THEN 'Apto'
            WHEN 'no_apto' THEN 'No Apto'
            WHEN 'con_observaciones' THEN 'Con observaciones'
            ELSE e.estadoEvaluacion
        END,
        '.'
    ),
    e.idUsuario,
    'finalizada',
    CASE
        WHEN e.fechaEvaluacion >= '1000-01-01'
            THEN TIMESTAMP(e.fechaEvaluacion, '16:00:00')
        ELSE TIMESTAMP(s.fechaSolicitud, '16:00:00')
    END
FROM evaluacion e
INNER JOIN solicitudevaluacion s ON s.idSolicitudEvaluacion = e.idSolicitudEvaluacion
INNER JOIN candidato c ON c.idCandidato = s.idCandidato
WHERE s.estadoSolicitudEvaluacion = 'finalizada'
  AND NOT EXISTS (
      SELECT 1
        FROM historialsolicitudes h
       WHERE h.idSolicitudEvaluacion = s.idSolicitudEvaluacion
         AND h.accion = 'Evaluación finalizada'
  );
