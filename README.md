# AquaSeleccion

Sistema de Gestión de Evaluaciones Psicolaborales y Reclutamiento para **Empresas AquaChile S.A.**

El proyecto es un monolito con frontend SPA en React y backend PHP sobre MySQL. Cubre el flujo de postulación externa e interna, la gestión de usuarios, la asignación de evaluaciones psicolaborales y la trazabilidad de las solicitudes.

- **Versión actual:** `0.1.0` (MVP)
- **Repositorio:** https://github.com/DiegoDV16/AquaSeleccion
- **Rama principal:** `main`
- **Estrategia de ramas:** ver [`docs/ESTRATEGIA-RAMAS.md`](docs/ESTRATEGIA-RAMAS.md)

---

## 1. Funcionalidades

### Portal público
- Formulario de postulación externa en `/postular`.
- Datos personales, selección dependiente **Familia de cargo → Cargo**, carga de currículum y consentimiento de tratamiento de datos.
- Confirmación con número de seguimiento del candidato.

### Módulo Administrador
- Dashboard con métricas de postulaciones y evaluaciones.
- Listado de candidatos con previsualización y descarga del CV.
- Registro de postulaciones internas mediante un modal, con CV opcional.
- CRUD de usuarios del sistema (crear, editar, eliminar, activar/inactivar).
- Historial y trazabilidad de solicitudes.

### Módulo Jefatura
- Panel de resoluciones con indicadores globales y evaluaciones finalizadas por evaluador.
- Consulta de usuarios del sistema en modo solo lectura.
- Historial y auditoría con filtros y exportación CSV, sin permisos de modificación.

### Módulo Analista de Reclutamiento
- Registro de postulaciones internas con CV opcional y edición de candidatos, con listado, detalle y previsualización/descarga del CV.
- Creación, listado, filtros y detalle de solicitudes de evaluación.
- Asignación de un evaluador responsable y de la prioridad del proceso.

### Módulo Profesional Evaluador
- Bandeja con las solicitudes asignadas al evaluador autenticado.
- Formulario de evaluación psicolaboral: fecha, resultado, estado y observaciones.
- Guardado de borrador o finalización de la evaluación.

### Autenticación
- Login institucional por correo y contraseña.
- Sesión PHP en el servidor; el rol determina automáticamente el módulo de destino.
- Rutas protegidas por rol en el frontend y validación de permisos en los endpoints PHP.

---

## 2. Stack y versiones

### Entorno verificado

| Componente | Versión |
| --- | --- |
| Node.js | `24.20.0` |
| npm | `12.2.1` |
| PHP | `8.2.12` |
| Servidor web | Apache (XAMPP) |
| Base de datos | MySQL/MariaDB de XAMPP, puerto `3306`, base `aquaseleccion` |

### Dependencias del frontend

| Dependencia | Declarada en `package.json` | Instalada |
| --- | --- | --- |
| React | `^18.3.1` | `18.3.1` |
| React DOM | `^18.3.1` | `18.3.1` |
| React Router DOM | `^6.28.0` | `6.30.6` |
| Bootstrap | `^5.3.3` | `5.3.8` |
| Bootstrap Icons | `^1.11.3` | `1.13.1` |
| Vite | `^8.3.5` | `8.3.5` |
| `@vitejs/plugin-react` | `^6.1.2` | `6.1.2` |
| ESLint | `^9.15.0` | `9.39.5` |
| `@eslint/js` | `^9.15.0` | `9.39.5` |
| `eslint-plugin-react-hooks` | `^5.0.0` | `5.2.0` |
| `eslint-plugin-react-refresh` | `^0.4.14` | `0.4.26` |
| `globals` | `^15.12.0` | `15.15.0` |
| Vitest | `^5.0.5` | `5.0.5` |

### Backend
- PHP 8.2 con PDO y `declare(strict_types=1)`.
- MySQL/MariaDB.
- Autenticación con `password_hash` / `password_verify` y sesiones nativas de PHP.
- Sin framework PHP ni ORM.

---

## 3. Estructura del proyecto

```text
AquaSeleccion/
├── backend/
│   ├── api/
│   │   ├── auth/           login.php, logout.php, session.php
│   │   ├── candidatos/     listar.php, crear.php, actualizar.php, cv.php, descargar_cv.php
│   │   ├── evaluaciones/   listar.php, detalle.php, guardar.php
│   │   ├── historial/      listar.php
│   │   ├── solicitudes/    listar.php, crear.php, detalle.php, evaluadores.php
│   │   └── usuarios/       listar.php, c_usuario.php, u_usuario.php, d_usuario.php
│   ├── config/             conexión, sesión, roles, catálogos y controlador de candidato
│   ├── helpers/            respuesta JSON, permisos, mapeos y validaciones
│   ├── sql/                ajustes de esquema del MVP
│   └── uploads/cv/         currículums almacenados
├── docs/                   documentación y estrategia de ramas
├── src/
│   ├── components/         layout y componentes UI reutilizables
│   ├── context/            autenticación y sesión
│   ├── mock/               datos simulados de módulos aún no persistidos
│   ├── pages/              vistas por módulo
│   ├── routes/             router y guardas de acceso
│   └── services/           cliente HTTP y APIs
├── index.html
├── package.json
└── vite.config.js
```

---

## 4. Instalación y ejecución

### Requisitos
- XAMPP con Apache y MySQL/MariaDB iniciados.
- Node.js y npm.
- El proyecto debe ubicarse en `C:\xampp\htdocs\AquaSeleccion`, porque el frontend y el proxy usan esa ruta.

### Pasos

```bash
npm install
```

1. Crear la base de datos `aquaseleccion` en MySQL.
2. Crear las tablas utilizadas por el backend: `rol`, `usuario`, `familiacargo`, `cargo`, `candidato`, `solicitudevaluacion` y `evaluacion`.
3. Aplicar el ajuste de esquema del módulo Analista (prioridad y fecha de asignación):

```bash
mysql -u root aquaseleccion < backend/sql/2026-11-01_analista.sql
```

4. Aplicar las migraciones del módulo Evaluador:

```bash
mysql -u root aquaseleccion < backend/sql/migracion_evaluacion.sql
mysql -u root aquaseleccion < backend/sql/migracion_evaluacion_bateria.sql
```

5. Crear y poblar la tabla de historial:

```bash
mysql -u root aquaseleccion < backend/sql/migracion_historial.sql
mysql -u root aquaseleccion < backend/sql/migracion_historial_cargo.sql
```

6. Crear el rol Jefatura:

```bash
mysql -u root aquaseleccion < backend/sql/migracion_jefatura.sql
```

7. Copiar la plantilla de conexión:

```bash
cp backend/config/conexion.example.php backend/config/conexion.php
```

8. Ajustar las credenciales en `backend/config/conexion.php` si es necesario.
9. Verificar que Apache sirva el proyecto en `http://localhost/AquaSeleccion`.
10. Iniciar el frontend:

```bash
npm run dev
```

- Frontend: `http://localhost:5173`
- Postulación pública: `http://localhost:5173/postular`
- Login: `http://localhost:5173/login`
- Backend: `http://localhost/AquaSeleccion/backend`

### Scripts disponibles

| Comando | Descripción |
| --- | --- |
| `npm run dev` | Servidor de desarrollo Vite en el puerto 5173 |
| `npm run build` | Compilación de producción |
| `npm run preview` | Previsualización de la compilación |
| `npm run lint` | Análisis estático con ESLint |

> Vitest está instalado, pero actualmente no existen scripts ni archivos de pruebas en el repositorio.

---

## 5. Reglas de negocio actuales

### 5.1 Roles y permisos

| ID | Rol | Acceso |
| --- | --- | --- |
| 1 | Administrador | `/admin/dashboard`, candidatos, usuarios e historial |
| 2 | Analista de Reclutamiento | Candidatos, solicitudes y creación de solicitudes |
| 3 | Profesional Evaluador | Solo las solicitudes asignadas a su usuario |
| 4 | Colaborador | Sin acceso a módulos de gestión; puede ser postulante interno |
| 5 | Jefatura | Solo lectura de indicadores, usuarios e historial |

Reglas:
- El rol se obtiene desde la base de datos al iniciar sesión; el usuario no puede elegir módulo.
- Un usuario con rol sin módulo asignado (por ejemplo, Colaborador) no puede iniciar sesión en la plataforma.
- Las rutas del frontend están protegidas por rol y los endpoints de lectura validan la sesión; las mutaciones de usuarios siguen reservadas al Administrador.
- Cada usuario tiene un rol único y un estado `activo` o `inactivo`.

### 5.2 Autenticación y sesión

- El correo debe existir en la tabla `usuario`.
- El usuario debe estar activo (`estado = 1`); si está inactivo, se rechaza el acceso.
- La contraseña se valida con `password_verify` contra el hash almacenado.
- Al iniciar sesión se regenera el ID de sesión.
- La sesión PHP es la única fuente de verdad; al recargar la página se restaura consultando `session.php`.
- La cookie de sesión es `HttpOnly` y `SameSite=Lax`.
- El cierre de sesión destruye la sesión en el servidor y elimina la cookie.
- No existe actualmente recuperación de contraseña; el enlace es solo visual.

### 5.3 Postulación externa

- Disponible públicamente en `/postular`, sin autenticación.
- Campos obligatorios: nombres, apellido paterno, apellido materno, correo, teléfono, familia de cargo, cargo, currículum y autorización de tratamiento de datos.
- Largos máximos validados en backend:
  - Nombres: 50 caracteres.
  - Apellido paterno: 25 caracteres.
  - Apellido materno: 25 caracteres.
  - Correo: 50 caracteres.
  - Teléfono: 15 caracteres.
  - Observaciones: 500 caracteres.
- El correo debe tener formato válido.
- El cargo seleccionado debe pertenecer a la familia seleccionada.
- El currículum es obligatorio y debe ser `.pdf`, `.doc` o `.docx`.
- El archivo se valida por extensión y tipo MIME real.
- Tamaño máximo de archivo: 5 MB; nombre de archivo máximo: 255 caracteres.
- El archivo se guarda con un nombre aleatorio en `backend/uploads/cv`.
- Si falla el registro en base de datos, el archivo subido se elimina.
- La postulación se registra como candidato externo (`idUsuario = NULL`) con fecha de solicitud y número de seguimiento.
- La autorización de tratamiento de datos es obligatoria, conforme a la Ley N° 19.628.
- Al finalizar se muestra un mensaje con el número de seguimiento y se redirige al formulario.

### 5.4 Postulación interna

- Puede registrarla un usuario autenticado con rol **Administrador**.
- Se accede desde **Administrador → Candidatos → Nueva postulación interna**, que abre un modal.
- El formulario consume `backend/api/candidatos/crear.php` en formato multipart; la fecha de registro se toma del sistema y es de solo lectura.
- La postulación queda asociada al usuario que la registra y se identifica como interna.
- El currículum es opcional: admite PDF, DOC o DOCX de hasta 5 MB.
- El formulario permite observaciones de hasta 500 caracteres.
- Ya no existe una página de postulación directa en `/admin/postular-interno`; el alta se realiza desde el modal de Candidatos.

### 5.5 Gestión de usuarios

- Solo el Administrador puede listar, crear, editar y eliminar usuarios.
- Para crear un usuario son obligatorios: rol, nombres, apellido paterno, correo y contraseña.
- El correo debe ser válido y único en el sistema.
- La contraseña se almacena siempre como hash.
- En la edición, si el campo contraseña queda vacío, la contraseña actual no cambia.
- El estado se normaliza a `1` (activo) o `0` (inactivo).
- Un administrador no puede eliminar su propio usuario.
- La interfaz permite asignar los roles Administrador, Analista, Evaluador y Jefatura; el rol Colaborador se reserva para empleados sin acceso.
- Las operaciones requieren sesión activa de Administrador; sin sesión responden `401` y con otro rol `403`.

### 5.6 Candidatos

- Un candidato puede originarse por postulación externa o interna.
- El origen se distingue por el tipo de postulación (`externa` / `interna`).
- El Analista registra postulaciones internas manualmente y puede adjuntar el CV (opcional); el Administrador mantiene la postulación interna desde su módulo.
- La postulación interna registrada por el Analista queda vinculada al usuario de la sesión (`candidato.idUsuario`), por lo que el origen se muestra como interna.
- Los candidatos externos pueden tener currículum adjunto; las postulaciones internas pueden respaldarse con el CV cargado o con el legajo del colaborador.
- El estado del candidato se deriva de su última solicitud y evaluación: `pendiente`, `en_proceso`, `apto`, `no_apto` o `con_observaciones`.
- El CV se previsualiza desde el archivo almacenado en el servidor: PDF en un visor integrado y DOCX convertido a HTML. Los `.doc` antiguos no se previsualizan, pero se pueden descargar. La descarga se hace mediante un endpoint autenticado y conserva el nombre `CV_<id>`.

### 5.7 Solicitudes de evaluación

- Una solicitud vincula un candidato con un evaluador responsable y un cargo.
- Estados posibles:
  - `pendiente`: creada y asignada, aún no iniciada.
  - `en_proceso`: evaluación en curso.
  - `finalizada`: proceso cerrado.
- Resultados posibles, solo al finalizar:
  - `apto`
  - `no_apto`
  - `con_observaciones`
- Prioridades: `baja`, `normal`, `alta`.
- La solicitud se persiste en MySQL: `solicitudevaluacion.idUsuario` identifica al evaluador asignado, `fechaSolicitud` la creación y `fechaAsignacion` se registra automáticamente con la fecha del sistema.
- En una postulación interna, `candidato.idUsuario` es el colaborador postulado; `solicitudevaluacion.idUsuario` es el evaluador asignado, que siempre debe tener rol Evaluador y estado activo.
- El analista que crea la solicitud se obtiene de la sesión PHP; esta entrega no lo persiste en `solicitudevaluacion`.
- Un candidato no puede tener más de una solicitud en estado `pendiente` o `en_proceso`.
- Al crear una solicitud desde el módulo Analista, queda en estado `pendiente` hasta que el evaluador inicie el proceso.
- Cada solicitud debe tener un candidato y un evaluador responsable; la fecha de asignación se registra automáticamente con la fecha del sistema.
- El evaluador solo ve las solicitudes cuyo `evaluador_id` coincide con su usuario.
- Para finalizar una evaluación se exige fecha de evaluación, resultado y observaciones de al menos 20 caracteres.
- El evaluador guarda un borrador en estado `en_proceso`; al finalizar, la solicitud pasa a `finalizada` y el resultado solo se expone cuando está cerrada.
- El módulo Evaluador usa endpoints propios en `backend/api/evaluaciones/`; el listado y el detalle filtran siempre por el evaluador de la sesión.
- La evaluación admite antecedentes de entrevista opcionales: cargo actual o de referencia y comentario del evaluador. No son una batería de tests psicométricos.
- Las observaciones se limitan a 250 caracteres; `estadoEvaluacion` se amplió a `VARCHAR(20)` para almacenar `con_observaciones`.
- Una solicitud finalizada queda en modo solo lectura; para editarla debe cambiarse el estado del proceso.
- La trazabilidad se guarda en `historialsolicitudes` y se consulta desde el módulo Administrador.

### 5.8 Trazabilidad

- Cada movimiento del historial registra: solicitud, candidato, tipo de gestión, acción, detalle, usuario que ejecutó la acción, estado y fecha.
- Tipos de gestión: `externa` e `interna`.
- Los movimientos guardan el `idCargo` y el nombre del cargo como respaldo histórico, además del candidato y usuario.
- El historial permite filtrar por tipo, estado, texto (ID de solicitud o candidato) y mes.
- Los movimientos se registran al crear solicitudes y al iniciar, guardar borrador o finalizar una evaluación.
- El botón **Exportar CSV** descarga los movimientos que coinciden con los filtros actuales, con codificación UTF-8 para Excel.

### 5.9 Catálogos de cargos

- Los cargos se agrupan por familia de cargo.
- El formulario de postulación carga familias y cargos desde `c_listaCargosDisponibles.php`.
- La selección de cargo depende de la familia elegida; al cambiar de familia se limpia el cargo.
- En los datos simulados solo se muestran cargos con estado `activo`; el endpoint actual devuelve las familias con sus cargos asociados.

### 5.10 Seguridad y datos

- Todas las consultas usan sentencias preparadas con PDO.
- Los errores de base de datos se registran en el log y no se exponen al usuario.
- Los endpoints responden JSON con la estructura `{ ok, mensaje, ... }`.
- Los archivos subidos se validan por extensión y MIME, se renombran aleatoriamente y se eliminan si el registro falla.
- El archivo `backend/config/conexion.php` está excluido de Git; se usa `conexion.example.php` como plantilla.
- No se deben subir credenciales, `node_modules`, `dist` ni archivos `.env`.

---

## 6. Estado actual del MVP

### Implementado con backend real
- Login, logout y restauración de sesión.
- CRUD de usuarios con control de permisos.
- Registro de postulaciones externas e internas en la tabla `candidato`.
- Carga de currículum con validación y almacenamiento.
- Catálogo de familias y cargos desde base de datos.
- Módulo Analista: registro de postulaciones internas con CV opcional, listado, edición y detalle de candidatos con previsualización y descarga del CV en PDF, DOC y DOCX.
- Módulo Administrador: listado de candidatos y registro de postulaciones internas con CV opcional mediante modal.
- Módulo Analista: creación, listado con filtros y detalle de solicitudes de evaluación en `solicitudevaluacion`.
- Módulo Evaluador: bandeja de solicitudes asignadas, ficha del postulante, CV, borrador y finalización de la evaluación psicolaboral con persistencia en `evaluacion`.
- Módulo Administrador: dashboard con métricas, solicitudes recientes, actividad y distribuciones calculadas desde MySQL.
- Módulo Jefatura: panel de resoluciones por evaluador, usuarios e historial en modo solo lectura.
- Historial y trazabilidad de solicitudes en `historialsolicitudes`, con filtros por tipo, estado, texto y mes.
- Exportación CSV del historial filtrado.

### Pendiente o limitado
- Recuperación de contraseña.
- Cobertura de pruebas limitada a los filtros del módulo Analista.
- Configuración de entorno para producción (las URLs del backend están fijadas a `localhost/AquaSeleccion`).

---

## 7. Flujo de trabajo Git

El proyecto sigue una estrategia de ramas con `main`, `develop` y ramas `feature/*` integradas mediante Pull Request. Los detalles completos están en [`docs/ESTRATEGIA-RAMAS.md`](docs/ESTRATEGIA-RAMAS.md).

Antes de cada entrega:

```bash
npm run lint
npm run build
```

Los mensajes de commit siguen el formato Conventional Commits: `tipo(ámbito): descripción en imperativo`.

---

© AquaChile S.A. — AquaSeleccion v0.1.0 (MVP)
