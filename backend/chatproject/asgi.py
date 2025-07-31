"""
ASGI config for chatproject project.

It exposes the ASGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/4.2/howto/deployment/asgi/
"""

import os
import django
from django.core.asgi import get_asgi_application
from channels.auth import AuthMiddlewareStack
from channels.routing import ProtocolTypeRouter, URLRouter
from channels.security.websocket import AllowedHostsOriginValidator
from django.conf import settings

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'chatproject.settings')
django.setup()

# Initialize Django ASGI application early to ensure the AppRegistry
# is populated before importing code that may import ORM models.
django_asgi_app = get_asgi_application()

# Import routing after Django is set up
import chat.routing

# Custom origin validator for WebSocket connections
class CustomOriginValidator:
    def __init__(self, application):
        self.application = application

    async def __call__(self, scope, receive, send):
        if scope["type"] == "websocket":
            # Get the origin from headers
            headers = dict(scope.get("headers", []))
            origin = headers.get(b"origin", b"").decode("utf-8")
            
            # Allow connections from allowed origins or if no origin header
            allowed_origins = getattr(settings, 'ALLOWED_WEBSOCKET_ORIGINS', [])
            if not origin or origin in allowed_origins:
                return await self.application(scope, receive, send)
            else:
                # Reject the connection
                await send({"type": "websocket.close", "code": 4003})
                return
        
        return await self.application(scope, receive, send)

application = ProtocolTypeRouter({
    "http": django_asgi_app,
    "websocket": CustomOriginValidator(
        AuthMiddlewareStack(
            URLRouter(
                chat.routing.websocket_urlpatterns
            )
        )
    ),
})
