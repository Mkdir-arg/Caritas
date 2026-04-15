from pathlib import Path

from django.conf import settings


def brand(_request):
    css_file = Path(settings.BASE_DIR) / "static" / "dist" / "css" / "app.css"

    return {
        "BRAND_NAME": "Caritas",
        "APP_CSS_VERSION": int(css_file.stat().st_mtime) if css_file.exists() else 1,
    }
