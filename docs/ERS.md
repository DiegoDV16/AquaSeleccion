# ERS — AquaSeleccion

**Proyecto:** MVP web para la gestión de evaluaciones psicolaborales — AquaChile  
**Asignatura:** DSY1104 Desarrollo Full Stack II  
**Evaluación:** Parcial N.° 2 — Avance frontend React y pruebas unitarias  
**Versión del documento:** 2.0  
**Fecha:** 02-11-2026  
**Repositorio:** <https://github.com/DiegoDV16/AquaSeleccion>

---

## 1. Problemática

AquaChile necesita centralizar el registro de candidatos, la creación y seguimiento de solicitudes de evaluación psicolaboral, la asignación de evaluadores y la trazabilidad de las decisiones. El proceso disperso dificulta saber quién intervino en cada solicitud, en qué estado se encuentra y qué resultados se han emitido.

El proyecto resuelve este problema con un flujo único:

```text
Postulación → Registro de candidato → Solicitud → Asignación
→ Evaluación → Resultado → Historial y auditoría
```

La aplicación permite demostrar el recorrido completo desde el frontend y mantiene trazabilidad de cada movimiento.

---

## 2. Alcance implementado

### 2.1 Portal público

- Formulario de postulación externa en `/postular`.
- Selección dependiente Familia de cargo → Cargo.
- Carga de currículum.
- Consentimiento de tratamiento de datos.
- Confirmación con número de seguimiento.

### 2.2 Autenticación y roles

- Inicio y cierre de sesión con sesión PHP.
- Roles:
  - Administrador.
  - Analista de Reclutamiento.
  - Profesional Evaluador.
  - Jefatura, con acceso de solo lectura.
- Menús y rutas protegidas por rol.
- Restricciones también validadas en el backend.

### 2.3 Módulo Analista

- Registro y edición de candidatos internos.
- Listado, búsqueda, filtros y detalle de candidatos.
- Previsualización y descarga de CV.
- Creación de solicitudes de evaluación.
- Asignación de evaluador y prioridad.
- Listado y detalle de solicitudes con filtros.

### 2.4 Módulo Evaluador

- Bandeja de solicitudes asignadas.
- Ficha del postulante y antecedentes.
- Registro de borrador de evaluación.
- Finalización con resultado:
  - Apto.
  - No apto.
  - Con observaciones.
- Persistencia del estado de la solicitud.

### 2.5 Módulo Administrador

- Dashboard con indicadores reales.
- Gráfico de dona para solicitudes por estado.
- Barras por familia de cargo y cargos con mayor demanda.
- Barras apiladas de resoluciones por evaluador.
- Listado y gestión de usuarios.
- Registro de postulaciones internas.
- Historial y auditoría de solicitudes.
- Exportación CSV del historial filtrado.

### 2.6 Módulo Jefatura

- Panel de resoluciones por evaluador.
- Consulta de usuarios en modo solo lectura.
- Historial y auditoría en modo solo lectura.
- Sin permisos para crear, editar o eliminar usuarios.

### 2.7 Historial y auditoría

- Tabla `historialsolicitudes`.
- Registro de:
  - Creación de solicitud.
  - Inicio de evaluación.
  - Actualización de borrador.
  - Finalización de evaluación.
- Datos registrados:
  - Solicitud.
  - Candidato.
  - `idCargo` y nombre del cargo.
  - Tipo de gestión.
  - Acción y detalle.
  - Usuario responsable.
  - Estado.
  - Fecha del movimiento.
- Vista de detalle completo por movimiento.
- Filtros por tipo, estado, texto y mes.
- Exportación CSV.

---

## 3. Funcionalidades pendientes o fuera del alcance actual

| Funcionalidad | Estado |
| --- | --- |
| Recuperación de contraseña | Pendiente |
| Notificaciones por correo | Pendiente |
| Batería psicométrica completa | Fuera del alcance; la evaluación registra antecedentes, resultado y observaciones |
| Firma electrónica de informes | Pendiente |
| Integración con sistemas internos de AquaChile | Pendiente |
| Despliegue productivo y endurecimiento de infraestructura | Pendiente |
| Cobertura formal de pruebas | No medida; existen pruebas de componentes, permisos, filtros e historial |
| Exportaciones distintas de CSV | Pendiente |

> Los datos utilizados son ficticios o anonimizados. No se usan datos personales reales.

---

## 4. Requisitos funcionales

| ID | Requisito | Estado | Evidencia |
| --- | --- | --- | --- |
| RF-01 | Registrar postulaciones externas | Implementado | `src/pages/public/Postular.jsx` |
| RF-02 | Autenticar usuarios por rol | Implementado | `AuthContext`, `backend/api/auth` |
| RF-03 | Proteger rutas y menús por rol | Implementado | `RutaProtegida`, `AppRouter`, `menu.js` |
| RF-04 | Registrar y consultar candidatos | Implementado | Módulos Analista y Administrador |
| RF-05 | Crear solicitudes y asignar evaluador | Implementado | `backend/api/solicitudes/crear.php` |
| RF-06 | Filtrar y buscar candidatos/solicitudes | Implementado | `filtros.js`, páginas de listado |
| RF-07 | Registrar evaluación y resultado | Implementado | `backend/api/evaluaciones/guardar.php` |
| RF-08 | Visualizar indicadores del proceso | Implementado | `AdminDashboard.jsx` |
| RF-09 | Registrar trazabilidad y auditoría | Implementado | `historialsolicitudes`, `historial/listar.php` |
| RF-10 | Exportar historial filtrado | Implementado | `AdminHistorial.jsx` |
| RF-11 | Gestionar usuarios | Implementado | `AdminUsuarios.jsx`, `backend/api/usuarios` |
| RF-12 | Perfil Jefatura de solo lectura | Implementado | Rol 5, rutas y validaciones backend |

---

## 5. Requisitos no funcionales

- **Responsive:** Bootstrap 5 y grillas adaptables en las vistas principales.
- **Validación:** formularios con validación de campos obligatorios y formatos.
- **Seguridad:** sesión PHP, rutas protegidas y validación de rol en endpoints.
- **Trazabilidad:** historial append-only y usuario responsable por movimiento.
- **Usabilidad:** mensajes en español, estados de carga, errores y confirmaciones.
- **Mantenibilidad:** componentes reutilizables, servicios de API separados y estilos centralizados.
- **Datos:** entorno de demostración con datos ficticios.

---

## 6. Arquitectura del frontend

```text
src/
├── components/
│   ├── layout/          Navbar, Sidebar, Footer, AppLayout
│   └── ui/              PageHeader, StatCard, badges, modales
├── context/             AuthContext y sesión
├── mock/                catálogos, menús y datos de apoyo
├── pages/
│   ├── public/          Postular
│   ├── auth/            Login
│   ├── analista/        Candidatos y solicitudes
│   ├── evaluador/       Bandeja y formulario de evaluación
│   ├── admin/           Dashboard, usuarios e historial
│   └── ...
├── routes/              AppRouter y RutaProtegida
├── services/            llamadas al backend
└── utils/               filtros y funciones auxiliares
```

Elementos React aplicados:

- Componentes funcionales reutilizables.
- Props para configurar componentes.
- Arreglos y `.map()` para tablas, menús, métricas y gráficos.
- `useState` para filtros, formularios, modales y estados de carga.
- `useEffect` para consultas al backend.
- Eventos para búsqueda, filtros, navegación y envío de formularios.
- Renderizado condicional para roles, estados y resultados.
- React Router para navegación protegida.
- Bootstrap 5 para layout y componentes visuales.

---

## 7. Pruebas automatizadas

**Herramienta:** Vitest + Testing Library + jsdom.

**Comando:**

```bash
npm test -- --run
```

**Resultado de la ejecución:**

```text
Test Files  11 passed (11)
Tests       65 passed (65)
```

**Archivos principales:**

| Archivo | Qué verifica |
| --- | --- |
| `src/pages/analista/filtros.test.js` | Búsqueda, filtros combinados y estados |
| `src/pages/admin/AdminHistorial.test.jsx` | Renderizado del historial, filtro y modal de detalle |
| `src/routes/RutaProtegida.test.jsx` | Restauración de sesión, acceso y rechazo por rol |
| `src/context/AuthProvider.test.jsx` | Inicio/cierre de sesión y persistencia |
| `src/components/layout/*.test.jsx` | Navbar, Sidebar, Footer y layout |
| `src/mock/*.test.js` | Roles, menús y funciones de solicitudes |

**Limitación:** no se mide cobertura formal. Las pruebas cubren componentes de layout, autenticación, permisos, filtros e historial; no todos los formularios CRUD ni todos los endpoints.

---

## 8. Correspondencia con la rúbrica

| Indicador | Evidencia en el proyecto |
| --- | --- |
| IE2.1.1 Estructura React y pertinencia VcM | Flujo completo de candidato, solicitud, evaluación y auditoría |
| IE2.1.2 Componentes, props y responsive | Componentes UI reutilizables, `.map()`, Bootstrap 5 y vistas adaptables |
| IE2.1.5 Estado, formularios, filtros y navegación | `useState`, `useEffect`, validaciones, filtros y React Router |
| IE2.2.1 / IE2.3.1 Pruebas Vitest | 11 archivos y 65 pruebas ejecutadas correctamente |
| IE2.1.3 Problema y diseño frontend | Este documento y README explican problema, alcance y solución |
| IE2.1.4 Dominio de componentes y responsividad | Arquitectura de componentes y uso de Bootstrap documentados |
| IE2.1.6 Flujo interactivo y coherencia | Recorrido funcional de postulación a historial |
| IE2.2.2 / IE2.3.2 Evidencia y explicación de testing | Comando, resultados y alcance de las pruebas documentados |

---

## 9. Recorrido de demostración

1. Abrir `/postular` y registrar un candidato externo.
2. Iniciar sesión como Analista.
3. Revisar el candidato, su cargo y su CV.
4. Crear una solicitud y asignar un evaluador.
5. Iniciar sesión como Evaluador.
6. Abrir la solicitud asignada, guardar borrador y finalizar.
7. Iniciar sesión como Administrador o Jefatura.
8. Revisar indicadores, historial, detalle del movimiento y exportar CSV.

---

## 10. Correspondencia con la problemática VcM

- **Centralización:** un único flujo para candidatos, solicitudes y evaluaciones.
- **Trazabilidad:** historial con usuario, cargo, estado y fecha.
- **Control por roles:** cada actor ve y ejecuta solo lo que le corresponde.
- **Seguimiento:** estados, filtros e indicadores permiten conocer el avance.
- **Auditoría:** Jefatura puede revisar información sin modificarla.
- **Escalabilidad:** arquitectura preparada para integrar nuevos requisitos en la etapa Full Stack.
