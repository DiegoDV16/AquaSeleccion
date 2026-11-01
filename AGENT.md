# Instrucciones del agente — AquaSeleccion

## Contexto del proyecto

AquaSeleccion es un MVP para gestionar postulaciones y evaluaciones psicolaborales de Empresas AquaChile S.A. Es una SPA en React que consume un backend de endpoints PHP; no es una aplicación Laravel ni usa PostgreSQL.

Antes de desarrollar, identifica si el módulo ya está conectado al backend o si todavía usa datos de `src/mock/`. No reemplaces datos simulados ni cambies el alcance funcional de un módulo sin que la tarea lo solicite.

## Stack y versiones de referencia

Versiones observadas en el entorno de desarrollo y en `package-lock.json`:

| Componente | Versión |
| --- | --- |
| Node.js | 24.20.0 |
| npm | 12.2.1 |
| PHP de XAMPP | 8.2.12 |
| MariaDB de XAMPP (compatible con MySQL) | 10.4.32 |
| phpMyAdmin | 5.2.1 |
| React / React DOM | 18.3.1 |
| React Router DOM | 6.30.6 |
| Vite | 8.3.5 |
| Bootstrap / Bootstrap Icons | 5.3.8 / 1.13.1 |
| ESLint | 9.39.5 |
| Vitest | 5.0.5 |

`package.json` define los rangos permitidos y `package-lock.json` fija las dependencias del frontend. Si estos archivos cambian, consulta sus versiones actuales antes de actualizar esta referencia. No eleves versiones ni agregues dependencias sin necesidad para la tarea.

## Entorno local y base de datos

- El entorno local es XAMPP en Windows, con Apache y MySQL (MariaDB) iniciados desde el panel de XAMPP.
- phpMyAdmin es la interfaz para administrar el servidor y la base de datos; no es el motor de base de datos.
- La base utilizada por el proyecto se llama `aquaseleccion` y, en la configuración de referencia, escucha en `127.0.0.1:3306` con `utf8mb4`.
- La conexión del backend está en `backend/config/conexion.php`; `backend/config/conexion.example.php` es la plantilla compartible. No expongas ni sobrescribas credenciales locales.
- El repositorio debe ejecutarse en `C:\xampp\htdocs\AquaSeleccion`. Vite usa el puerto `5173` y deriva las solicitudes `/backend` al Apache de XAMPP.
- No supongas que una estructura o dato existe en MySQL solo porque está en un mock o en la interfaz. Comprueba el código y coordina cualquier cambio de esquema con la persona usuaria.

## Arquitectura y convenciones

- Frontend: JavaScript con React, componentes funcionales y hooks; navegación en `src/routes/`, páginas en `src/pages/`, componentes reutilizables en `src/components/`, autenticación en `src/context/` y llamadas al backend en `src/services/`.
- Backend: PHP nativo, sin framework ni ORM. Los endpoints están en `backend/api/`; lógica relacionada y configuración están en `backend/config/`; utilidades compartidas, en `backend/helpers/`.
- Mantén los patrones y nombres existentes. Evita introducir Laravel, Blade, PostgreSQL, TypeScript u otra arquitectura que el proyecto no usa.
- El backend accede a MySQL/MariaDB con PDO. Usa consultas preparadas, validación en servidor y transacciones para operaciones que requieran atomicidad.
- Para las solicitudes de la aplicación al backend PHP, usa el método HTTP `POST` y envía los campos como formulario, no como cuerpo JSON. Usa `application/x-www-form-urlencoded` para campos de texto sin archivos y `multipart/form-data` para archivos; al usar `FormData`, deja que el navegador establezca el encabezado `Content-Type`.
- Lee los campos de formulario en PHP mediante `$_POST` y los archivos mediante `$_FILES`; no uses `cuerpoJson()` para nuevas solicitudes de la aplicación. Mantén JSON como formato de respuesta del backend (por ejemplo, `{ ok, mensaje, ... }`) y reutiliza `backend/helpers/respuesta.php` cuando corresponda.
- Esta convención describe el comportamiento deseado para nuevas implementaciones y cambios dentro de su alcance. Algunos endpoints existentes todavía usan GET o reciben cuerpos JSON; no los presentes como ya migrados y, si una tarea los modifica, actualiza conjuntamente el cliente y el endpoint PHP.
- La autenticación se basa en sesiones PHP. Las rutas de React mejoran la navegación, pero los permisos deben validarse también en el endpoint PHP.
- No registres credenciales, datos personales ni contenido de currículums en logs, respuestas de error o archivos versionados. No alteres archivos locales ignorados como `backend/config/conexion.php` salvo que la tarea lo requiera explícitamente.

## Flujo de trabajo

1. Lee los archivos del módulo y sus dependencias antes de editar. Reutiliza servicios, componentes y helpers existentes.
2. Haz cambios acotados y coherentes con el comportamiento actual. Mantén separadas las responsabilidades de interfaz, cliente HTTP y endpoints.
3. Trata datos de formularios y archivos como entrada no confiable; valida en el servidor, controla permisos y conserva las respuestas de error explícitas.
4. Para cambios de lógica JavaScript, agrega o actualiza pruebas unitarias con Vitest cuando sea útil y ejecuta las pruebas afectadas. No afirmes que existen pruebas para un comportamiento si no las creaste o ejecutaste.
5. Para cambios de interfaz o lógica JavaScript, ejecuta también `npm run lint` y `npm run build`.
6. Si la tarea incluye cambios PHP o integración con base de datos, valida además la sintaxis PHP de los archivos afectados y prueba el flujo cuando el entorno local esté disponible. No afirmes que se probó la base si no se verificó la conexión.
7. Actualiza la documentación directamente relacionada cuando cambien instalación, comportamiento, estructura o requisitos.

## Comandos habituales

```bash
npm install
npm run dev
npx vitest run
npm run lint
npm run build
```

Vitest está instalado, pero no hay script `test` ni pruebas existentes configuradas todavía. Para ejecutar una prueba específica, usa `npx vitest run ruta/a/archivo.test.js`; para modo watch, `npx vitest`. Inicia Apache y MySQL en XAMPP para probar endpoints PHP. La interfaz de administración de la base se encuentra normalmente en `http://localhost/phpmyadmin`; la aplicación frontend en `http://localhost:5173`.
