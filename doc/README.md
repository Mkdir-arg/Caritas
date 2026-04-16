# Documentación — Cáritas

Punto de entrada de la documentación del proyecto. **Cualquier agente o desarrollador que arranca acá debe leer al menos esta página antes de tocar código.**

---

## Mapa rápido

| Carpeta | Qué hay | Cuándo leerla |
|---|---|---|
| [`desarrollo/`](./desarrollo/README.md) | Biblia del proyecto: reglas de evolución, creación de apps, carpetas, servicios y definición de terminado | **Siempre segunda lectura**, después de esta portada. |
| [`requerimiento/`](./requerimiento/README.md) | Qué tiene que hacer la app: RFs, RTs, fuera de alcance, glosario | **Primero**. Antes de planear cualquier feature. |
| [`arquitectura/basededatos/`](./arquitectura/basededatos/README.md) | Motor (MySQL), modelos, migraciones, queries, convenciones de datos | Antes de tocar `models.py`, migraciones o queries. |
| [`arquitectura/patronDeDiseño/`](./arquitectura/patronDeDiseño/README.md) | Estructura de carpetas, CBV + mixins, Channels, signals, templates | Antes de crear vistas, consumers, signals o reorganizar código. |
| [`arquitectura/performance/`](./arquitectura/performance/README.md) | Estrategia de queries, WebSockets, cache, static files, checklist | Antes de optimizar o cuando algo va lento. |
| [`diseño/DESIGN_SYSTEM.md`](./diseño/DESIGN_SYSTEM.md) | Tokens, componentes, modo oscuro, accesibilidad, copy | Cualquier cambio de UI. |
| [`decisiones/`](./decisiones/README.md) | Registro de decisiones arquitectónicas (ADRs) | Cuando se cambia la estructura o se adopta nueva infraestructura. |

ADR vigente inicial: [`ADR-0001 — Adopcion de realtime con Django Channels y Redis`](./decisiones/ADR-0001-adopcion-de-realtime-con-django-channels-y-redis.md)

---

## Stack en 1 línea

Django 5 + MySQL 8 + Redis 7 + Channels (WebSockets) + Tailwind v3, todo orquestado con Docker Compose.

---

## Cómo arranca un agente nuevo

1. **Lee `doc/desarrollo/README.md`** → entendé las reglas con las que se gobierna el repo.
2. **Lee `doc/requerimiento/README.md`** → entendé qué tiene que hacer la app y qué *no* está en alcance.
3. **Lee `doc/arquitectura/patronDeDiseño/README.md`** → así sabés dónde va cada cosa nueva.
4. Si vas a tocar **UI**, abrí `doc/diseño/DESIGN_SYSTEM.md`.
5. Si vas a tocar **datos**, abrí `doc/arquitectura/basededatos/README.md`.
6. Si vas a tocar **algo que va lento o crítico**, abrí `doc/arquitectura/performance/README.md`.
7. Sólo entonces escribí código.

---

## Reglas de oro transversales

- **Antes de inventar**, fijate si ya existe (clase, mixin, componente, patrón).
- **No agregar features fuera de alcance** sin actualizar primero `requerimiento/`.
- **Toda pantalla nueva** sigue el design system. Sin excepciones.
- **Toda vista del dashboard** combina `StaffRequiredMixin + DashboardShellMixin + <CBV>`.
- **Toda query de listado** usa `prefetch_related` / `select_related` / `annotate` cuando corresponda.
- **Todo cambio de Tailwind** requiere `npm run dev` o `npm run build` antes de probar.
- **Toda nueva app, carpeta top-level o servicio** debe quedar justificado en `doc/desarrollo/README.md` o en una ADR.

---

## Mantenimiento de esta doc

- Si una decisión arquitectónica cambia, **actualizar el .md correspondiente en el mismo PR**.
- Si aparece un nuevo dominio (ej. beneficiarios, donaciones), agregar su sección en `requerimiento/` y los modelos en `arquitectura/basededatos/`.
- Si se adopta una nueva infraestructura o se reorganiza el repo, registrar una ADR en `doc/decisiones/`.
- Si una sección queda desactualizada por más de un sprint, mejor borrarla que dejarla mintiendo.

---

## Referencias rápidas a código

| Tema | Archivo clave |
|---|---|
| Vistas + mixins | `apps/core/views.py` |
| Forms con estilos Tailwind | `apps/core/forms.py` |
| Signals → broadcast realtime | `apps/core/signals.py` |
| WebSocket consumer | `apps/core/consumers.py` |
| Routing HTTP | `apps/core/urls.py` |
| Routing WS | `apps/core/routing.py` + `config/routing.py` |
| ASGI entry | `config/asgi.py` |
| Settings | `config/settings/base.py` |
| Variables globales en templates | `apps/core/context_processors.py` |
| Layout base de pantallas autenticadas | `templates/dashboard/_shell.html` |
