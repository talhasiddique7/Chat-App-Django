import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from django.contrib.auth.models import User
from .models import Message
from .serializers import MessageSerializer

class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        try:
            self.room_name = self.scope['url_route']['kwargs']['room_name']
            self.room_group_name = f'chat_{self.room_name}'

            # Join room group
            await self.channel_layer.group_add(
                self.room_group_name,
                self.channel_name
            )

            await self.accept()
            print(f"WebSocket connected to room: {self.room_name}")
            
            # Send a welcome message
            await self.send(text_data=json.dumps({
                'type': 'connection_established',
                'message': f'Connected to room {self.room_name}'
            }))
        except Exception as e:
            print(f"Error in WebSocket connect: {e}")
            raise

    async def disconnect(self, close_code):
        try:
            # Leave room group
            await self.channel_layer.group_discard(
                self.room_group_name,
                self.channel_name
            )
            print(f"WebSocket disconnected from room: {self.room_name} with code: {close_code}")
        except Exception as e:
            print(f"Error in WebSocket disconnect: {e}")

    # Receive message from WebSocket
    async def receive(self, text_data):
        try:
            text_data_json = json.loads(text_data)
            message_content = text_data_json.get('message', '')
            username = text_data_json.get('username', 'Anonymous')

            if not message_content.strip():
                return

            message_obj = await self.save_message(username, self.room_name, message_content)
            serialized_message = await self.serialize_message(message_obj)

            # Send message to room group
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'chat_message',
                    'message': serialized_message
                }
            )
            print(f"Message sent to room {self.room_name}: {message_content[:50]}...")
        except json.JSONDecodeError:
            print("Invalid JSON received")
        except Exception as e:
            print(f"Error processing message: {e}")

    # Receive message from room group
    async def chat_message(self, event):
        message = event['message']

        # Send message to WebSocket
        await self.send(text_data=json.dumps(message))

    @database_sync_to_async
    def save_message(self, username, room, message):
        user, created = User.objects.get_or_create(username=username)
        return Message.objects.create(user=user, room=room, content=message)

    @database_sync_to_async
    def serialize_message(self, message):
        return MessageSerializer(message).data
