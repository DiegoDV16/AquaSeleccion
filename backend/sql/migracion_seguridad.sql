-- Seguridad: intentos de inicio de sesion y proteccion del historial.
-- La tabla permite limitar intentos fallidos por correo e IP.
-- Los triggers impiden modificar o eliminar movimientos de auditoria.

SET NAMES utf8mb4;

CREATE TABLE IF NOT EXISTS intentos_login (
    idIntento INT NOT NULL AUTO_INCREMENT,
    correo VARCHAR(50) NOT NULL,
    ip VARCHAR(45) NOT NULL,
    exitoso TINYINT(1) NOT NULL DEFAULT 0,
    fecha DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (idIntento),
    INDEX idx_intentos_correo_ip_fecha (correo, ip, fecha),
    INDEX idx_intentos_fecha (fecha)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

DROP TRIGGER IF EXISTS trg_historial_no_update;
CREATE TRIGGER trg_historial_no_update
BEFORE UPDATE ON historialsolicitudes
FOR EACH ROW
SIGNAL SQLSTATE '45000'
SET MESSAGE_TEXT = 'El historial de auditoria es de solo insercion.';
