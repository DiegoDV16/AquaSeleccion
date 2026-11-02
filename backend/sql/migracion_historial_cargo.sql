-- Agrega el cargo estructurado al historial de auditoria.
-- Se conserva el nombre en `detalle` como respaldo historico, pero se guarda
-- el idCargo para poder cruzar la informacion con el catalogo de cargos.

SET NAMES utf8mb4;

ALTER TABLE historialsolicitudes
    ADD COLUMN idCargo INT NULL AFTER idCandidato,
    ADD CONSTRAINT fkHistorialCargo
        FOREIGN KEY (idCargo) REFERENCES cargo (idCargo)
        ON DELETE SET NULL;

UPDATE historialsolicitudes h
INNER JOIN candidato c ON c.idCandidato = h.idCandidato
SET h.idCargo = c.idCargo
WHERE h.idCargo IS NULL;
