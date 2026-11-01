# Habilidades y flujos de trabajo — AquaSeleccion

Estas guías describen cómo trabajar en el stack real del proyecto: React/Vite en el frontend, PHP nativo con PDO en el backend y MySQL/MariaDB administrado localmente con XAMPP y phpMyAdmin. 
## Versiones de trabajo

Referencia comprobada en el entorno local y en el lockfile:

- Node.js `24.20.0` y npm `12.2.1`.
- PHP `8.2.12`.
- MariaDB `10.4.32`, incluida en XAMPP y compatible con el protocolo MySQL.
- phpMyAdmin `5.2.1`.
- React y React DOM `18.3.1`; React Router DOM `6.30.6`.
- Vite `8.3.5`; Bootstrap `5.3.8`; Bootstrap Icons `1.13.1`.
- ESLint `9.39.5`; Vitest `5.0.5`.

El lockfile es la fuente de las versiones exactas de dependencias JavaScript. Revisa `package.json` y `package-lock.json` si cambian las dependencias.

## Flujo 1: entender el módulo antes de implementar

1. Lee la página, componentes, rutas, servicios y endpoints relacionados.
2. Identifica qué información viene del backend y cuál se carga desde `src/mock/`.
3. Conserva el patrón ya utilizado en ese módulo. No conectes a MySQL datos que todavía son simulados sin que la tarea incluya ese alcance.
4. Revisa permisos y estados de usuario en frontend y backend antes de cambiar flujos autenticados.

## Flujo 2: implementar una funcionalidad frontend y PHP

1. Construye la interfaz con componentes funcionales React y hooks, siguiendo los componentes y estilos existentes.
2. Centraliza las llamadas HTTP en `src/services/` y reutiliza los helpers de `src/services/http.js` para mantener cookies de sesión y el formato de respuesta. Envía las solicitudes al backend con `POST`; no serialices los datos de entrada como JSON.
3. Implementa o ajusta el endpoint en `backend/api/` usando el estilo PHP nativo del proyecto y `declare(strict_types=1);`.
4. Envía campos de texto como `application/x-www-form-urlencoded` o `multipart/form-data`; usa `multipart/form-data` para cargas de archivos. Con `FormData`, no establezcas manualmente `Content-Type`, porque el navegador debe incluir el límite multipart. En PHP lee los campos desde `$_POST` y archivos desde `$_FILES`, no desde `cuerpoJson()`.
5. Valida en el backend campos, tipos, tamaños, permisos y relaciones; las validaciones del navegador no son suficientes.
6. Devuelve JSON consistente con `{ ok, mensaje, ... }` y códigos HTTP apropiados. Esta regla corresponde a la respuesta, no al formato de entrada. Reutiliza `backend/helpers/respuesta.php` cuando encaje.
7. Si una operación afecta varias filas o combina persistencia y archivos subidos, contempla transacciones y limpieza ante errores, siguiendo el patrón del backend.
8. Prueba los estados de carga, éxito, error y acceso denegado que correspondan.

Esta es la convención para nuevas implementaciones y cambios relacionados. Algunos endpoints actuales todavía usan GET o reciben cuerpos JSON; cuando una tarea los modifique, actualiza en conjunto el servicio React y el endpoint PHP, sin asumir que ya están migrados.

## Flujo 3: crear y ejecutar pruebas con Vitest

Vitest `5.0.5` está instalado, pero el proyecto aún no tiene pruebas ni un script `test` en `package.json`.

1. Para lógica JavaScript nueva o modificada, identifica funciones y comportamientos con resultados verificables y crea pruebas unitarias para casos normales, límites y errores relevantes.
2. Nombra los archivos `*.test.js` o `*.spec.js` (y sus variantes JSX si corresponde) y ubícalos junto al módulo probado o en una carpeta `tests/` coherente con el código existente.
3. Importa explícitamente las funciones de prueba, por ejemplo `import { describe, expect, it } from 'vitest';`. Mantén las pruebas deterministas: no dependas de servicios externos, la base de datos local, el orden de ejecución ni datos personales reales.
4. Prueba la lógica aislada; simula las dependencias externas cuando haga falta. No intentes probar PHP o MySQL con Vitest: valida PHP con `php -l` y verifica la integración mediante el entorno XAMPP cuando esté disponible.
5. Ejecuta la suite con `npx vitest run`; para un archivo, `npx vitest run ruta/al/archivo.test.js`; durante el desarrollo interactivo, `npx vitest`.
6. No agregues librerías de pruebas de React ni configures un script `test` sin que el alcance lo requiera. Si se agrega uno, documenta y valida el comando con `npm run test`.
7. Reporta qué pruebas se ejecutaron y sus resultados; si no había pruebas o no fue posible ejecutarlas, indícalo expresamente.

## Flujo 4: trabajar con MySQL/MariaDB en XAMPP y phpMyAdmin

1. Inicia Apache y MySQL desde el panel de XAMPP. Abre phpMyAdmin en `http://localhost/phpmyadmin`.
2. Usa la base `aquaseleccion`; la configuración de ejemplo conecta a `127.0.0.1`, puerto `3306`, con `utf8mb4`.
3. Comprueba el esquema y los datos disponibles antes de escribir consultas o asumir claves y relaciones. No confundas tablas mostradas en mocks con tablas persistidas.
4. Para el backend, usa PDO y parámetros enlazados en todas las consultas. Evita concatenar entrada del usuario en SQL.
5. Si el trabajo requiere cambiar el esquema, describe el SQL de forma reproducible y actualiza la documentación pertinente; aplica el cambio solo en el entorno solicitado. No inventes un sistema de migraciones que el repositorio todavía no tiene.
6. Mantén las credenciales locales en `backend/config/conexion.php`, que se crea desde `backend/config/conexion.example.php` y no se debe publicar. No asumas que `root` sin contraseña es apropiado fuera del entorno local.
7. Ante un error de conexión, verifica servicio, host, puerto, nombre de base y credenciales sin mostrar secretos en la salida.

## Flujo 5: autenticación, permisos y archivos

- La sesión PHP es la fuente de verdad de autenticación. Verifica los permisos en cada endpoint protegido y no dependas solo de las rutas protegidas de React.
- Conserva el uso de `password_hash` / `password_verify` para contraseñas y no las registres.
- Valida tipo MIME, extensión y tamaño de archivos en el servidor; genera nombres de almacenamiento no predecibles y evita exponer rutas internas.
- No incluyas datos personales, currículums, credenciales ni configuración local en commits, fixtures o logs.

## Flujo 6: verificación antes de entregar

Para cambios frontend:

```bash
npm run lint
npm run build
```

Para cambios JavaScript, ejecuta las pruebas Vitest afectadas o `npx vitest run`, además de lint y build. Para cambios PHP, ejecuta `php -l` sobre cada archivo PHP modificado. Si el cambio toca persistencia o autenticación, prueba el endpoint con Apache/MySQL de XAMPP cuando estén disponibles y reporta claramente cualquier validación que no se pudo ejecutar.
