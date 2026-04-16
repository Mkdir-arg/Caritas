# Performance — Cáritas

Estrategias y checklist de performance para mantener la app ágil.
**Regla de oro**: medir antes de optimizar. No adivinar cuellos de botella.

---

## 1. Stack de performance

| Capa | Herramienta | Rol |
|---|---|---|
| Web | Daphne (ASGI) | Sirve HTTP + WebSockets |
| App | Django 5 | Request/response, ORM |
| DB | MySQL 8 (`utf8mb4`) | Persistencia |
| Cache / channel layer | Redis 7 | Canal de broadcast WS (no se usa aún para cache de vistas) |
| Static | Whitenoise (`CompressedManifestStaticFilesStorage`) | Hashing + gzip/brotli de estáticos |
| Frontend | Tailwind JIT v3 | CSS tree-shaken, sólo las clases usadas |

---

## 2. Base de datos

### Querysets óptimos

El patrón ya aplicado en `apps/core/views.py`:

```python
User.objects.prefetch_related("groups").order_by("username")
Group.objects.annotate(member_count=Count("user")).order_by("name")
Permission.objects.select_related("content_type")
```

**Reglas**:

1. **M2M → `prefetch_related`** (`User.groups`, `Group.permissions`).
2. **FK → `select_related`** (`Permission.content_type`).
3. **Conteos → `annotate(Count(...))`**, nunca `.count()` en loop.
4. **Listar y paginar → `Paginator`** de Django (20–50 por página). Ver `doc/diseño/DESIGN_SYSTEM.md` §4.7 para el markup.
5. **Filtrar en DB, no en Python** — usar `.filter()` encadenable.

### Índices

Django agrega índices automáticos para:

- PKs (`id BIGINT AUTO_INCREMENT`).
- FKs.
- Campos `unique=True` y `db_index=True`.
- M2M intermedias.

Cuando se agreguen modelos de dominio, agregar índices explícitos para:

- Campos usados en `ORDER BY`.
- Campos usados frecuentemente en `WHERE`.
- Combinaciones con `Meta.indexes = [Index(fields=[...])]`.

### Detección de N+1

En desarrollo, activar `django.db.backends` en logging para ver el SQL:

```python
LOGGING = {
    "version": 1,
    "loggers": {"django.db.backends": {"level": "DEBUG", "handlers": ["console"]}},
    ...
}
```

Si aparece la misma query repetida por cada row, falta `prefetch_related` / `select_related`.

---

## 3. Real-time (WebSockets)

### Principios

- **Broadcast ligero**: el mensaje WS sólo dispara "refrescá", el cliente llama a `/dashboard/live/summary/` para traer datos.
  → evita serializar datasets grandes en cada evento.
- **Un grupo único por pantalla** (`dashboard_updates`). Evitar explosión de grupos por usuario si no hace falta.
- **No trabajar dentro del signal**: `broadcast_dashboard_refresh()` es `async_to_sync(group_send)` → no hacer queries antes de llamarlo.

### Cuándo agregar throttling

Si se multiplica la concurrencia (muchos cambios en segundos), agregar debouncing en el cliente:

```js
// ejemplo: agrupa múltiples refrescos en una sola llamada cada 500ms
let pending;
socket.onmessage = () => {
  clearTimeout(pending);
  pending = setTimeout(fetchSummary, 500);
};
```

En servidor: si el ratio de eventos pasa de ~5/seg sostenido, considerar un canal intermedio que colapse eventos antes del group_send.

### Consumer: buenas prácticas

- Mantener `connect()` rápido (ya valida auth + staff).
- No hacer queries dentro del handler realtime — delegar al cliente.
- Si hace falta DB en un consumer, usar `channels.db.database_sync_to_async`.

---

## 4. Cache

### Estado actual

- **No hay cache de vistas** configurado.
- **No hay cache de template fragments** todavía.
- Redis **sólo** se usa como channel layer.

### Cuándo agregar cache

Candidatos claros:

| Recurso | Estrategia sugerida | TTL |
|---|---|---|
| `build_dashboard_summary()` | `cache.get_or_set("dashboard_summary", build_dashboard_summary, 30)` | 30s |
| Listas de permisos (no cambian seguido) | `cache_page` | 5 min |
| Context processor `brand` (lee mtime de CSS) | memoizar en proceso | hasta reload |

Backend: `django-redis` sobre el mismo Redis (`REDIS_URL`), en DB distinta (ej. `/1` para channel layer, `/2` para cache).

**Importante**: si se cachea el summary, **invalidar** desde los signals (`cache.delete("dashboard_summary")` antes del `broadcast_dashboard_refresh`).

---

## 5. Static files

### Tailwind (CSS)

- **JIT** solo compila clases detectadas en los paths de `tailwind.config.js`:
  - `./templates/**/*.html`
  - `./apps/**/*.py`
  - `./static/src/js/**/*.js`
- Si una clase vive fuera de esos paths, no se incluye → evita CSS inflado pero rompe si no se sigue la convención.
- `npm run build` para build minificado (producción).
- `npm run dev` para watch (desarrollo, corre en el contenedor `tailwind`).

### Whitenoise

- Hash en filename → cache inmutable del browser.
- Gzip + brotli precomputados al hacer `collectstatic`.
- No necesita nginx para servir estáticos (simplifica el stack).

**Deploy**: `python manage.py collectstatic --noinput` dentro del build.

### Cache-busting a nivel app

`APP_CSS_VERSION` (context processor `brand`) agrega el mtime del CSS compilado como query string. Así, tras un build nuevo, el browser busca la versión nueva aunque Whitenoise mantenga el path.

---

## 6. Frontend

### JS

- Un único `main.js` en `static/src/js/`. No hay bundler (aún). Si crece, considerar Vite/esbuild.
- Fetch del summary con `fetch("/dashboard/live/summary/")` → respuesta JSON liviana.
- Evitar librerías pesadas (Chart.js, Alpine, React) salvo necesidad concreta.

### Tipografía y fuentes

- **Sora** cargada por `<link>` con `font-display: swap` (desde `base.html`).
- No agregar más fuentes sin justificar — cada family adiciona ~30–80KB.

### Imágenes

- `MEDIA_ROOT` = `/media/`. Para producción: servir con CDN o nginx, no con Django.
- Preferir SVG inline para iconos (ver DESIGN_SYSTEM §6).

---

## 7. Checklist antes de pushear

- [ ] Vistas nuevas usan `prefetch_related` / `select_related` donde corresponde.
- [ ] Paginación en cualquier listado que pueda pasar de ~50 filas.
- [ ] Signals no hacen queries pesadas.
- [ ] Consumers WebSocket validan auth + staff y no bloquean.
- [ ] Si se agregó CSS, `npm run build` antes del commit o el build del contenedor `tailwind` está corriendo.
- [ ] No se agregaron librerías JS/CSS innecesarias.
- [ ] Endpoints JSON (`DashboardSummaryView` style) devuelven sólo lo necesario — nada de serializar el User completo.

---

## 8. Medición

### Herramientas recomendadas (no instaladas aún)

- **django-debug-toolbar** → perfilado de queries en desarrollo.
- **django-silk** → SQL + stack profiling.
- **MySQL slow query log** → `long_query_time=1` en dev.
- **EXPLAIN** sobre queries sospechosas directamente en MySQL.

### Qué medir primero

1. Tiempo total de `DashboardView.get()` (puede dominar el summary).
2. Queries por request (target: <10 para pantallas de lista).
3. Latencia del WebSocket refresh (ping → fetch summary → render).
4. Tamaño del CSS compilado (`static/dist/css/app.css`). Target: <80KB gzipped.

---

## 9. Qué NO hacer

1. **Cachear sin invalidar** — el dashboard queda desincronizado.
2. **`.all()` + loop en template** con M2M sin `prefetch_related`.
3. **Queries dentro de signals** — sólo hacer el broadcast.
4. **Abrir DB en el consumer async** sin `database_sync_to_async`.
5. **Subir todo el queryset al JSON** — filtrar y proyectar.
6. **Agregar dependencias JS pesadas** sin medir el costo real.
7. **Desactivar `CompressedManifestStaticFilesStorage`** para "ahorrar" build time — rompe el cache-busting.

---

## 10. Reglas de evolución para no degradar el sistema

### Antes de agregar infraestructura nueva

Preguntarse en este orden:

1. ¿Se resuelve con mejor query, paginación o cache?
2. ¿Se resuelve con refactor de responsabilidades?
3. ¿Realmente hace falta una tecnología nueva?

Solo si las respuestas anteriores no alcanzan, incorporar infraestructura.

### Casos válidos para crecer

- agregar cache de Redis para lecturas calientes
- agregar worker/background jobs cuando aparezcan tareas fuera del request
- separar un servicio standalone solo cuando haya una razón de runtime o escalabilidad clara

### Casos inválidos para crecer

- agregar una herramienta porque "suena enterprise"
- dividir el sistema antes de que exista un cuello de botella real
- introducir WebSockets, cola o cache en una feature que todavía no demostró necesitarlo
