from django.db import models
from django.contrib.auth import get_user_model
from django.utils import timezone

User = get_user_model()

class Message(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    room = models.CharField(max_length=100)
    content = models.TextField()
    timestamp = models.DateTimeField(default=timezone.now)

    def __str__(self):
        return f"{self.user.username} in {self.room}: {self.content[:50]}"
