# Patrones de Diseño — Cáritas

Cómo está organizado el código y qué patrones seguir al agregar features.
**Regla de oro**: antes de crear un archivo nuevo, fijarse si lo que querés hacer ya tiene lugar asignado.

---

## 1. Estructura de carpetas

```
Caritas/
├── apps/
│   └── core/                  # Única app por ahora. Nuevas apps van al lado.
│       ├── apps.py            # Registra signals en ready()
│       ├── admin.py           # Branding del admin (site_header, etc.)
│       ├── views.py           # Class-Based Views + mixins
│       ├── urls.py            # Rutas HTTP de la app
│       ├── routing.py         # Rutas WebSocket de la app
│       ├── consumers.py       # Consumers de Channels (WS)
│       ├── signals.py         # post_save / post_delete / m2m_changed
│       ├── forms.py           # Forms con estilos Tailwind aplicados
│       └── context_processors.py  # Variables globales en templates
├── config/
│   ├── settings/base.py       # Settings compartidos
│   ├── urls.py                # URLconf raíz (include de apps)
│   ├── routing.py             # Re-exporta websocket_urlpatterns de apps
│   ├── wsgi.py                # Sync (runserver legacy)
│   └── asgi.py                # Async (daphne, Channels) — entrada real
├── templates/                 # Templates a nivel proyecto (no por app)
│   ├── auth/
│   ├── dashboard/
│   └── layouts/
├── static/
│   ├── src/                   # Fuente (Tailwind input, JS)
│   └── dist/                  # Build de Tailwind (servido)
├── doc/                       # Esta documentación
├── docker/web/                # Dockerfile + start.sh
└── manage.py
```

### Estructura objetivo cuando el proyecto crezca

El repo hoy es un monolito Django con un proyecto standalone adicional (`agent-ui/`).
La regla para crecer es:

- nuevos dominios del monolito van en `apps/<dominio>/`
- nuevos runtimes independientes pueden vivir como proyecto standalone en la raiz **solo si** tienen build/deploy/dependencias propias
- no se crean carpetas top-level arbitrarias para "ordenar un poco"

Si aparece un segundo o tercer proyecto standalone, documentar si conviene seguir en raiz o agruparlos con una convención explícita. Esa decisión requiere ADR.

---

## 2. Patrones Django (MVT + CBV)

### Vistas basadas en clase (CBV) + mixins

Todas las vistas del dashboard extienden una combinación de mixins para no repetir lógica. Ver `apps/core/views.py`.

**Jerarquía**:

```
StaffRequiredMixin (autorización)
  └── LoginRequiredMixin + UserPassesTestMixin (chequea is_staff)

DashboardShellMixin (contexto de layout)
  └── Inyecta active_nav, page_kicker, page_title, page_description

AccessUserCreateView = StaffRequiredMixin + DashboardShellMixin + CreateView
```

**Regla**: cualquier vista del dashboard debe combinar `StaffRequiredMixin + DashboardShellMixin + <CBV genérica>`. No escribir function-based views.

### Genéricas usadas

- `TemplateView` → pantallas de lectura (dashboard home, access management).
- `CreateView` / `UpdateView` → forms de alta/edición (usuarios, grupos).
- `View` bare → endpoints JSON (ej. `DashboardSummaryView`).
- `LoginView` / `LogoutView` custom → auth con toggle de "recordarme".

### Forms

- Todos los forms viven en `apps/core/forms.py`.
- Usan `ModelForm` o `UserCreationForm` como base.
- Los estilos Tailwind se aplican en `__init__` vía el helper `_style_fields(self)` — **no repetir clases en cada campo**. Si un form necesita variantes de estilo, extender el helper.
- Labels siempre en español (`"Correo electrónico"`, `"Nombre del grupo"`).

### URLs

- Cada app tiene su `urls.py` con `app_name = "core"` → reverse: `reverse_lazy("core:dashboard")`.
- `config/urls.py` sólo hace `include`. No meter rutas sueltas ahí.
- La ruta del admin de Django está en `/djga/` (oculta), no en `/admin/`. El `/admin/` del proyecto es el panel de gestión de accesos propio.

---

## 3. Real-time con Django Channels

Patrón: **signal → broadcast → consumer → client refresh**.

### Flujo

```
[User / Group save o delete]
        │
        ▼
  signals.py (post_save / post_delete / m2m_changed)
        │
        ▼
  broadcast_dashboard_refresh("reason")
        │ async_to_sync(channel_layer.group_send)
        ▼
  Redis (channel layer)
        │
        ▼
  DashboardConsumer.dashboard_refresh
        │ await self.send_json({"type": "dashboard.refresh", ...})
        ▼
  Cliente JS refetch de /dashboard/live/summary/
```

### Convenciones

- **Un único grupo WS** por ahora: `"dashboard_updates"`. Si aparece otra pantalla realtime, nombrarlo `"<pantalla>_updates"`.
- Los consumers validan autenticación **y** `is_staff=True`. Cerrar con código 4403 si no pasa.
- Los signals se registran en `apps.py → ready()` con `from . import signals  # noqa: F401`. **Nunca** importar signals desde otro lado.
- El payload del WS es JSON con `type` + `reason`. El cliente decide qué hacer.
- **Nunca** hacer queries pesadas dentro del consumer en el handler realtime — devolver sólo un ping de "refrescá". El cliente llama a `DashboardSummaryView` para los datos.

### ASGI

- Entry point: `config/asgi.py` con `ProtocolTypeRouter`.
- `http` → `get_asgi_application()` (Django normal).
- `websocket` → `AuthMiddlewareStack(URLRouter(websocket_urlpatterns))`.
- `config/routing.py` re-exporta las rutas WS de las apps (patrón igual a `urls.py`).

---

## 4. Context processors

`apps/core/context_processors.py` expone variables globales en todos los templates:

- `BRAND_NAME` → `"Caritas"`.
- `APP_CSS_VERSION` → mtime de `static/dist/css/app.css`, usado para cache-busting en `base.html`.

**Regla**: antes de pasar una variable "al layout" desde cada vista, considerá si va acá.

---

## 5. Templates

### Jerarquía

```
base.html                       # HTML root, fonts, theme toggle
  └── layouts/auth.html         # Layout split (main + side pane)
       └── auth/login.html
  └── dashboard/_shell.html     # Sidebar + topbar + heading
       └── dashboard/home.html
       └── dashboard/access_management.html
       └── dashboard/access_form.html
```

- Toda pantalla autenticada extiende `dashboard/_shell.html` y rellena `{% block dashboard_content %}`.
- El shell consume `active_nav` / `page_kicker` / `page_title` / `page_description` del contexto (inyectados por `DashboardShellMixin`).

### Reglas

- No meter lógica compleja en templates — si hacés más de un `{% if %}` anidado, moverlo a la view.
- Usar `{% url 'core:xxx' %}`, nunca hardcodear paths.
- Para componentes que se repiten 3+ veces, considerar `{% include %}` o una clase compuesta en `static/src/css/input.css` (ver `doc/diseño/DESIGN_SYSTEM.md` §5).

---

## 6. Autorización

- **Pública**: sólo `/` (login).
- **Staff-only** (`is_staff=True`): todo el dashboard y los WebSockets.
- No se usa DRF ni JWT — sesiones Django nativas.
- `LOGIN_URL` y `LOGIN_REDIRECT_URL` centralizados en `base.py`.
- `remember me`: si el POST no manda `remember`, la sesión expira al cerrar el browser (`request.session.set_expiry(0)`).

---

## 7. Static files

- **Fuente**: `static/src/css/input.css` + `static/src/js/main.js`.
- **Build**: Tailwind genera `static/dist/css/app.css` (servicio `tailwind` en docker-compose, modo watch).
- **Servido**: `Whitenoise` con `CompressedManifestStaticFilesStorage` → genera hashes para cache-busting.
- `STATICFILES_DIRS` incluye tanto `dist` como `src` (JS se sirve desde `src` directamente).

---

## 8. Convenciones de código

### Python

- **Nombres**: `snake_case` para funciones/vars, `PascalCase` para clases.
- **Encoding**: evitar tildes en identificadores o log strings (`"actualizacion"` en vez de `"actualización"` en `signals.py` porque el file está en utf-8 pero el log handler puede no estarlo).
- **Imports**: stdlib → Django → terceros → locales, separados por línea en blanco.
- **Docstrings**: no obligatorios, pero si una función no es evidente, una línea basta.

### Nuevas apps

Cuando se cree `apps/<nueva_app>/`:

1. Agregar a `INSTALLED_APPS` en `base.py`.
2. Incluir en `config/urls.py` si tiene rutas HTTP.
3. Si tiene WebSockets, crear `routing.py` y re-exportar desde `config/routing.py`.
4. Si tiene signals, registrarlos en `apps.py → ready()`.

### Layout recomendado para nuevas apps

Para no seguir inflando `views.py` con el tiempo, cualquier app nueva con lógica de negocio real debería tender a este esquema:

```text
apps/<dominio>/
├── models.py
├── views.py
├── forms.py
├── services.py
├── selectors.py
├── signals.py
├── consumers.py
├── routing.py
└── tests/
```

No hace falta crear todos esos archivos el primer día, pero sí respetar esa dirección cuando el dominio madure.

### Cuándo crear una app nueva

Crear una app nueva si el cambio trae un dominio con identidad propia:

- modelos propios
- permisos o reglas de negocio propios
- vistas y formularios propios
- evolución separable de `core`

No crear apps por pantalla ni por capricho organizativo.

### Cuándo crear un proyecto standalone

Solo si hay una razón técnica dura:

- framework distinto
- runtime distinto
- despliegue separado
- build separado

`agent-ui/` es un ejemplo válido. Una página nueva del sistema no lo es.

---

## 9. Qué NO hacer

1. **Function-based views** para endpoints del dashboard → usar siempre CBV con mixins.
2. **Queries pesadas en signals** — los signals deben ser baratos y delegar al consumer el trabajo.
3. **Sessions de ORM en el consumer async** — usar `database_sync_to_async` si hace falta.
4. **Importar `signals.py` desde `models.py`** — la conexión va en `apps.py → ready()`.
5. **Mezclar rutas HTTP y WS** en un mismo `urlpatterns` — `urls.py` ≠ `routing.py`.
6. **Hardcodear URLs** en templates o redirecciones — usar `reverse_lazy` / `{% url %}`.
7. **Poner clases Tailwind directamente en widgets** en `forms.py` — centralizar en `_style_fields()`.
8. **Crear carpetas top-level nuevas** sin documentar por qué existen y qué responsabilidad tienen.
9. **Usar `apps/core` como app comodín infinita** cuando ya existe un dominio suficientemente grande para separarse.
