# Caritas

Base inicial con Django, MySQL, Docker y Tailwind CSS.

## Stack

- Django 5
- MySQL 8
- Tailwind CSS 3
- Docker Compose

## Estructura

- `apps/core`: app inicial para vistas y urls.
- `config/settings`: settings separados por entorno.
- `templates`: plantillas Django.
- `static/src/css`: entrada de Tailwind.
- `static/dist/css`: salida compilada de Tailwind.
- `docker/web`: Dockerfile y script de arranque.

## Arranque

```bash
docker compose up --build
```

El sitio queda disponible en `http://localhost:8000`.
