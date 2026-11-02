-- Migracion del modulo Evaluador
-- El resultado `con_observaciones` ocupa 17 caracteres y la columna original
-- era VARCHAR(15); se amplia para poder persistir todos los resultados.

ALTER TABLE evaluacion
    MODIFY estadoEvaluacion VARCHAR(20) NOT NULL;
