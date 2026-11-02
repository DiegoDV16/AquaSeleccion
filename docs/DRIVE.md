# Drive de documentos del postulante

**Rama:** `feature/drive`  
**Base:** `main`  
**Estado:** análisis y diseño previo a implementación  
**Fecha:** 02-11-2026

---

## 1. Objetivo

Centralizar en un solo lugar todos los documentos asociados a un postulante, sin depender de un único campo `curriculumCv` en la tabla `candidato`.

El módulo debe permitir:

- Subir documentos por tipo.
- Listar los documentos de un candidato.
- Reemplazar o eliminar documentos según permisos.
- Descargar documentos mediante endpoints autenticados.
- Saber qué documentos obligatorios están pendientes.
- Mantener trazabilidad de quién cargó o eliminó cada archivo.

---

## 2. Situación actual del proyecto

Hoy el proyecto solo maneja el currículum:

- `candidato.curriculumCv` guarda una única ruta.
- La postulación pública exige CV.
- La postulación interna permite CV opcional.
- Los archivos se guardan en `backend/uploads/cv`.
- La descarga usa `backend/api/candidatos/descargar_cv.php`.
- La previsualización PDF usa una URL directa al archivo.

Limitaciones:

- No existe una tabla de documentos.
- No se pueden adjuntar títulos, certificados ni referencias.
- No hay estados por documento.
- No hay historial de carga o eliminación.
- El almacenamiento actual está dentro de `htdocs`, por lo que un archivo podría abrirse directamente si se conoce la URL.
- No hay catálogo de documentos obligatorios por cargo.

---

## 3. Requisitos detectados en la documentación

El README y el ERS definen explícitamente:

- Currículum obligatorio en postulación externa.
- Currículum opcional en postulación interna.
- Formatos PDF, DOC y DOCX.
- Tamaño máximo de 5 MB.
- Validación de MIME.
- Nombre aleatorio del archivo.
- Descarga autenticada.
- Datos personales ficticios o anonimizados.
- Separación de funciones por rol.

**No existe todavía una lista aprobada de documentos adicionales.** Por eso el catálogo debe definirse antes de crear la base de datos definitiva.

---

## 4. Propuesta de tipos de documento

| Tipo | Obligatorio | Formatos | Observación |
| --- | --- | --- | --- |
| Currículum Vitae | Sí | PDF, DOC, DOCX | Reemplaza el campo actual |
| Certificado de título o estudios | Según cargo | PDF | Solo para cargos que lo exijan |
| Certificados laborales o referencias | Opcional | PDF | Permite más de un archivo |
| Cédula de identidad | Solo si es legalmente necesario | PDF, JPG, PNG | Dato sensible; evitar por defecto |
| Otros antecedentes | Opcional | PDF | Requiere motivo o aprobación |

### Recomendación

No pedir documentos sensibles “por si acaso”. Cada tipo debe tener:

- Nombre visible.
- Obligatoriedad.
- Formatos permitidos.
- Tamaño máximo.
- Cargos o familias a los que aplica.
- Vigencia o fecha de expiración, si corresponde.

---

## 5. Roles y permisos

| Acción | Postulante público | Analista | Administrador | Evaluador | Jefatura |
| --- | --- | --- | --- | --- | --- |
| Subir documentos | Solo durante su postulación | Sí | Sí | No | No |
| Consultar lista | No tiene portal de seguimiento | Sí | Sí | Solo candidatos asignados | Solo lectura/auditoría |
| Descargar | No | Sí | Sí | Solo candidatos asignados | Según política de auditoría |
| Reemplazar | No después de enviar | Sí | Sí | No | No |
| Eliminar | No | No; solicita al Administrador | Sí, con borrado lógico | No | No |
| Configurar tipos obligatorios | No | No | Sí | No | No |
| Ver historial de cambios | No | Sí | Sí | No | Sí |

### Decisión recomendada

- **Analista:** dueño operativo de los documentos del candidato. Puede subir, listar, descargar y reemplazar.
- **Administrador:** control total, incluyendo eliminar y configurar el catálogo.
- **Evaluador:** solo lectura y descarga de documentos de candidatos con evaluación asignada.
- **Jefatura:** lectura y auditoría; no puede modificar.
- **Postulante público:** solo carga inicial; no puede consultar ni eliminar porque no existe portal de seguimiento.
- **Colaborador:** sin acceso.

El backend debe validar estos permisos; no basta con ocultar botones.

---

## 6. Modelo de datos propuesto

### `tipos_documento`

```text
idTipoDocumento
clave
nombre
descripcion
obligatorio
formatosPermitidos
tamanoMaximoMb
activo
```

### `documentos_candidato`

```text
idDocumento
idCandidato
idTipoDocumento
nombreOriginal
rutaArchivo
mime
tamanoBytes
estado              -- activo / eliminado
idUsuarioCarga
fechaCarga
fechaEliminacion
idUsuarioEliminacion
```

### Reglas

- No guardar archivos como BLOB.
- Guardar una ruta relativa privada.
- Mantener el nombre original solo como metadato.
- Usar nombre físico aleatorio.
- Registrar autor y fecha.
- Borrado lógico para conservar auditoría.

---

## 7. Almacenamiento seguro

No repetir el esquema actual de `backend/uploads/cv` dentro de `htdocs`.

Propuesta:

```text
C:\xampp\aquaseleccion-storage\documentos\<idCandidato>\<archivo-aleatorio>
```

- Fuera del directorio público de Apache.
- Permisos de directorio `750`.
- Archivos `640`.
- Descarga exclusivamente mediante endpoint PHP autenticado.
- Validación de MIME real.
- Límite de tamaño por tipo.
- Sin enlaces directos.
- Sin CV ni documentos en Git.
- Retención y eliminación definidas por AquaChile.

---

## 8. API prevista

```text
GET/POST  backend/api/documentos/listar.php
POST      backend/api/documentos/subir.php
GET/POST  backend/api/documentos/descargar.php
POST      backend/api/documentos/eliminar.php
GET       backend/api/documentos/tipos.php
```

Cada endpoint debe:

- Validar sesión.
- Validar rol.
- Validar que el evaluador tenga asignado al candidato.
- Validar CSRF en mutaciones.
- Responder JSON uniforme.

---

## 9. Interfaz prevista

### Analista / Administrador

En el detalle del candidato:

- Sección **Documentos**.
- Estado de documentos obligatorios.
- Botón **Subir documento**.
- Lista con tipo, nombre, fecha, usuario y acciones.
- Ver, descargar, reemplazar y eliminar según rol.

### Evaluador

En la ficha de la evaluación:

- Documentos en modo solo lectura.
- Solo candidatos asignados.

### Jefatura

- Consulta de metadatos y auditoría.
- Sin acciones de escritura.

### Postulación pública

- Mantener el CV actual como documento inicial.
- Evaluar en una segunda etapa la carga de documentos adicionales, porque el postulante no tiene portal para completarlos después.

---

## 10. Fases de implementación

1. Confirmar catálogo de documentos obligatorios y condicionales.
2. Crear migración de `tipos_documento` y `documentos_candidato`.
3. Implementar almacenamiento privado y endpoints.
4. Integrar la sección Documentos en candidato.
5. Integrar lectura en Evaluador.
6. Definir acceso de Jefatura.
7. Auditar cargas y eliminaciones.
8. Migrar el CV actual al nuevo modelo.
9. Probar permisos, MIME, tamaño y descargas.

---

## 11. Decisiones pendientes

Antes de implementar se debe confirmar:

1. ¿Qué documentos serán obligatorios y para qué cargos?
2. ¿Jefatura puede descargar documentos o solo ver metadatos?
3. ¿El postulante público podrá subir más de un documento?
4. ¿Se permiten imágenes para cédula o solo PDF?
5. ¿Cuánto tiempo se conservan los documentos?
6. ¿Quién puede eliminar definitivamente un documento?
