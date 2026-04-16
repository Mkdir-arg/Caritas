# Caritas

Base inicial con Django, MySQL, Redis, WebSockets y Tailwind CSS.

## Stack

- Django 5
- MySQL 8
- Redis 7
- Django Channels
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

## Realtime

El proyecto ahora incluye una capa realtime con Django Channels + Redis.

- Redis corre como servicio de `docker compose`.
- El ASGI de Django expone WebSockets en `/ws/dashboard/`.
- El dashboard escucha cambios en usuarios y grupos y refresca sus métricas sin recargar la página.

Para verlo funcionando, levantá el stack completo y abrí `http://localhost:8000/dashboard/`. Cuando crees, edites o elimines usuarios o grupos, el dashboard conectado debería actualizarse en vivo.
