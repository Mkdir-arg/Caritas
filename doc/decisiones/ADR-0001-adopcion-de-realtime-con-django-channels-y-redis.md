# ADR-0001 — Adopcion de realtime con Django Channels y Redis

## Estado
Aceptada

## Contexto

El proyecto necesitaba que el dashboard reflejara cambios en usuarios y grupos sin requerir recarga manual.

Antes de esta decision:

- el stack estaba orientado a request/response tradicional con Django
- no habia canal de notificacion en vivo para pantallas abiertas
- el dashboard podia quedar desactualizado hasta que el usuario refrescara la pagina

El objetivo no era solo "mostrar algo en vivo", sino definir un patron reutilizable para futuras pantallas realtime del sistema sin introducir una complejidad desmedida en el cliente.

La solucion debia:

- integrarse bien con Django y el sistema de autenticacion existente
- funcionar dentro del stack ya basado en Docker Compose
- permitir notificaciones livianas y desacoplar el calculo de datos del socket
- mantener control fino sobre autorizacion (`is_staff`)

## Decision

Se adopta una arquitectura de realtime basada en:

- `Django Channels` para soporte ASGI y WebSockets
- `Daphne` como servidor ASGI
- `Redis` como channel layer

El patron aprobado para esta primera implementacion es:

```text
signal -> broadcast -> consumer -> refetch HTTP
```

Mas concretamente:

1. cambios en `User`, `Group` o `User.groups` disparan signals
2. los signals emiten un mensaje liviano al grupo `dashboard_updates`
3. `DashboardConsumer` entrega un evento JSON por WebSocket
4. el cliente no recibe datasets completos por socket; hace refetch a `/dashboard/live/summary/`

La autorizacion del canal realtime sigue el mismo criterio del dashboard:

- usuario autenticado
- `is_staff=True`

La infraestructura resultante queda compuesta por:

- `config/asgi.py` con `ProtocolTypeRouter`
- `config/routing.py` para centralizar rutas WS
- `apps/core/consumers.py` para el consumer del dashboard
- `apps/core/routing.py` para `websocket_urlpatterns`
- `apps/core/signals.py` para disparar broadcasts
- `docker-compose.yml` con servicio `redis`

## Consecuencias

### Positivas

- el dashboard se actualiza sin F5
- queda definido un patron claro para futuras pantallas realtime
- el mensaje WS se mantiene liviano, evitando empujar payloads grandes por socket
- la autorizacion del socket queda alineada con la autorizacion HTTP del panel
- Redis ya queda disponible para futuros usos controlados de cache o background work

### Costos y tradeoffs

- aumenta la complejidad operativa del stack local y de despliegue
- aparece una nueva dependencia estructural (`Redis`)
- el proyecto deja de ser solo WSGI y pasa a depender de ASGI como entrada real
- se suma una capa extra de debugging cuando haya problemas de conectividad o sincronizacion

### Restricciones derivadas

- no usar el WebSocket para enviar datasets completos salvo necesidad muy justificada
- no hacer queries pesadas en signals ni en handlers de consumer
- cualquier nueva pantalla realtime debe definir su grupo, su endpoint de refetch y su criterio de autorizacion
- si el patron cambia, debe registrarse una nueva ADR o actualizar esta decision

## Alternativas descartadas

### Polling HTTP

Se evaluo como opcion mas simple.

Motivos para no elegirlo como patron principal:

- genera requests periodicos aunque no haya cambios
- escala peor en pantallas abiertas por mucho tiempo
- deja el tiempo de actualizacion atado al intervalo de polling
- no establece una base realtime clara para futuras features del panel

### Server-Sent Events (SSE)

No se eligio porque el stack y la comunidad Django actual ofrecen una ruta mas natural y extensible con Channels cuando se necesita crecer hacia eventos bidireccionales o multiples canales.

### Enviar todo el summary por WebSocket

Se descarto para evitar:

- duplicar logica de serializacion entre HTTP y WS
- acoplar fuerte el consumer al shape completo del dashboard
- aumentar el costo de cada evento emitido

## Implementacion asociada

La decision ya esta materializada en el repo mediante cambios en:

- `requirements.txt`
- `config/asgi.py`
- `config/routing.py`
- `config/settings/base.py`
- `apps/core/consumers.py`
- `apps/core/routing.py`
- `apps/core/signals.py`
- `apps/core/views.py`
- `apps/core/urls.py`
- `templates/dashboard/home.html`
- `static/src/js/main.js`
- `docker-compose.yml`
- `.env.example`
- `README.md`

## Notas para el futuro

- si aparecen mas pantallas realtime, evitar meter todo en `dashboard_updates`
- si aumenta mucho el volumen de eventos, evaluar debounce en cliente o colapso de eventos en servidor
- si Redis empieza a usarse tambien como cache o cola, registrar esa ampliacion en una ADR nueva