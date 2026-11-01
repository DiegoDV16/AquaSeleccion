-- Ajuste de esquema para el modulo Analista (MVP AquaSeleccion).
-- Se ejecuta una vez sobre la base `aquaseleccion`.
-- No elimina ni modifica datos existentes: solo agrega dos columnas utilizadas
-- por la creacion de solicitudes de evaluacion.
--
-- `solicitudevaluacion.idUsuario` representa al evaluador responsable asignado.
-- `fechaSolicitud` conserva la fecha de creacion y `fechaAsignacion` la fecha
-- ingresada por el analista al crear la solicitud.

ALTER TABLE solicitudevaluacion
  ADD COLUMN IF NOT EXISTS prioridad VARCHAR(10) NOT NULL DEFAULT 'normal' AFTER estadoSolicitudEvaluacion,
  ADD COLUMN IF NOT EXISTS fechaAsignacion DATE NULL AFTER fechaSolicitud;
