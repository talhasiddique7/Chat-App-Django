from django.urls import path
from . import api

urlpatterns = [
    # Chat API endpoints
    path('rooms/<str:room_name>/messages/', api.MessageList.as_view(), name='room-messages'),
    path('users/', api.UserList.as_view(), name='user-list'),
]
