-- Migracion del rol Jefatura
-- Perfil de supervision y auditoria con acceso de solo lectura.

SET NAMES utf8mb4;

INSERT INTO rol (idRol, rol)
VALUES (5, 'Jefatura')
ON DUPLICATE KEY UPDATE rol = VALUES(rol);
