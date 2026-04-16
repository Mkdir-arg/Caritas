import logging

from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer
from django.contrib.auth import get_user_model
from django.contrib.auth.models import Group
from django.db.models.signals import m2m_changed, post_delete, post_save
from django.dispatch import receiver


logger = logging.getLogger(__name__)
User = get_user_model()


def broadcast_dashboard_refresh(reason="update"):
    channel_layer = get_channel_layer()

    if not channel_layer:
        return

    try:
        async_to_sync(channel_layer.group_send)(
            "dashboard_updates",
            {
                "type": "dashboard.refresh",
                "reason": reason,
            },
        )
    except Exception:
        logger.exception("No se pudo emitir la actualizacion realtime del dashboard.")


@receiver(post_save, sender=User)
def on_user_saved(sender, **kwargs):
    broadcast_dashboard_refresh("user_saved")


@receiver(post_delete, sender=User)
def on_user_deleted(sender, **kwargs):
    broadcast_dashboard_refresh("user_deleted")


@receiver(post_save, sender=Group)
def on_group_saved(sender, **kwargs):
    broadcast_dashboard_refresh("group_saved")


@receiver(post_delete, sender=Group)
def on_group_deleted(sender, **kwargs):
    broadcast_dashboard_refresh("group_deleted")


@receiver(m2m_changed, sender=User.groups.through)
def on_user_groups_changed(sender, action, **kwargs):
    if action in {"post_add", "post_remove", "post_clear"}:
        broadcast_dashboard_refresh("membership_changed")