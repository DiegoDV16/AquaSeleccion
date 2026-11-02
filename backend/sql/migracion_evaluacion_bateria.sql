-- Migracion: datos complementarios de la evaluacion
-- La vista del evaluador ya mostraba estos campos opcionales; se agregan para
-- persistirlos junto con la evaluacion psicolaboral.

ALTER TABLE evaluacion
    ADD COLUMN cargoActual VARCHAR(100) NULL AFTER fechaEvaluacion,
    ADD COLUMN comentarioEntrevista VARCHAR(250) NULL AFTER cargoActual;
