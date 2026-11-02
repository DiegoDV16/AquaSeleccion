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

---

## 12. Contraste con los documentos originales del MVP

Se revisaron los documentos originales:

- `Caso_DSY1104_FullStackII_MVP_Evaluacion_Psicolaboral_AquaChile.docx`
- `Anexo_Requerimiento_MVP_Evaluacion_Psicolaboral_AquaChile_FullStack II.pdf`

### 12.1 Alcance funcional original

Los requerimientos funcionales del MVP son:

| Código | Requerimiento | Prioridad |
| --- | --- | --- |
| RF01 | Ingreso con usuarios ficticios o roles simulados | Alta |
| RF02 | Registrar candidatos con datos mínimos | Alta |
| RF03 | Editar y consultar candidatos | Alta |
| RF04 | Crear solicitudes asociadas a un candidato | Alta |
| RF05 | Registrar cargo, familia, fecha y responsable | Alta |
| RF06 | Listar y consultar solicitudes | Alta |
| RF07 | Buscar o filtrar solicitudes | Media |
| RF08 | Actualizar estado de la solicitud | Alta |
| RF09 | Registrar fecha, observaciones o resultado | Alta |
| RF10 | Mostrar dashboard simple | Media |

**No existe un requerimiento funcional de gestión de documentos, carga múltiple de archivos ni Drive del postulante.**

El caso original tampoco exige currículum. El proyecto lo agregó como mejora acotada, pero no debe convertirse en un repositorio de documentos reales.

### 12.2 Restricciones explícitas de privacidad

El caso original indica:

- No usar nombres, RUT, teléfonos, correos, **currículums**, informes ni antecedentes reales.
- No publicar información interna de AquaChile en repositorios, videos, capturas o presentaciones.
- Usar registros ficticios, anonimizados o simulados durante todo el desarrollo y la demostración.
- No usar credenciales, bases productivas ni sistemas internos.

Por lo tanto, un Drive para documentos reales de postulantes **no corresponde al MVP académico**.

### 12.3 Funcionalidades fuera del alcance

El anexo declara fuera del alcance obligatorio:

- Integración con Microsoft Copilot.
- Power Automate.
- Microsoft Planner.
- Automatización corporativa de OneDrive o SharePoint.
- Generación automática de informes con IA.
- Integraciones que requieran licencias o credenciales corporativas.
- Microservicios o infraestructura distribuida.

El Drive de documentos se acerca más a una evolución tipo OneDrive/SharePoint que a un requisito del MVP.

### 12.4 Roles según los documentos originales

| Rol original | Función |
| --- | --- |
| Administrador académico | Configura usuarios ficticios, roles, catálogos y datos de prueba |
| Analista de Reclutamiento | Registra candidatos, crea solicitudes, consulta y filtra |
| Profesional Evaluador | Consulta solicitudes asignadas y registra la evaluación |
| Jefatura o contraparte simulada | Consulta dashboard y listados en modo lectura |

El rol de **postulante público** no aparece en el alcance original; fue una ampliación del proyecto. Por eso tampoco existe un portal de seguimiento para él.

### 12.5 Implicancias para `feature/drive`

- El Drive es una **mejora fuera del MVP obligatorio**, no un requisito de la rúbrica.
- No se deben cargar documentos reales de postulantes.
- Si se implementa con fines demostrativos, solo debe usar archivos ficticios claramente identificados.
- No se deben definir documentos obligatorios por cargo sin validación de AquaChile.
- La rama debe mantenerse como diseño/experimento hasta que el equipo confirme el alcance.
- No se debe integrar a `main` como si fuera parte del MVP sin justificarlo.

### 12.6 Recomendación

Priorizar los requerimientos RF01–RF10 y la rúbrica del frontend. El Drive puede quedar como:

1. Documento de evolución futura.
2. Prototipo académico con archivos ficticios.
3. Módulo separado que no se presente como funcionalidad oficial del MVP.

Si se decide implementar, la primera versión debería limitarse a:

- Catálogo ficticio de tipos.
- Archivos de ejemplo anonimizados.
- Metadatos y permisos.
- Sin documentos personales reales.
- Sin integración con almacenamiento corporativo.
