from channels.generic.websocket import AsyncJsonWebsocketConsumer


class DashboardConsumer(AsyncJsonWebsocketConsumer):
    group_name = "dashboard_updates"

    async def connect(self):
        user = self.scope.get("user")

        if not user or not user.is_authenticated or not user.is_staff:
            await self.close(code=4403)
            return

        await self.channel_layer.group_add(self.group_name, self.channel_name)
        await self.accept()
        await self.send_json({"type": "dashboard.connected"})

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(self.group_name, self.channel_name)

    async def dashboard_refresh(self, event):
        await self.send_json({"type": "dashboard.refresh", "reason": event.get("reason", "update")})