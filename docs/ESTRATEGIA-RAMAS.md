# Estrategia de ramas - AquaSeleccion (GitHub Desktop)

Guía de versionado paso a paso para el MVP del Sistema de Gestión de Evaluaciones
Psicolaborales y Reclutamiento de AquaChile.

Todas las ramas se crean desde **`main`**, salvo la primera que se crea desde
`develop`. El flujo es siempre el mismo: **crear rama → trabajar → commit → push → Pull Request → fusionar**.

---

## 0. Ramas permanentes

| Rama | Función |
| --- | --- |
| `main` | Rama de Releases. Código estable y desplegable. Solo recibe fusiones desde `develop`. |
| `develop` | Rama de integración. Acumula todas las features terminadas antes de un release. |

Creación en GitHub Desktop (solo una vez):

1. Menú superior `Repository` → `Settings` → `Branches`.
2. Cambia el branch por defecto de `main` a `develop`.
3. Crea `develop` desde la pantalla de commits: botón **Current Branch** → **New Branch** → nombre `develop` → **Create branch**.

---

## 1. Secuencia de ramas de trabajo

### `feature/setup-layout`
**Base:** `develop`

Estructura base del proyecto y layout del monolito.

- `package.json`, `index.html`, `vite.config.js`, `eslint.config.js`, `.gitignore`
- Dependencias: `react`, `react-dom`, `react-router-dom@6`, `bootstrap@5`, `bootstrap-icons`
- Árbol MVC: `src/components`, `src/pages`, `src/routes`, `src/mock`, `src/context`
- `src/components/layout`: `Navbar.jsx`, `Sidebar.jsx`, `Footer.jsx`, `AppLayout.jsx` (con `<Outlet />`)
- `src/context`: `AuthContext.js`, `AuthProvider.jsx` con selector de rol
- `src/index.css` con la paleta corporativa (Bootstrap 5 vía variables CSS)
- `src/routes/AppRouter.jsx` con rutas vacías por módulo
- `src/mock/catalogoRoles.js` y `src/mock/menu.js`

**Commit sugerido:** `chore(setup): estructura base del proyecto, layout y contexto de rol`

---

### `feature/auth-login`
**Base:** `feature/setup-layout` (se developea encadenada para no romper el layout)

Vista de login institucional y enlace a la postulación externa.

- `src/pages/auth/Login.jsx`: correo institucional, contraseña, botón **Iniciar Sesión**
- Enlace destacado **"¿Deseas postular a nuestras vacantes? Postula aquí"** → `<Link to="/postular">`
- `src/pages/SinPermisos.jsx` y `src/pages/NotFound.jsx`
- `src/routes/RutaProtegida.jsx` con `PERMISOS_POR_MODULO`

**Commit sugerido:** `feat(auth): vista de login institucional con enlace a postulación pública`

---

### `feature/postulacion-publica`
**Base:** `feature/auth-login`

Formulario público `/postular` para postulantes externos.

- `src/pages/public/Postular.jsx`: nombres, apellidos, correo, teléfono
- Selectores dependientes **Familia de Cargo → Cargo** con datos mock vinculados
- `<input type="file">` con drag & drop, validación de PDF y tamaño máximo
- Modal de confirmación de envío
- `src/mock/cargos.js` con familias y cargos

**Commit sugerido:** `feat(postulacion): formulario público de postulación externa con carga de CV en PDF`

---

### `feature/modulo-administrador`
**Base:** `feature/postulacion-publica`

Dashboard, postulación interna, usuarios y trazabilidad.

- `src/pages/admin/AdminDashboard.jsx`: tarjetas de métricas (externas, internas, en proceso, finalizadas)
- `src/pages/admin/AdminPostularInterno.jsx`: selector de empleado, cargo destino y observaciones
- `src/pages/admin/AdminUsuarios.jsx`: tabla con filtros por rol y estado
- `src/pages/admin/AdminHistorial.jsx`: tabla de `historialsolicitudes` con filtros
- `src/mock/usuarios.js`, `src/mock/metricas.js`, `src/mock/historialSolicitudes.js`
- `src/components/ui/`: `StatCard.jsx`, `PageHeader.jsx`, `EstadoBadge.jsx`, `TipoPostulacionBadge.jsx`

**Commit sugerido:** `feat(admin): dashboard, postulación interna, usuarios e historial de solicitudes`

---

### `feature/modulo-analista`
**Base:** `feature/modulo-administrador`

Gestión de candidatos y creación de solicitudes.

- `src/pages/analista/AnalistaCandidatos.jsx`: tabla de candidatos con detalle y CV
- `src/components/ui/VisorCvModal.jsx`: previsualización estática del PDF
- `src/pages/analista/AnalistaSolicitudes.jsx`: listado con filtros por estado
- `src/pages/analista/AnalistaNuevaSolicitud.jsx`: vincular candidato con evaluador
- `src/mock/solicitudes.js`, `src/mock/candidatos.js`

**Commit sugerido:** `feat(analista): gestión de candidatos y creación de solicitudes de evaluación`

---

### `feature/modulo-evaluador`
**Base:** `feature/modulo-analista`

Evaluación psicolaboral.

- `src/pages/evaluador/EvaluadorMisSolicitudes.jsx`: tarjetas de solicitudes asignadas
- `src/pages/evaluador/EvaluadorEvaluar.jsx`: `/evaluador/evaluar/:id`
- Formulario: fecha de evaluación, resultado (Apto / No Apto / Con observaciones), estado del proceso y `textarea` de observaciones
- Botón **"Guardar y Finalizar Evaluación"**

**Commit sugerido:** `feat(evaluador): módulo de evaluación psicolaboral por solicitud`

---

### Cierre de la iteración

1. `git merge` no se usa localmente: cada feature se integra con **Pull Request** hacia `develop`.
2. Al completar los seis módulos: `release/mvp-v0.1.0` desde `develop`, y **Pull Request** `release/mvp-v0.1.0` → `main`.

---

## 2. Cómo crear y alternar ramas en GitHub Desktop

**Crear rama nueva**

1. Abre el repositorio en GitHub Desktop.
2. Arriba a la derecha haz clic en el botón **Current Branch**.
3. Selecciona **New Branch**.
4. Escribe el nombre estandarizado (`feature/setup-layout`) y confirma en **Create branch**.
5. GitHub Desktop escribe primero la rama nueva en GitHub y luego cambia tu copia local a ella.

**Alternar entre ramas**

1. Clic en **Current Branch** → selecciona la rama destino en la lista.
2. GitHub Desktop ejecuta el `checkout`: si tienes cambios sin commit, pide confirmarlos o guardarlos (*Stash*) antes de cambiar.

**Publicar una rama nueva**

- Tras el primer commit, la rama solo existe en tu equipo. Usa el botón **Publish branch** (arriba a la barra) para subirla a GitHub.

**Commit**

- Panel izquierdo → escribe el mensaje → **Commit to `<rama>`**.

**Push y Pull Request**

- Botón **Push origin** para subir los commits.
- Botón **Review changes** → **Create pull request** → base `develop` → **Create pull request**.

**Merge desde GitHub**

- Pestaña **Pull requests** → selecciona el PR → **Merge pull request** → **Confirm merge** → **Delete branch**.

> Si tu cuenta no puede fusionar por falta de permisos, activa la protección de rama en
> `Repository` → `Settings` → `Branches` y designa revisores obligatorios.

---

## 3. Commits limpios: recomendaciones

- **Un commit por entrega funcional.** Antes de commitear ejecuta `npm run lint` y `npm run build`: deben pasar limpios.
- **Mensajes en formatoConventional Commits:**
  `tipo(ámbito): descripción en imperativo`.
  - `feat` nueva funcionalidad · `fix` corrección · `chore` dependencias/configuración · `style` formato · `refactor` reorganización · `docs` documentación.
- **Ejemplos:**
  - `feat(auth): agregar login institucional con selector de módulo`
  - `feat(postulacion): validar carga de CV en formato PDF`
  - `feat(evaluador): registrar resultado de evaluación psicolaboral`
  - `fix(rutas): corregir guard de rol en /admin/usuarios`
  - `chore(deps): agregar bootstrap-icons 1.11.3`
- **Nunca subas** `node_modules`, `dist`, `.env` ni el `package-lock.json` editado a mano (ya están en `.gitignore`).
- **Frecuencia:** commit al cerrar cada vista del módulo, no al cerrar el día.
- **Antes de abrir el PR:** verifica en la pestaña de Pull request que solo aparecen los archivos de ese módulo.

---

## 4. Orden de publicación

```
main
└── develop
    ├── feature/setup-layout
    │   └── feature/auth-login
    │       └── feature/postulacion-publica
    │           └── feature/modulo-administrador
    │               └── feature/modulo-analista
    │                   └── feature/modulo-evaluador
    └── release/mvp-v0.1.0  (→ merge a main)
```

La cadena es estrictamente lineal porque cada módulo reutiliza los componentes del
anterior (Layout, Contexto de rol, badges, visor de CV). Si dos módulos se desarrollan
en paralelo, crea una rama propia desde `develop` **cuando el layout ya esté fusionado**
y luego reintenta el merge (`rebase` en la rama de trabajo) antes de abrir el PR.