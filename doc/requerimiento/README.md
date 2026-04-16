# Requerimientos — Cáritas

Qué tiene que hacer la aplicación. Se actualiza cuando hay decisiones de producto.
**Regla de oro**: antes de codear algo que "parece útil", fijarse si está listado acá. Si no está, preguntar o agregarlo primero.

---

## 1. Contexto

**Cáritas** es una plataforma interna para ordenar accesos, actividad de usuarios y (a futuro) gestión de dominio propio (beneficiarios, donaciones, voluntarios, inventario).

El estado actual del repo es **base técnica funcional**:

- Login + dashboard.
- Gestión de usuarios y grupos nativos de Django.
- Actualización en vivo vía WebSockets.

El dominio propio (beneficiarios, etc.) **todavía no está modelado**. Cuando se definan historias de usuario concretas, se agregan en la sección correspondiente.

---

## 2. Requerimientos funcionales

### RF-01 — Autenticación

- El usuario accede con **usuario + contraseña** (login Django nativo).
- Checkbox **"Recordarme"** → si no se marca, la sesión expira al cerrar el browser.
- Logout disponible desde el topbar.
- Sólo usuarios con `is_staff=True` acceden al dashboard.
- Los que no son staff quedan bloqueados al intentar entrar (403 vía `UserPassesTestMixin`).

### RF-02 — Dashboard de resumen

- Pantalla `/dashboard/` muestra métricas clave:
  - Total de usuarios / activos / inactivos / staff.
  - Total de grupos.
  - Altas recientes (últimos 30 días).
  - Ratio de usuarios activos sobre total.
  - Top 5 grupos por cantidad de miembros.
  - Últimos 5 usuarios creados.
- Las métricas **se actualizan en vivo** cuando otro usuario crea/edita/elimina usuarios o grupos (WebSocket).

### RF-03 — Gestión de usuarios

- Listar todos los usuarios con nombre, correo, grupos, estado.
- Crear usuario con: usuario, nombre, apellido, correo, contraseña, flags (`is_active`, `is_staff`), grupos asignados.
- Editar los mismos campos de un usuario existente.
- Ver estado visual (activo / inactivo) con badge.

### RF-04 — Gestión de grupos (roles)

- Listar grupos con conteo de miembros.
- Crear grupo con nombre + permisos asignados.
- Editar los mismos campos.
- Los permisos se toman de `django.contrib.auth.models.Permission` (todos los content types disponibles).

### RF-05 — Realtime

- Cuando un usuario admin cambia datos (usuarios o grupos), todos los dashboards abiertos refrescan sus métricas sin F5.
- El refresh pasa por `/dashboard/live/summary/` (endpoint JSON).
- Sólo se conectan al WS usuarios con `is_staff=True`.

### RF-06 — Accesibilidad

- Navegación por teclado funciona en formularios, menús y diálogos.
- Focus visible en todos los elementos interactivos.
- Los estados no se diferencian sólo por color (ej. badges llevan dot + texto).
- Labels asociados a inputs.
- Modales cerrables con `Esc`.

### RF-07 — Tema claro / oscuro

- Toggle en el topbar.
- Preferencia persiste en `localStorage`.
- Toda pantalla renderiza correctamente en ambos modos.

### RF-08 — i18n y localización

- Idioma por defecto: `es-ar`.
- Timezone: `America/Argentina/Buenos_Aires`.
- Fechas: `YYYY-MM-DD` en tablas, "15 de abril" en textos.
- Números: separador de miles con punto.

---

## 3. Requerimientos técnicos

### RT-01 — Stack fijo

- **Django 5.0.x** (ver `requirements.txt`).
- **MySQL 8.0** como base de datos primaria.
- **Redis 7** como channel layer.
- **Python**: el que fije el Dockerfile (`docker/web/Dockerfile`).
- **Node**: 20-alpine para Tailwind.

No cambiar versiones mayores sin actualizar este documento.

### RT-02 — Contenedores

- Todo corre con `docker compose up --build`.
- Servicios: `db`, `redis`, `web`, `tailwind`.
- Dev mode: bind mount del repo, watch de Tailwind y hot reload de Django.

### RT-03 — Autenticación y sesiones

- Sesiones en DB (default Django).
- CSRF obligatorio en todos los POST.
- `LOGIN_URL = "core:login"`.
- No hay OAuth / SSO (por ahora).

### RT-04 — Static files

- Tailwind v3 con JIT.
- CSS servido desde `static/dist/css/app.css`.
- Whitenoise con `CompressedManifestStaticFilesStorage`.
- Build productivo: `collectstatic` + `npm run build`.

### RT-05 — Config por entorno

- Toda config via `.env` + `django-environ`.
- `DJANGO_DEBUG=True` sólo en local.
- `DJANGO_SECRET_KEY` **obligatoriamente** distinta en producción.
- Fallback a SQLite **sólo** si `MYSQL_HOST` está vacío.

### RT-06 — Autorización

- Vistas protegidas con `StaffRequiredMixin` (combina `LoginRequiredMixin` + `UserPassesTestMixin`).
- Consumer WS valida `is_authenticated` y `is_staff`.

### RT-07 — Cambios visuales

- Todo cambio de UI sigue `doc/diseño/DESIGN_SYSTEM.md`.
- `npm run dev` o `npm run build` después de agregar clases nuevas.
- Probar en modo claro y oscuro antes de mergear.

---

## 4. No-requerimientos (fuera de alcance por ahora)

Para evitar scope creep, estos puntos **no están** en el roadmap actual:

- ❌ API pública / REST para terceros.
- ❌ Registro de usuarios self-service (sólo alta manual por staff).
- ❌ Recuperación de contraseña por email.
- ❌ Multitenancy / multi-organización.
- ❌ App móvil nativa.
- ❌ Reportes exportables (PDF / Excel).
- ❌ Auditoría detallada con changelog.
- ❌ Notificaciones push al navegador.

Si alguno se activa, pasarlo a la sección 2 con su RF-XX.

---

## 5. Roadmap del dominio Cáritas (a definir)

Cuando se empiece a modelar el dominio propio de la organización, completar esta sección con historias de usuario concretas. Ejemplos tentativos:

- **Beneficiarios**: alta, búsqueda, seguimiento.
- **Donaciones**: registro, categorías, reportes.
- **Voluntarios**: perfiles, disponibilidad.
- **Inventario**: stock de alimentos/ropa, ingresos y egresos.
- **Eventos**: calendario, asistencia.

Cada una debería tener:
- Usuarios que la usan (perfiles).
- Flujos principales.
- Datos mínimos a guardar.
- Vistas esperadas.

---

## 6. Glosario

| Término | Qué significa |
|---|---|
| **Staff** | Usuario con `is_staff=True`. Acceso al panel interno de Cáritas. |
| **Superusuario** | Usuario con todos los permisos (`is_superuser=True`). Creado con `createsuperuser`. |
| **Grupo** | Rol. Colección de permisos asignada a uno o más usuarios. |
| **Permission** | Acción concreta habilitada (ej. `add_user`, `change_group`). |
| **Dashboard shell** | Layout con sidebar + topbar que envuelve todas las pantallas autenticadas. |
| **Summary endpoint** | `/dashboard/live/summary/` — JSON con las métricas del dashboard. |

---

## 7. Criterios de aceptación transversales

Para **cualquier feature nueva**:

- [ ] Cubre el RF / RT listado en este documento (o se agregó primero).
- [ ] Funciona en modo claro y oscuro.
- [ ] Responsive: mobile (<640px), tablet y desktop.
- [ ] Accesibilidad: teclado + `aria-*` donde corresponde.
- [ ] Sigue el design system (`doc/diseño/DESIGN_SYSTEM.md`).
- [ ] Sigue los patrones definidos en `doc/arquitectura/patronDeDiseño/README.md`.
- [ ] Queries optimizadas (`doc/arquitectura/performance/README.md` §2).
- [ ] Copy en español neutro.
- [ ] Migraciones commiteadas si tocó modelos.

---

## 8. Regla de incorporación de nuevos requerimientos

Ninguna feature nueva entra al proyecto solo por existir como idea suelta.

Antes de implementarla debe quedar definido:

- problema que resuelve
- usuario que la usa
- dominio al que pertenece
- impacto en datos, UI y permisos
- si vive dentro del monolito o exige un proyecto/runtime aparte

Si una idea no puede responder esas preguntas, no está lista para entrar al backlog técnico.
