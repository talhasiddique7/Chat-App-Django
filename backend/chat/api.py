from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.views import APIView

from django.contrib.auth.models import User
from .models import Message
from .serializers import MessageSerializer, UserSerializer

class MessageList(generics.ListCreateAPIView):
    serializer_class = MessageSerializer

    def get_queryset(self):
        room = self.kwargs['room_name']
        return Message.objects.filter(room=room).order_by('timestamp')

    def perform_create(self, serializer):
        room = self.kwargs['room_name']
        username = self.request.data.get('username', 'Anonymous')
        user, created = User.objects.get_or_create(username=username)
        serializer.save(room=room, user=user)

class UserList(generics.ListCreateAPIView):
    serializer_class = UserSerializer

    def get_queryset(self):
        return User.objects.all()

    def create(self, request, *args, **kwargs):
        username = request.data.get('username')
        if not username:
            return Response(
                {'error': 'Username is required'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        user, created = User.objects.get_or_create(username=username)
        serializer = self.get_serializer(user)
        return Response(serializer.data, status=status.HTTP_201_CREATED if created else status.HTTP_200_OK)


