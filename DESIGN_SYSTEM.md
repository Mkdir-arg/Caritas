# Sistema de Diseño — Cáritas

Guía rápida de tokens y componentes para mantener consistencia entre pantallas.
**Regla de oro**: antes de inventar una clase o variante, buscar acá si ya existe.

---

## 1. Setup y flujo de trabajo

### Stack
- **Tailwind CSS v3.4** (JIT) — clases en templates
- **Django templates** en `templates/`
- CSS de entrada: `static/src/css/input.css`
- CSS compilado: `static/dist/css/app.css` (servido por Django vía `STATICFILES_DIRS`)
- JS: `static/src/js/main.js`

### Recompilar CSS (OBLIGATORIO después de cambios)
```bash
npm run dev     # watch mode, dejar corriendo mientras desarrollás
npm run build   # build único minificado para producción
```
Si agregás clases nuevas en un template y no se ven, casi seguro no corriste esto.
Después, **Ctrl+Shift+R** en el navegador para bustear caché.

### Scope de Tailwind
`tailwind.config.js` escanea:
- `./templates/**/*.html`
- `./apps/**/*.py`
- `./static/src/js/**/*.js`

Si ponés clases en otro lado (ej. JS toggles fuera de `static/src/js`), no se compilan.

---

## 2. Design Tokens

### Colores (definidos en `tailwind.config.js`)

| Token | Hex | Uso |
|---|---|---|
| `ink` | `#101418` | Texto principal (negro cálido, no `black`) |
| `brand-50` | `#eef4ff` | Fondos suaves/hover de elementos brand |
| `brand-100` | `#dce8ff` | Bordes suaves brand |
| `brand-300` | `#9fbcff` | Focus rings, gradientes |
| `brand-500` | `#465fff` | **Color principal** — botones, links, activos |
| `brand-600` | `#3641f5` | Hover de brand-500 |
| `brand-700` | — | Texto brand sobre fondos claros |
| `brand-950` | `#17174b` | Fondos oscuros (login side pane) |
| `shell` | `#f7f7f4` | Fondo alternativo |

Además de los propios de Tailwind: `slate-*`, `emerald-*` (éxito), `rose-*` / `amber-*` (alertas), `gray-*` (modo oscuro).

### Tipografía
- Familia: **Sora** (cargada en `base.html`), fallback `ui-sans-serif, system-ui, sans-serif`.
- Tamaño base del dashboard: `text-[15px]` o `text-sm` (14px).
- Títulos de página: `text-[1.35rem] font-semibold tracking-tight`.
- Títulos de sección: `text-lg font-semibold tracking-[-0.02em]`.
- Etiquetas/kickers: `text-[11px] font-semibold uppercase tracking-[0.22em]`.

### Radios
Escala consistente:
- `rounded-lg` (8px) — inputs compactos, icon buttons pequeños
- `rounded-xl` (12px) — botones, inputs, avatars pequeños
- `rounded-2xl` (16px) — cards secundarias, botones grandes
- `rounded-[1.2rem]` — cards del dashboard home
- `rounded-[1.75rem]` — cards hero / paneles principales
- `rounded-full` — pills, badges, dots, avatars circulares

### Sombras
Usar SIEMPRE estas combinaciones:
- `shadow-theme` → sutil para cards planas (definido en config)
- `shadow-[0_1px_2px_rgba(16,24,40,0.05)]` → equivalente manual
- `shadow-[0_10px_24px_rgba(15,23,42,0.05)]` → cards con elevación media
- `shadow-[0_12px_32px_rgba(15,23,42,0.05)]` → paneles grandes
- `shadow-[0_10px_24px_rgba(70,95,255,0.22)]` → botones brand (sombra de color)
- `shadow-soft` → definido en config, para sidebars

### Espaciado
Escala estándar de Tailwind (`0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4, 5, 6, 7, 8, 10, 12`).

> **NO USAR** valores inválidos como `h-4.5`, `w-4.5`, `gap-4.5`, `h-8.5`. Tailwind v3 **no tiene** esa escala. Si aparecen, la clase se ignora silenciosamente y el elemento se rompe (ej: icono al tamaño SVG nativo = gigante). Usar `h-4` o `h-5`, `gap-4` o `gap-5`.

### Escala de Z-index

Mantener esta jerarquía. Si una capa nueva aparece, ubicarla acá antes de picotear.

| Token | Uso |
|---|---|
| `z-0` | Contenido estático |
| `z-10` | Elementos flotantes dentro de una card (badge, overlay interno) |
| `z-20` | Sticky headers de sección |
| `z-30` | Topbar del dashboard (`_shell.html`) |
| `z-40` | Dropdowns, popovers, tooltips, backdrop del sidebar móvil |
| `z-50` | Sidebar móvil, modales |
| `z-60` | Toasts, notifications (por encima de todo) |

### Tokens de animación

Estándar: **todo lo que cambie visualmente** lleva `transition` + una de estas duraciones.

- Micro-interacciones (hover, focus, toggle): `transition duration-150 ease-out`
- Cambios de layout (panel expand, sidebar collapse): `transition duration-200 ease-out` o `duration-300 ease-in-out`
- Entradas/salidas (modal, toast, drawer): `transition duration-200 ease-out` al entrar, `duration-150 ease-in` al salir

Easings: preferir `ease-out` (acelera rápido, desacelera al final) para la mayoría. `ease-in-out` sólo en transiciones de estado largas.

---

## 3. Modo Oscuro

Activado con `class="dark"` en `<html>` (toggle en header, persiste en `localStorage`).
**Todo componente debe tener variantes `dark:`** para `bg`, `border`, `text`, y opcionalmente sombras.

Mapeo estándar:
| Claro | Oscuro |
|---|---|
| `bg-white` | `dark:bg-gray-900` |
| `bg-slate-50` | `dark:bg-gray-950` |
| `bg-slate-100` | `dark:bg-gray-800` |
| `border-slate-200` | `dark:border-gray-800` |
| `text-ink` | `dark:text-white/90` |
| `text-slate-500` | `dark:text-gray-400` |
| `text-slate-600` | `dark:text-gray-300` |

---

## 4. Componentes

### 4.1 Botones

**Primario (brand)** — acción principal
```html
<button type="submit" class="inline-flex items-center justify-center gap-2 rounded-xl bg-brand-500 px-4 py-2.5 text-sm font-semibold text-white shadow-[0_10px_24px_rgba(70,95,255,0.22)] transition duration-150 ease-out hover:bg-brand-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-300 focus-visible:ring-offset-2">
  <!-- icono opcional h-4 w-4 -->
  Nuevo usuario
</button>
```

**Secundario (outline)** — acción complementaria
```html
<button type="button" class="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 transition duration-150 ease-out hover:bg-slate-100 dark:border-gray-800 dark:bg-gray-950 dark:text-gray-300 dark:hover:bg-gray-900">
  Filtrar
</button>
```

**Peligro (destructivo)** — borrar, desactivar
```html
<button type="button" class="inline-flex items-center justify-center gap-2 rounded-xl bg-rose-500 px-4 py-2.5 text-sm font-semibold text-white transition duration-150 ease-out hover:bg-rose-600">
  Eliminar
</button>
```

**Ghost / link** — acción terciaria
```html
<a class="inline-flex items-center justify-center rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 transition duration-150 ease-out hover:border-slate-300 hover:text-ink dark:border-gray-700 dark:text-gray-300">
  Cancelar
</a>
```

**Icon button** (solo icono, cuadrado)
```html
<a class="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition duration-150 ease-out hover:border-brand-300 hover:bg-brand-50 hover:text-brand-600 dark:border-gray-800 dark:text-gray-300" aria-label="Editar">
  <svg class="h-4 w-4" ...></svg>
</a>
```

**Loading state** (spinner dentro del botón)
```html
<button type="submit" disabled class="inline-flex items-center justify-center gap-2 rounded-xl bg-brand-500 px-4 py-2.5 text-sm font-semibold text-white opacity-70 cursor-not-allowed">
  <svg class="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="3" stroke-opacity="0.25"/>
    <path d="M22 12a10 10 0 0 1-10 10" stroke="currentColor" stroke-width="3" stroke-linecap="round"/>
  </svg>
  Guardando...
</button>
```

**Reglas**:
- Padding estándar: `px-4 py-2.5` (normal), `px-5 py-3` (grande sólo en hero).
- Si está al lado de otro elemento flex, agregar `shrink-0`.
- **Siempre** `aria-label` en icon buttons.
- Siempre `focus-visible:ring-2` para accesibilidad por teclado.

### 4.2 Cards

**Card base**
```html
<article class="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_10px_24px_rgba(15,23,42,0.05)] dark:border-gray-800 dark:bg-gray-900">
  <!-- contenido -->
</article>
```

**Card con header + body separados**
```html
<section class="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_12px_32px_rgba(15,23,42,0.05)] dark:border-gray-800 dark:bg-gray-900">
  <div class="flex flex-col gap-4 border-b border-slate-200 px-6 py-5 dark:border-gray-800 md:flex-row md:items-center md:justify-between">
    <div class="min-w-0">
      <h3 class="text-lg font-semibold tracking-[-0.02em] text-ink dark:text-white/90">Título</h3>
      <p class="mt-1 text-sm leading-6 text-slate-500 dark:text-gray-400">Descripción corta.</p>
    </div>
    <!-- botón primario acá -->
  </div>
  <!-- body -->
</section>
```

**Stat card** (métrica)
```html
<article class="rounded-2xl border border-slate-200 bg-white px-5 py-5 shadow-[0_10px_24px_rgba(15,23,42,0.05)] dark:border-gray-800 dark:bg-gray-900">
  <div class="flex items-center justify-between gap-3">
    <p class="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400 dark:text-gray-500">Etiqueta</p>
    <span class="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-500/15 dark:text-brand-300">
      <svg class="h-4 w-4" ...></svg>
    </span>
  </div>
  <p class="mt-4 text-3xl font-semibold tracking-tight text-ink dark:text-white/90">123</p>
  <p class="mt-1.5 text-sm leading-6 text-slate-500 dark:text-gray-400">Descripción de la métrica.</p>
</article>
```

Grid de stats: `grid gap-4 grid-cols-1 sm:grid-cols-3`.

### 4.3 Badges / Pills

**Estado exitoso (activo)**
```html
<span class="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-300">
  <span class="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
  Activo
</span>
```

**Estado pendiente**
```html
<span class="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-600 dark:bg-amber-500/10 dark:text-amber-300">
  <span class="h-1.5 w-1.5 rounded-full bg-amber-500"></span>
  Pendiente
</span>
```

**Estado error**
```html
<span class="inline-flex items-center gap-1.5 rounded-full bg-rose-50 px-2.5 py-1 text-xs font-semibold text-rose-600 dark:bg-rose-500/10 dark:text-rose-300">
  <span class="h-1.5 w-1.5 rounded-full bg-rose-500"></span>
  Error
</span>
```

**Tag neutro** (grupos, categorías)
```html
<span class="inline-flex rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600 dark:bg-gray-800 dark:text-gray-300">
  Admin
</span>
```

**Tag removible** (para chips de filtros activos)
```html
<span class="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600 dark:bg-gray-800 dark:text-gray-300">
  Admin
  <button type="button" class="text-slate-400 hover:text-rose-500" aria-label="Quitar filtro Admin">
    <svg class="h-3 w-3" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="2">
      <path d="M3 3l6 6M9 3l-6 6" stroke-linecap="round"/>
    </svg>
  </button>
</span>
```

### 4.4 Inputs

**Input de texto estándar**
```html
<input type="text" class="w-full rounded-xl border border-slate-200 bg-white py-2.5 px-4 text-sm text-ink placeholder:text-slate-400 shadow-[0_1px_2px_rgba(15,23,42,0.04)] focus:border-brand-300 focus:outline-none focus:ring-2 focus:ring-brand-100 dark:border-gray-800 dark:bg-gray-950 dark:text-white/90 dark:placeholder:text-gray-500 dark:focus:border-brand-500/40 dark:focus:ring-brand-500/20">
```

**Input con icono a la izquierda** (buscador)
```html
<div class="relative w-full">
  <span class="pointer-events-none absolute left-3 top-1/2 flex h-4 w-4 -translate-y-1/2 items-center justify-center text-slate-400 dark:text-gray-500">
    <svg class="h-4 w-4" ...></svg>
  </span>
  <input type="text" placeholder="Buscar..." class="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm ...">
</div>
```

**Input con error**
```html
<input type="email" aria-invalid="true" class="w-full rounded-xl border border-rose-300 bg-rose-50/40 ... focus:border-rose-400 focus:ring-rose-100 dark:border-rose-500/50 dark:bg-rose-950/20">
```

**Form field completo** (label + input + help + error)
```html
<div>
  <label for="email" class="block text-sm font-medium text-slate-700 dark:text-gray-200">
    Correo <span class="text-rose-500" aria-hidden="true">*</span>
  </label>
  <input id="email" type="email" required class="mt-1.5 w-full rounded-xl border border-slate-200 ...">
  <p class="mt-1.5 text-xs text-slate-500 dark:text-gray-400">Lo usamos para notificaciones.</p>
  <p class="mt-1.5 text-sm text-rose-600 dark:text-rose-300">Ingresá un correo válido.</p>
</div>
```

### 4.5 Form controls (checkbox / radio / toggle)

`@tailwindcss/forms` ya está instalado, estiliza bases pero falta nuestro look.

**Checkbox**
```html
<label class="flex items-start gap-3 cursor-pointer">
  <input type="checkbox" class="mt-0.5 h-4 w-4 rounded border-slate-300 text-brand-500 focus:ring-2 focus:ring-brand-200 focus:ring-offset-0 dark:border-gray-700 dark:bg-gray-900">
  <span class="text-sm text-slate-700 dark:text-gray-200">Acepto los términos y condiciones</span>
</label>
```

**Radio group**
```html
<fieldset class="space-y-2">
  <legend class="text-sm font-medium text-slate-700 dark:text-gray-200">Rol</legend>
  <label class="flex items-center gap-3 cursor-pointer">
    <input type="radio" name="role" value="admin" class="h-4 w-4 border-slate-300 text-brand-500 focus:ring-2 focus:ring-brand-200 dark:border-gray-700 dark:bg-gray-900">
    <span class="text-sm text-slate-700 dark:text-gray-200">Administrador</span>
  </label>
  <label class="flex items-center gap-3 cursor-pointer">
    <input type="radio" name="role" value="editor" class="h-4 w-4 border-slate-300 text-brand-500 focus:ring-2 focus:ring-brand-200 dark:border-gray-700 dark:bg-gray-900">
    <span class="text-sm text-slate-700 dark:text-gray-200">Editor</span>
  </label>
</fieldset>
```

**Toggle switch**
```html
<label class="inline-flex items-center gap-3 cursor-pointer">
  <span class="relative inline-flex h-6 w-11 shrink-0">
    <input type="checkbox" class="peer sr-only">
    <span class="absolute inset-0 rounded-full bg-slate-200 transition-colors peer-checked:bg-brand-500 dark:bg-gray-700"></span>
    <span class="absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform peer-checked:translate-x-5"></span>
  </span>
  <span class="text-sm font-medium text-slate-700 dark:text-gray-200">Notificaciones activas</span>
</label>
```

**Select estilizado**
```html
<div class="relative">
  <select class="w-full appearance-none rounded-xl border border-slate-200 bg-white py-2.5 pl-4 pr-10 text-sm text-ink shadow-[0_1px_2px_rgba(15,23,42,0.04)] focus:border-brand-300 focus:outline-none focus:ring-2 focus:ring-brand-100 dark:border-gray-800 dark:bg-gray-950 dark:text-white/90">
    <option>Todos</option>
    <option>Activos</option>
    <option>Pendientes</option>
  </select>
  <svg class="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.8">
    <path stroke-linecap="round" stroke-linejoin="round" d="m6 8 4 4 4-4"/>
  </svg>
</div>
```

### 4.6 Tabla

Regla: usar `<colgroup>` para anchos fijos. Así evitás que se desparramen las columnas.

```html
<div class="overflow-x-auto">
  <table class="w-full border-collapse table-auto">
    <colgroup>
      <col class="w-[28%]">
      <col class="w-[22%]">
      <col class="w-[18%]">
      <col class="w-[12%]">
      <col class="w-[12%]">
      <col class="w-[8%]">
    </colgroup>
    <thead class="bg-slate-50 dark:bg-gray-950/40">
      <tr class="text-left text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500 dark:text-gray-400">
        <th class="px-6 py-3">Columna</th>
        <th class="px-6 py-3 text-right">Acción</th>
      </tr>
    </thead>
    <tbody class="divide-y divide-slate-100 dark:divide-gray-800">
      <tr class="transition hover:bg-slate-50/70 dark:hover:bg-gray-950/40">
        <td class="px-6 py-3.5 align-middle">...</td>
      </tr>
    </tbody>
  </table>
</div>
```

**NO HACER**: filas con `border-separate`, `rounded-[1.35rem]` y bordes izquierdo/derecho separados — se ve roto. Usar `divide-y`.

**Avatar de celda** (iniciales)
```html
<div class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-50 text-sm font-semibold text-brand-600 dark:bg-brand-500/15 dark:text-brand-300">
  {{ user.username|first|upper }}
</div>
```

### 4.7 Paginación

Pensada para Django `Paginator`. Va debajo de la tabla.

```html
<nav class="flex flex-col gap-3 border-t border-slate-200 px-6 py-4 dark:border-gray-800 sm:flex-row sm:items-center sm:justify-between" aria-label="Paginación">
  <p class="text-sm text-slate-500 dark:text-gray-400">
    Mostrando <span class="font-medium text-ink dark:text-white/90">{{ page_obj.start_index }}–{{ page_obj.end_index }}</span>
    de <span class="font-medium text-ink dark:text-white/90">{{ page_obj.paginator.count }}</span>
  </p>
  <div class="flex items-center gap-1">
    {% if page_obj.has_previous %}
      <a href="?page={{ page_obj.previous_page_number }}" class="inline-flex h-9 items-center justify-center rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium text-slate-600 transition hover:bg-slate-50 dark:border-gray-800 dark:bg-gray-950 dark:text-gray-300">← Anterior</a>
    {% else %}
      <span class="inline-flex h-9 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm font-medium text-slate-300 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-600">← Anterior</span>
    {% endif %}

    {% for num in page_obj.paginator.page_range %}
      {% if num == page_obj.number %}
        <span class="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-brand-500 text-sm font-semibold text-white">{{ num }}</span>
      {% elif num > page_obj.number|add:'-3' and num < page_obj.number|add:'3' %}
        <a href="?page={{ num }}" class="inline-flex h-9 w-9 items-center justify-center rounded-lg text-sm font-medium text-slate-600 transition hover:bg-slate-100 dark:text-gray-300 dark:hover:bg-gray-800">{{ num }}</a>
      {% endif %}
    {% endfor %}

    {% if page_obj.has_next %}
      <a href="?page={{ page_obj.next_page_number }}" class="inline-flex h-9 items-center justify-center rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium text-slate-600 transition hover:bg-slate-50 dark:border-gray-800 dark:bg-gray-950 dark:text-gray-300">Siguiente →</a>
    {% endif %}
  </div>
</nav>
```

### 4.8 Tabs

Markup (ver también `static/src/js/main.js` para la lógica):
```html
<div class="inline-flex rounded-2xl border border-slate-200 bg-white/90 p-1.5 shadow-[0_8px_24px_rgba(15,23,42,0.05)] dark:border-gray-800 dark:bg-gray-950/80" role="tablist">
  <button type="button" class="rounded-xl px-5 py-2 text-sm font-semibold text-slate-500 transition dark:text-gray-400" data-access-tab="users" aria-selected="true" role="tab">Usuarios</button>
  <button type="button" class="rounded-xl px-5 py-2 text-sm font-semibold text-slate-500 transition dark:text-gray-400" data-access-tab="roles" aria-selected="false" role="tab">Roles</button>
</div>

<div data-access-panel="users" role="tabpanel"> ... </div>
<div class="hidden" data-access-panel="roles" role="tabpanel"> ... </div>
```

El JS toggea `bg-white text-ink shadow-sm` (+ equivalentes dark) en el tab activo.

### 4.9 Alertas / Messages

```html
<!-- Éxito -->
<div class="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-950/50 dark:text-emerald-300" role="status">
  Mensaje
</div>

<!-- Error -->
<div class="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-900/60 dark:bg-rose-950/40 dark:text-rose-300" role="alert">
  Mensaje
</div>

<!-- Info -->
<div class="rounded-2xl border border-brand-100 bg-brand-50 px-4 py-3 text-sm text-brand-700 dark:border-brand-500/30 dark:bg-brand-500/10 dark:text-brand-300" role="status">
  Mensaje
</div>
```

### 4.10 Toast / Notifications

Container fijo arriba a la derecha, los toasts se empujan desde abajo. Necesita JS para aparecer/desaparecer con auto-dismiss.

**Container** (agregar al final del `<body>`):
```html
<div id="toast-container" class="pointer-events-none fixed top-4 right-4 z-[60] flex w-full max-w-sm flex-col gap-2" aria-live="polite"></div>
```

**Template de toast**:
```html
<div class="pointer-events-auto flex items-start gap-3 rounded-2xl border border-emerald-200 bg-white px-4 py-3 shadow-[0_12px_32px_rgba(15,23,42,0.12)] dark:border-emerald-900/60 dark:bg-gray-900" role="alert">
  <span class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-300">
    <svg class="h-4 w-4" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2">
      <path stroke-linecap="round" stroke-linejoin="round" d="m4.5 10.5 3.25 3.25L15.5 6"/>
    </svg>
  </span>
  <div class="min-w-0 flex-1">
    <p class="text-sm font-semibold text-ink dark:text-white/90">Usuario creado</p>
    <p class="mt-0.5 text-sm text-slate-500 dark:text-gray-400">Se envió el correo de bienvenida.</p>
  </div>
  <button type="button" class="text-slate-400 hover:text-slate-600 dark:hover:text-gray-300" aria-label="Cerrar">
    <svg class="h-4 w-4" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.8">
      <path stroke-linecap="round" d="m5 5 10 10M15 5 5 15"/>
    </svg>
  </button>
</div>
```

Variantes: cambiar color del icono y borde (`emerald` éxito, `rose` error, `amber` advertencia, `brand` info).

### 4.11 Modal / Dialog

Preferir el elemento nativo `<dialog>` — ya trae focus trap y cierre con `Esc`.

```html
<dialog id="user-modal" class="rounded-2xl border border-slate-200 bg-white p-0 shadow-[0_40px_80px_rgba(15,23,42,0.25)] backdrop:bg-slate-950/50 backdrop:backdrop-blur-sm dark:border-gray-800 dark:bg-gray-900 open:animate-[fadeIn_0.15s_ease-out]">
  <div class="w-[min(90vw,32rem)]">
    <header class="flex items-start justify-between gap-4 border-b border-slate-200 px-6 py-5 dark:border-gray-800">
      <div>
        <h2 class="text-lg font-semibold tracking-[-0.02em] text-ink dark:text-white/90">Título del modal</h2>
        <p class="mt-1 text-sm text-slate-500 dark:text-gray-400">Subtítulo opcional.</p>
      </div>
      <button type="button" onclick="this.closest('dialog').close()" class="shrink-0 text-slate-400 hover:text-slate-600 dark:hover:text-gray-300" aria-label="Cerrar">
        <svg class="h-5 w-5" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.8">
          <path stroke-linecap="round" d="m5 5 10 10M15 5 5 15"/>
        </svg>
      </button>
    </header>
    <div class="px-6 py-5">
      <!-- contenido -->
    </div>
    <footer class="flex items-center justify-end gap-3 border-t border-slate-200 px-6 py-4 dark:border-gray-800">
      <button type="button" onclick="this.closest('dialog').close()" class="... [botón ghost]">Cancelar</button>
      <button type="submit" class="... [botón primario]">Guardar</button>
    </footer>
  </div>
</dialog>

<!-- Abrir: -->
<button onclick="document.getElementById('user-modal').showModal()">Abrir</button>
```

### 4.12 Confirmation dialog (destructivo)

Variante del modal para confirmar acciones peligrosas.

```html
<dialog id="confirm-delete" class="rounded-2xl border border-slate-200 bg-white p-0 shadow-[0_40px_80px_rgba(15,23,42,0.25)] backdrop:bg-slate-950/50 dark:border-gray-800 dark:bg-gray-900">
  <div class="w-[min(90vw,26rem)] p-6">
    <div class="flex items-start gap-4">
      <span class="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-rose-50 text-rose-600 dark:bg-rose-500/15 dark:text-rose-300">
        <svg class="h-5 w-5" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.8">
          <path stroke-linecap="round" stroke-linejoin="round" d="M10 7v4m0 3h.01M10 2.5 1.5 17h17L10 2.5Z"/>
        </svg>
      </span>
      <div class="min-w-0">
        <h2 class="text-base font-semibold text-ink dark:text-white/90">¿Eliminar usuario?</h2>
        <p class="mt-1 text-sm text-slate-500 dark:text-gray-400">Esta acción no se puede deshacer. Se borrarán todos los accesos asociados.</p>
      </div>
    </div>
    <div class="mt-5 flex items-center justify-end gap-3">
      <button type="button" onclick="this.closest('dialog').close()" class="inline-flex items-center justify-center rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 hover:border-slate-300 hover:text-ink dark:border-gray-700 dark:text-gray-300">Cancelar</button>
      <form method="post" action="..." class="inline">
        {% csrf_token %}
        <button type="submit" class="inline-flex items-center justify-center rounded-xl bg-rose-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-rose-600">Sí, eliminar</button>
      </form>
    </div>
  </div>
</dialog>
```

### 4.13 Dropdown menu

Para acciones por fila o menú de usuario. Necesita un pequeño JS para toggle (o usar `<details>` para no-JS).

```html
<div class="relative inline-block">
  <button type="button" data-dropdown-trigger class="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 dark:text-gray-300 dark:hover:bg-gray-800" aria-haspopup="menu" aria-expanded="false" aria-label="Acciones">
    <svg class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
      <circle cx="4" cy="10" r="1.5"/><circle cx="10" cy="10" r="1.5"/><circle cx="16" cy="10" r="1.5"/>
    </svg>
  </button>
  <div data-dropdown-menu class="absolute right-0 top-full z-40 mt-1 hidden w-48 rounded-xl border border-slate-200 bg-white py-1.5 shadow-[0_20px_40px_rgba(15,23,42,0.12)] dark:border-gray-800 dark:bg-gray-900" role="menu">
    <a href="#" class="flex items-center gap-2 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 dark:text-gray-200 dark:hover:bg-gray-800" role="menuitem">
      <svg class="h-4 w-4 text-slate-400" ...></svg>
      Editar
    </a>
    <a href="#" class="flex items-center gap-2 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 dark:text-gray-200 dark:hover:bg-gray-800" role="menuitem">
      <svg class="h-4 w-4 text-slate-400" ...></svg>
      Duplicar
    </a>
    <div class="my-1 border-t border-slate-100 dark:border-gray-800"></div>
    <button type="button" class="flex w-full items-center gap-2 px-3 py-2 text-sm text-rose-600 hover:bg-rose-50 dark:text-rose-300 dark:hover:bg-rose-950/40" role="menuitem">
      <svg class="h-4 w-4" ...></svg>
      Eliminar
    </button>
  </div>
</div>
```

### 4.14 Drawer / off-canvas

Panel lateral para detalles sin cambiar de página.

```html
<!-- Backdrop -->
<div data-drawer-backdrop class="fixed inset-0 z-40 hidden bg-slate-950/30"></div>

<!-- Drawer -->
<aside data-drawer class="fixed inset-y-0 right-0 z-50 flex w-full max-w-md translate-x-full flex-col bg-white shadow-[0_40px_80px_rgba(15,23,42,0.25)] transition-transform duration-200 ease-out dark:bg-gray-900" aria-hidden="true">
  <header class="flex items-start justify-between gap-4 border-b border-slate-200 px-6 py-4 dark:border-gray-800">
    <div>
      <h2 class="text-base font-semibold text-ink dark:text-white/90">Detalle</h2>
      <p class="mt-0.5 text-xs text-slate-500 dark:text-gray-400">Subtítulo</p>
    </div>
    <button type="button" data-drawer-close class="shrink-0 text-slate-400 hover:text-slate-600" aria-label="Cerrar panel">
      <svg class="h-5 w-5" ...></svg>
    </button>
  </header>
  <div class="flex-1 overflow-y-auto px-6 py-5">
    <!-- contenido -->
  </div>
  <footer class="border-t border-slate-200 px-6 py-4 dark:border-gray-800">
    <!-- acciones -->
  </footer>
</aside>
```

### 4.15 Breadcrumbs

Para vistas anidadas.

```html
<nav class="flex items-center gap-1.5 text-sm" aria-label="Breadcrumb">
  <a href="{% url 'core:dashboard' %}" class="text-slate-500 hover:text-brand-600 dark:text-gray-400">Inicio</a>
  <svg class="h-3.5 w-3.5 text-slate-300 dark:text-gray-600" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.8">
    <path stroke-linecap="round" d="m8 5 5 5-5 5"/>
  </svg>
  <a href="{% url 'core:access_management' %}" class="text-slate-500 hover:text-brand-600 dark:text-gray-400">Usuarios</a>
  <svg class="h-3.5 w-3.5 text-slate-300 dark:text-gray-600" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.8">
    <path stroke-linecap="round" d="m8 5 5 5-5 5"/>
  </svg>
  <span class="font-medium text-ink dark:text-white/90" aria-current="page">Editar matias</span>
</nav>
```

### 4.16 Tooltip

CSS puro con `group` de Tailwind (no necesita JS).

```html
<span class="relative inline-flex group">
  <button type="button" class="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100" aria-label="Editar usuario">
    <svg class="h-4 w-4" ...></svg>
  </button>
  <span class="pointer-events-none absolute bottom-full left-1/2 z-40 mb-2 -translate-x-1/2 whitespace-nowrap rounded-lg bg-ink px-2.5 py-1 text-xs font-medium text-white opacity-0 transition-opacity duration-150 group-hover:opacity-100" role="tooltip">
    Editar usuario
  </span>
</span>
```

### 4.17 Loading spinner

```html
<!-- Spinner chico (dentro de botón) -->
<svg class="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
  <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="3" stroke-opacity="0.25"/>
  <path d="M22 12a10 10 0 0 1-10 10" stroke="currentColor" stroke-width="3" stroke-linecap="round"/>
</svg>

<!-- Spinner centrado (loading de página/sección) -->
<div class="flex items-center justify-center py-12">
  <svg class="h-8 w-8 animate-spin text-brand-500" viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="3" stroke-opacity="0.2"/>
    <path d="M22 12a10 10 0 0 1-10 10" stroke="currentColor" stroke-width="3" stroke-linecap="round"/>
  </svg>
</div>
```

### 4.18 Skeleton loader

Placeholder de contenido mientras carga. Usar `animate-pulse`.

```html
<!-- Skeleton de row de tabla -->
<tr class="animate-pulse">
  <td class="px-6 py-3.5">
    <div class="flex items-center gap-3">
      <div class="h-9 w-9 shrink-0 rounded-full bg-slate-200 dark:bg-gray-800"></div>
      <div class="flex-1 space-y-2">
        <div class="h-3 w-24 rounded bg-slate-200 dark:bg-gray-800"></div>
        <div class="h-2.5 w-16 rounded bg-slate-100 dark:bg-gray-800/60"></div>
      </div>
    </div>
  </td>
  <td class="px-4 py-3.5"><div class="h-3 w-32 rounded bg-slate-200 dark:bg-gray-800"></div></td>
  <td class="px-4 py-3.5"><div class="h-5 w-16 rounded-full bg-slate-200 dark:bg-gray-800"></div></td>
</tr>

<!-- Skeleton de card -->
<article class="animate-pulse rounded-2xl border border-slate-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
  <div class="h-3 w-20 rounded bg-slate-200 dark:bg-gray-800"></div>
  <div class="mt-4 h-8 w-16 rounded bg-slate-200 dark:bg-gray-800"></div>
  <div class="mt-2 h-3 w-40 rounded bg-slate-100 dark:bg-gray-800/60"></div>
</article>
```

### 4.19 Hero de sección

Banner destacado arriba de una pantalla.
```html
<section class="rounded-[1.75rem] border border-slate-200 bg-[radial-gradient(circle_at_top_left,_rgba(70,95,255,0.12),_transparent_42%),linear-gradient(180deg,_#ffffff_0%,_#f8fbff_100%)] px-6 py-7 shadow-[0_20px_50px_rgba(15,23,42,0.06)] dark:border-gray-800 dark:bg-[radial-gradient(circle_at_top_left,_rgba(70,95,255,0.16),_transparent_38%),linear-gradient(180deg,_rgba(17,24,39,0.96),_rgba(17,24,39,1))] sm:px-8 sm:py-8">
  <!-- contenido -->
</section>
```

### 4.20 Empty state

```html
<div class="rounded-xl border border-dashed border-slate-200 px-6 py-12 text-center dark:border-gray-800">
  <!-- icono ilustrativo opcional -->
  <div class="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400 dark:bg-gray-800 dark:text-gray-500">
    <svg class="h-6 w-6" ...></svg>
  </div>
  <p class="text-sm font-medium text-slate-700 dark:text-gray-200">Todavía no hay usuarios</p>
  <p class="mt-1 text-sm text-slate-500 dark:text-gray-400">Creá el primero para empezar a ordenar accesos.</p>
  <a href="..." class="mt-4 inline-flex items-center justify-center gap-2 rounded-xl bg-brand-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-600">
    Crear primero
  </a>
</div>
```

---

## 5. Clases compuestas ya definidas en `input.css`

Preferir éstas antes de repetir combinaciones largas.

| Clase | Uso |
|---|---|
| `.auth-shell` / `.auth-layout` / `.auth-main-pane` / `.auth-side-pane` | Estructura del login |
| `.auth-input` | Input de formularios de auth |
| `.auth-logo-mark` | Logo circular del brand (44×44) |
| `.auth-grid` | Fondo decorativo con grid (pantalla login) |
| `.dashboard-panel` | Panel de contenido con padding y sombra |
| `.dashboard-stat-card` | Card de métrica |
| `.dashboard-mini-card` | Card secundaria más compacta |
| `.dashboard-kicker` | Label uppercase tracked brand |
| `.dashboard-badge-positive` | Pill verde de estado positivo |
| `.dashboard-progress` + `span` | Barra de progreso con gradiente brand |
| `.dashboard-icon-button` | Botón cuadrado con icono (44×44) |

> Si algo se repite 3+ veces en templates, agregarlo a `@layer components` en `static/src/css/input.css` y documentarlo acá.

---

## 6. Iconografía

Usamos SVG inline (no librerías externas). Reglas fijas:

- **`viewBox="0 0 20 20"`** para iconos chicos de UI (24x24 sólo si el original lo requiere).
- **`stroke-width="1.8"`** consistente en toda la app. Si un icono se ve muy grueso, no bajar el stroke — usar otro icono.
- **`stroke-linecap="round"`** y **`stroke-linejoin="round"`** siempre.
- **`fill="none"`** + `stroke="currentColor"` para que herede el color del padre.
- **`aria-hidden="true"`** si es decorativo, o envolver en un `<span>` con `aria-label` si es semántico.

**Tamaños estándar** (no inventar otros):
| Tamaño | Clase | Uso |
|---|---|---|
| 12px | `h-3 w-3` | Separadores, chevrons chiquitos |
| 14px | `h-3.5 w-3.5` | Breadcrumbs |
| 16px | `h-4 w-4` | **Por defecto** — botones, inputs, icon buttons |
| 20px | `h-5 w-5` | Topbar, sidebar items, headers |
| 24px | `h-6 w-6` | Empty states, hero |
| 32px | `h-8 w-8` | Loading spinners |

---

## 7. Layout y responsive

### Shell
Toda pantalla autenticada extiende `dashboard/_shell.html`:
```django
{% extends "dashboard/_shell.html" %}
{% block title %}Mi Página | {{ BRAND_NAME }}{% endblock %}
{% block dashboard_content %}
  <div class="space-y-6 text-[15px]">
    <!-- secciones -->
  </div>
{% endblock %}
```

El shell aporta: sidebar colapsable, topbar, heading de página (`page_kicker`, `page_title`, `page_description`).
Para el item activo del menú: `active_nav` en el contexto (`'dashboard'` o `'access'`).

### Breakpoints

| BP | Min width | Área útil (con sidebar 220px) | Uso |
|---|---|---|---|
| `sm` | 640px | 420px | Stacked layouts, mobile |
| `md` | 768px | 548px | Tablet portrait |
| `lg` | 1024px | 804px | **Sidebar aparece acá** |
| `xl` | 1280px | 1060px | Desktop estándar |
| `2xl` | 1536px | 1316px | Monitores grandes |

> Para grids dentro del content area, preferir `sm:grid-cols-3` antes que `md:grid-cols-3`: el sidebar come 220px en lg+, así que `md` a veces queda apretado.

### Patrones responsive clave

**Tabla en mobile** → mantener `overflow-x-auto` con `min-w-[X]` razonable. Alternativa cuando la tabla es importante: convertir cada fila en card apilada debajo de `md`.

**Sidebar** → `fixed -translate-x-full lg:translate-x-0`. En <lg aparece con overlay + backdrop (ver `_shell.html`).

**Grid de stats** → `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3` o `sm:grid-cols-3` directamente.

**Hero con card lateral** → `flex-col xl:flex-row`. Abajo de xl la card secundaria va debajo.

**Form 2 columnas** → `grid gap-4 md:grid-cols-2`. Campos largos (textarea, multi-select) con `md:col-span-2`.

---

## 8. Accesibilidad

Mínimos no negociables. Ninguno es caro de agregar.

- **Focus visible** — todo lo clickeable lleva `focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-300 focus-visible:ring-offset-2` (ajustar color para dark).
- **Labels asociados** — todo `<input>` con `<label for>` o envuelto en `<label>`.
- **`aria-label`** en icon buttons.
- **`aria-live="polite"`** en contenedores de toast.
- **`role="alert"`** en alertas de error.
- **`aria-current="page"`** en el item activo del sidebar y último breadcrumb.
- **Contraste**: `text-slate-500` sobre `bg-white` pasa WCAG AA. No usar `text-slate-400` para texto importante.
- **Navegación por teclado**: `Esc` cierra modales y drawers. `Tab` no se escapa del modal abierto (usar `<dialog>` nativo que ya hace focus trap).
- **No sólo color**: los estados se diferencian también con iconos o texto (ej. el badge "Activo" tiene dot + texto, no sólo verde).

---

## 9. Estados de formulario

### Validación

Dos niveles, combinables:
1. **Resumen arriba** — para errores de servidor (`form.non_field_errors`). Alerta roja arriba del form.
2. **Inline por campo** — mensaje rojo debajo del input con `aria-invalid="true"`.

### Marcadores visuales
- Campo requerido: asterisco `text-rose-500` al lado del label, aclarar al inicio del form "Los campos con * son obligatorios".
- Campo con error: borde `border-rose-300`, fondo `bg-rose-50/40`, focus ring rojo.
- Campo deshabilitado: `opacity-60 cursor-not-allowed bg-slate-50`.

### Botón submit
- Estado normal: botón primario.
- Enviando: mismo botón con spinner y `disabled`, texto "Guardando..." (ver sección 4.1).
- Éxito: redirect + toast verde "Guardado".
- Error: permanece en la página, alerta arriba + resalta campos rotos.

---

## 10. Guía de copy

Tono: **claro, cercano, español neutro**. No usar jerga técnica con usuarios finales.

### Botones (verbo + objeto, breve)
✅ "Nuevo usuario", "Guardar cambios", "Eliminar grupo", "Cancelar"
❌ "Submit", "Click aquí", "OK"

### Empty states (explicar + invitar)
✅ "Todavía no hay usuarios creados. Creá el primero para empezar a ordenar accesos."
❌ "No hay datos." / "Vacío."

### Errores (qué pasó + qué hacer)
✅ "No pudimos guardar los cambios. Revisá que el correo sea válido e intentá de nuevo."
❌ "Error 500" / "Algo falló."

### Confirmaciones (qué va a pasar + consecuencia)
✅ "¿Eliminar usuario? Esta acción no se puede deshacer."
❌ "¿Está usted seguro?"

### Fechas
Formato `YYYY-MM-DD` en tablas (ordenable). Para texto de usuario, "15 de abril" o "hace 3 días".

### Números
Separador de miles con punto: `12.435`. Moneda con `$` al inicio, sin decimales salvo contabilidad.

---

## 11. Templates de página (starter)

### Página de listado
```
Hero (opcional)
  ↓
Filtros/búsqueda (sección aparte o dentro del card del listado)
  ↓
Tabla con paginación
  ↓
Empty state si no hay data
```

### Página de formulario
```
Breadcrumbs (si aplica)
  ↓
Card con form
  ↓
Footer del card: botones [Cancelar] [Guardar]
```

### Página de detalle
```
Breadcrumbs
  ↓
Header con título + acciones primarias
  ↓
Grid: columna principal (info) + aside (metadata, actividad)
```

---

## 12. Checklist antes de pushear UI

- [ ] `npm run build` corrido después de últimas ediciones
- [ ] Probado en **modo claro y oscuro** (toggle en el topbar)
- [ ] Probado en **mobile, tablet y desktop** (sidebar colapsa en <lg)
- [ ] Botones con `aria-label` si son solo icono
- [ ] Inputs con `<label>` asociado
- [ ] Focus visible funciona (tabear sin mouse)
- [ ] Sin clases inválidas (ej. `h-4.5`, `gap-9.5`)
- [ ] Empty states cubiertos (`{% empty %}`)
- [ ] Cards en dark tienen `dark:border-gray-800` + `dark:bg-gray-900` (o `950`)
- [ ] Copy en español neutro, sin "click aquí" ni "Submit"

---

## 13. Errores comunes a evitar

1. **Usar `h-4.5`, `w-4.5`, `gap-4.5`, etc.** No existen. La clase se ignora y el elemento se rompe (caso típico: icono SVG renderiza al tamaño nativo = gigante).
2. **Olvidar rebuild de Tailwind**. Clases nuevas no aparecen hasta correr `npm run dev`/`build`.
3. **Filas de tabla con `border-separate` y bordes redondeados por celda**. Se ve quebrado. Usar `divide-y`.
4. **Botón al lado de texto flex sin `shrink-0`**. El botón se aplasta.
5. **Input + icono absoluto sin `pl-10`/`pl-11`**. El texto queda debajo del icono.
6. **Olvidar variantes `dark:`**. La pantalla entera se rompe al cambiar tema.
7. **Grid con `md:grid-cols-3` en paneles con sidebar**. El área útil en md es ~550px — usar `sm:grid-cols-3`.
8. **Arbitrary values con opacidades exóticas** (`from-brand-500/15`) — a veces no compilan. Si falla, usar sólido (`bg-brand-50`).
9. **`role="alert"` en toasts de éxito** — usar `role="status"` para no-urgentes.
10. **Z-index picoteado** (`z-[9999]`). Usar la escala de la sección 2.
11. **Modales custom sin focus trap** — preferir `<dialog>` nativo.
12. **Tooltip sin delay** — queda intrusivo. Agregar `delay-300` o diferir el hover.
