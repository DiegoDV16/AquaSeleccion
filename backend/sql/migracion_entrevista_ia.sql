-- Entrevistas asistidas por IA
-- Guarda la transcripcion y el documento generado para una solicitud asignada.

SET NAMES utf8mb4;

CREATE TABLE IF NOT EXISTS entrevista_ia (
    idEntrevista INT NOT NULL AUTO_INCREMENT,
    idSolicitudEvaluacion INT NOT NULL,
    idCandidato INT NOT NULL,
    idEvaluador INT NOT NULL,
    fechaEntrevista DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    estado VARCHAR(20) NOT NULL DEFAULT 'en_curso',
    consentimiento TINYINT(1) NOT NULL DEFAULT 0,
    transcripcion LONGTEXT NULL,
    documento LONGTEXT NULL,
    fechaActualizacion DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (idEntrevista),
    UNIQUE KEY uq_entrevista_solicitud (idSolicitudEvaluacion),
    KEY idx_entrevista_evaluador (idEvaluador),
    CONSTRAINT fk_entrevista_solicitud
        FOREIGN KEY (idSolicitudEvaluacion) REFERENCES solicitudevaluacion (idSolicitudEvaluacion)
        ON DELETE CASCADE,
    CONSTRAINT fk_entrevista_candidato
        FOREIGN KEY (idCandidato) REFERENCES candidato (idCandidato)
        ON DELETE CASCADE,
    CONSTRAINT fk_entrevista_evaluador
        FOREIGN KEY (idEvaluador) REFERENCES usuario (idUsuario)
        ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
