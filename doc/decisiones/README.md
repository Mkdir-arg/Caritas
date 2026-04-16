# Registro de Decisiones Arquitectonicas

Carpeta para ADRs (Architecture Decision Records).

No se usa para describir el estado actual, sino para dejar rastro de **por que** se tomo una decision importante.

---

## Cuando crear una ADR

Crear un archivo nuevo cuando se tome una decision que cambie o condicione:

- estructura de carpetas
- creacion de una nueva app Django
- incorporacion de un proyecto standalone
- incorporacion de una dependencia estructural (Redis, Channels, Celery, etc.)
- cambios de patron de arquitectura
- cambios de despliegue o runtime

---

## Formato sugerido

Nombre de archivo:

```text
ADR-0001-titulo-corto.md
```

Contenido minimo:

```md
# ADR-0001 — Titulo

## Estado
Aceptada | Reemplazada | Obsoleta

## Contexto
Que problema habia.

## Decision
Que se decide concretamente.

## Consecuencias
Que simplifica, que complica, que obliga a hacer despues.

## Alternativas descartadas
Que se evaluo y por que no se eligio.
```

---

## Regla

Si una decision modifica como crece el repo y no queda registrada aca, esa decision queda incompleta.