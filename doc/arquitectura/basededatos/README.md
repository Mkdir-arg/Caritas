# Base de Datos — Cáritas

Guía de motor, modelos, migraciones y convenciones de datos.
**Regla de oro**: antes de crear un modelo nuevo, verificar si el dato ya vive en `auth_user` / `auth_group` / `auth_permission`.

---

## 1. Motor

- **MySQL 8.0** en producción y desarrollo (vía Docker).
- **SQLite** como fallback automático: si `MYSQL_HOST` está vacío, `config/settings/base.py` cae a `db.sqlite3` en la raíz. Útil para pruebas rápidas, **no** para el flujo normal.
- Charset: `utf8mb4` / `utf8mb4_unicode_ci`.
- `sql_mode='STRICT_TRANS_TABLES'` forzado desde `OPTIONS.init_command`.
- `DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"` → todas las PKs son `BIGINT`.

### Credenciales (dev)

Las carga `django-environ` desde `.env` (ver `.env.example`):

| Variable | Default | Descripción |
|---|---|---|
| `MYSQL_HOST` | `db` | Nombre del servicio en `docker-compose.yml` |
| `MYSQL_PORT` | `3306` | |
| `MYSQL_DATABASE` | `caritas` | |
| `MYSQL_USER` | `caritas` | |
| `MYSQL_PASSWORD` | `caritaspass` | Cambiar en prod |
| `MYSQL_ROOT_PASSWORD` | `rootpass` | Sólo para el contenedor `db` |

---

## 2. Modelos actuales

El proyecto **no tiene modelos de dominio propios todavía** — `apps/core/` no tiene `models.py`. Se apoya en los que ya trae Django:

| Modelo | App | Uso |
|---|---|---|
| `User` (`django.contrib.auth.models.User`) | `auth` | Cuentas internas. Se accede vía `get_user_model()`. |
| `Group` | `auth` | Roles / agrupaciones de permisos. |
| `Permission` | `auth` | Permisos granulares asociados a `ContentType`. |
| `Session` | `sessions` | Sesiones (login). TTL configurado en la vista (`set_expiry(0)` si no se marca "Recordarme"). |

Cuando se agreguen entidades de dominio (ej. beneficiarios, donaciones, inventario), se crea un `models.py` en la app correspondiente y se documenta acá.

### Relaciones clave

```
User ──M2M──> Group ──M2M──> Permission
                              │
                              └── FK ──> ContentType
```

- `User.groups` es M2M a `Group` (tabla intermedia `auth_user_groups`).
- `Group.permissions` es M2M a `Permission`.
- Se escucha el signal `m2m_changed` sobre `User.groups.through` en `apps/core/signals.py` para refrescar el dashboard realtime.

---

## 3. Migraciones

```bash
docker compose exec web python manage.py makemigrations
docker compose exec web python manage.py migrate
```

- Al agregar modelos, crear la migración **dentro del contenedor** para que use la misma versión de Python/Django que runtime.
- Commitear siempre los archivos `0001_initial.py`, `0002_*.py`, etc.
- **Nunca** editar migraciones aplicadas en main. Si hay que revertir, crear una nueva que deshaga los cambios.
- Antes de renombrar/eliminar un campo, verificar que no se referencie en `signals.py` o `views.py`.

### Squashing

No se hizo squash todavía. Cuando haya más de ~20 migraciones en una app, considerar `squashmigrations`.

---

## 4. Superusuario

```bash
docker compose exec web python manage.py createsuperuser
```

El proyecto se apoya en `is_staff=True` para el acceso al dashboard (ver `StaffRequiredMixin` en `apps/core/views.py:63`). Un usuario sin `is_staff` queda bloqueado aunque se pueda loguear — también lo usa el consumer de WebSocket para aceptar/rechazar conexiones (`apps/core/consumers.py:10`).

---

## 5. Queries y performance

### Patrón estándar en vistas

- Usar `prefetch_related` para M2M (ej: `User.objects.prefetch_related("groups")`).
- Usar `select_related` para FKs (ej: `Permission.objects.select_related("content_type")`).
- Agregar conteos con `annotate(Count(...))` en vez de contar en Python.

Ejemplo real en `apps/core/views.py`:

```python
User.objects.prefetch_related("groups").order_by("username")
Group.objects.annotate(member_count=Count("user")).order_by("name")
```

### A evitar

- `.all()` en templates sin `prefetch_related` cuando hay M2M.
- Llamar `count()` en loop (usar `annotate`).
- `len(queryset)` si sólo necesitás el número → usar `.count()`.

---

## 6. Datos y backup

- Volumen persistente: `mysql_data` en `docker-compose.yml`.
- Para resetear desde cero: `docker compose down -v` (⚠ borra el volumen).
- Backup manual:
  ```bash
  docker compose exec db mysqldump -u root -p$MYSQL_ROOT_PASSWORD caritas > backup.sql
  ```

---

## 7. Convenciones

- **Nombres de tabla**: dejar el default de Django (`app_model`). No forzar `db_table`.
- **Fechas**: siempre con `USE_TZ = True` (UTC en DB, TZ de Buenos Aires al renderizar).
- **Booleanos de estado**: `is_active`, `is_staff` — seguir el patrón de Django (prefix `is_`).
- **Soft delete**: no se usa. Si se necesita, definirlo primero acá antes de inventar un patrón por modelo.
- **Text fields**: preferir `CharField(max_length=...)` sobre `TextField` salvo que el contenido sea realmente largo.
- **Choices**: usar `TextChoices` / `IntegerChoices` (Django 3+), no tuplas sueltas.

---

## 8. Cómo debe crecer la capa de datos

### Cuándo crear modelos propios

No crear modelos porque "quizás después sirvan".
Crear modelos cuando exista una necesidad funcional explícita en `doc/requerimiento/README.md`.

### Cuándo crear una app nueva por dominio

Si un conjunto de modelos empieza a representar un dominio propio, no debe quedar mezclado en `core`.

Ejemplos futuros razonables:

- `apps/beneficiarios/models.py`
- `apps/donaciones/models.py`
- `apps/voluntarios/models.py`

### Regla de consistencia

Todo modelo nuevo debe definir, además del código:

- su lugar en el dominio (`requerimiento/`)
- sus reglas de integridad
- si necesita índices especiales
- cómo impacta queries, realtime y permisos

Si no se puede explicar eso en documentación, el modelo todavía no está bien definido.

---

## 9. Próximos pasos (dominio Cáritas)

Cuando se empiece a modelar el dominio propio, documentar acá:

- Entidades (beneficiarios, donaciones, voluntarios, etc.).
- Diagrama ER.
- Índices no-default agregados.
- Campos sensibles (DNI, teléfono) y cómo se protegen.
