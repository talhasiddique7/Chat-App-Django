from rest_framework import serializers
from django.contrib.auth.models import User

from .models import Message

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username']

    def create(self, validated_data):
        user, created = User.objects.get_or_create(**validated_data)
        return user

class MessageSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)

    class Meta:
        model = Message
        fields = ['id', 'user', 'room', 'content', 'timestamp']
