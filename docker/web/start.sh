#!/bin/sh
set -eu

python - <<'PY'
import os
import socket
import time

host = os.environ.get("MYSQL_HOST", "db")
port = int(os.environ.get("MYSQL_PORT", "3306"))
deadline = time.time() + 90

print("Esperando MySQL...")

while True:
    try:
        with socket.create_connection((host, port), timeout=2):
            break
    except OSError:
        if time.time() > deadline:
            raise SystemExit("Timeout esperando MySQL")
        time.sleep(2)
PY

python manage.py migrate --noinput
python manage.py collectstatic --noinput
python manage.py runserver 0.0.0.0:8000
