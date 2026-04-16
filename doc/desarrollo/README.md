# Biblia de Desarrollo — Caritas

Documento normativo para desarrollar el proyecto de forma consistente.
No describe solamente el estado actual: define **como se trabaja, como se decide y como se hace crecer** el repo.

---

## 1. Proposito

Esta guia existe para evitar tres problemas clasicos:

- crecimiento desordenado del repo
- decisiones tecnicas repetidas o contradictorias
- features bien hechas en lo puntual, pero inconsistentes con el resto del sistema

Si una decision entra en conflicto con esta guia, la guia manda hasta que se actualice explicitamente en el mismo cambio.

---

## 2. Orden obligatorio de lectura

Toda persona, agente o colaborador que vaya a tocar el repo debe leer en este orden:

1. `doc/README.md`
2. `doc/desarrollo/README.md`
3. `doc/requerimiento/README.md`
4. `doc/arquitectura/patronDeDiseño/README.md`
5. La documentacion especifica del area que va a tocar (`basededatos`, `performance`, `diseño`)

No arrancar por el codigo.

---

## 3. Principios no negociables

### 3.1 Un solo criterio de desarrollo

- Toda feature nueva debe encajar en los patrones del proyecto.
- Si no entra, primero se ajusta la documentacion, despues se escribe codigo.

### 3.2 Evolucion guiada por dominio

- No se crean carpetas, apps o proyectos porque "queda mas prolijo".
- Se crean cuando representan un limite claro de dominio, runtime, despliegue o responsabilidad.

### 3.3 La documentacion es parte del cambio

- Si cambia la arquitectura, cambian estas docs en el mismo PR.
- Si aparece un nuevo dominio, se actualiza `doc/requerimiento/README.md` antes o durante la implementacion.

### 3.4 El repo debe poder ser entendido por alguien nuevo

- El criterio de ubicacion de archivos debe ser explicable en una frase.
- Si una decision necesita demasiada explicacion oral, la estructura esta mal o la doc esta incompleta.

---

## 4. Regla de decision: donde va cada cosa

### 4.1 Cambiar dentro de la app actual `apps/core`

Se trabaja dentro de `apps/core` si el cambio pertenece a alguno de estos frentes ya existentes:

- autenticacion y sesiones
- dashboard general
- gestion de usuarios, grupos y permisos
- realtime asociado a esas pantallas
- layout/base del panel

Mientras el dominio siga siendo "panel interno y accesos", no crear otra app.

### 4.2 Crear una nueva app Django en `apps/`

Crear `apps/<dominio>/` cuando exista un bounded context nuevo con al menos varias de estas condiciones:

- tiene modelos propios
- tiene flujos propios de alta/edicion/listado
- tiene reglas de negocio separables
- tiene templates y forms propios
- puede evolucionar con relativa independencia

Ejemplos probables:

- `apps/beneficiarios`
- `apps/donaciones`
- `apps/voluntarios`
- `apps/inventario`

No crear una app por pantalla. Crear una app por dominio.

### 4.3 Crear un proyecto standalone en la raiz

Solo se permite si hay un runtime distinto o una necesidad tecnica realmente separada del monolito Django.

Criterios validos:

- otro framework o build system
- otro proceso de deploy
- otro ciclo de dependencias
- UI o servicio que no encaja en templates Django

Ejemplo actual:

- `agent-ui/` es valido porque es un runtime independiente basado en Next.js

### 4.4 Crear una carpeta top-level nueva

No crear carpetas nuevas en la raiz salvo estas categorias:

- nueva app agrupada bajo `apps/`
- nuevo proyecto standalone de runtime real
- infraestructura (`docker/`, `scripts/`, `infra/`)
- documentacion (`doc/`)
- activos globales ya estandarizados (`templates/`, `static/`, `media/`)

Si una carpeta top-level nueva es necesaria:

1. justificarla en `doc/desarrollo/README.md`
2. actualizar `doc/README.md`
3. si es arquitectonica, registrar una ADR en `doc/decisiones/`

---

## 5. Estructura objetivo del proyecto

### 5.1 Estructura base del monolito

```text
Caritas/
├── apps/
│   ├── core/
│   └── <dominio>/
├── config/
├── templates/
├── static/
├── doc/
├── docker/
├── media/
└── <proyecto-standalone-opcional>/
```

### 5.2 Estructura objetivo de una nueva app Django

No todos los archivos nacen el dia uno, pero **este es el layout esperado** para cualquier app nueva que crezca en serio:

```text
apps/<dominio>/
├── __init__.py
├── apps.py
├── admin.py
├── models.py
├── urls.py
├── views.py
├── forms.py
├── services.py
├── selectors.py
├── signals.py
├── consumers.py
├── routing.py
└── tests/
    ├── __init__.py
    ├── test_models.py
    ├── test_views.py
    ├── test_services.py
    └── test_realtime.py
```

Regla:

- `services.py` para logica de negocio o casos de uso
- `selectors.py` para lecturas/queries reutilizables
- `views.py` no debe convertirse en un deposito de toda la logica

### 5.3 Estructura objetivo de un proyecto standalone

Si aparece otro runtime aparte de Django:

```text
<proyecto-standalone>/
├── src/
├── package.json o pyproject.toml
├── README.md
└── .env.example
```

Debe tener:

- README propio
- dependencias aisladas
- script de arranque claro
- integracion documentada desde `doc/README.md`

---

## 6. Flujo obligatorio para desarrollar una feature

### Antes de escribir codigo

1. leer `requerimiento/`
2. identificar el dominio afectado
3. decidir si entra en `apps/core` o si amerita nueva app
4. validar impacto en UI, datos, realtime y performance
5. actualizar docs si la decision cambia el marco existente

### Durante la implementacion

1. mantener el patron de la capa afectada
2. no introducir infraestructura nueva sin justificarla
3. no duplicar patrones ya existentes
4. mantener copy y UI alineados al design system

### Antes de cerrar

1. validar codigo y templates
2. recompilar Tailwind si hubo clases nuevas
3. validar Docker/servicios si hubo cambios de infraestructura
4. actualizar doc si se cambio una convencion

---

## 7. Criterios para separar logica

### Views

Una view puede:

- orquestar el request
- delegar a forms, selectors o services
- armar contexto o respuesta

Una view no deberia:

- contener reglas de negocio complejas
- repetir querysets largos en varias pantallas
- serializar manualmente logica repetida en varios endpoints

### Services

Mover a `services.py` cuando:

- la logica modifica varias entidades
- hay pasos de negocio encadenados
- la misma accion puede ser llamada desde view, signal o task futura

### Selectors

Mover a `selectors.py` cuando:

- el mismo patron de lectura se repite
- una query tiene joins, annotate o filtros no triviales
- la consulta tiene valor semantico propio (`top_groups`, `recent_users`, etc.)

---

## 8. Reglas para infraestructura nueva

### Redis

- valido como channel layer y cache
- no usarlo como solucion por defecto para cualquier problema

### Channels

- usarlo solo para realtime real
- preferir `signal -> broadcast -> refetch` antes que empujar datasets grandes por socket

### Nuevos servicios Docker

Solo agregar un servicio si cumple un rol claro del sistema.

Ejemplos validos:

- `redis`
- un worker de background
- un servicio de busqueda

Ejemplos invalidos:

- un contenedor solo para ejecutar una tarea manual esporadica
- un servicio duplicado de algo que ya resuelve el monolito

---

## 9. Definicion de terminado

Una feature no esta terminada si solo "anda".
Esta terminada cuando:

- respeta requerimientos
- respeta arquitectura
- respeta design system
- respeta performance minima razonable
- deja una explicacion suficiente para el proximo que venga

---

## 10. Antipatrones prohibidos

1. crear carpetas nuevas sin documentar por que existen
2. meter logica de negocio compleja en templates o JS del navegador
3. dejar una app nueva sin tests aunque ya tenga modelos o services
4. usar `apps/core` como cajon infinito cuando el dominio ya pide separacion
5. agregar un proyecto nuevo sin README, `.env.example` y criterio de integracion
6. cambiar arquitectura sin actualizar `doc/`

---

## 11. Regla para decisiones arquitectonicas

Toda decision relevante de estructura debe registrarse en `doc/decisiones/` cuando afecte alguna de estas cosas:

- nueva app
- nuevo proyecto standalone
- nuevo servicio de infraestructura
- cambio de patron dominante
- adopcion o abandono de una tecnologia central

Si no vale la pena documentar la decision, probablemente tampoco vale la pena introducir el cambio.