from django.contrib import admin
from .models import Message

@admin.register(Message)
class MessageAdmin(admin.ModelAdmin):
    list_display = ('user', 'room', 'timestamp', 'content_preview')
    list_filter = ('room', 'timestamp')
    search_fields = ('user__username', 'content')
    
    def content_preview(self, obj):
        return f"{obj.content[:50]}..." if len(obj.content) > 50 else obj.content
    content_preview.short_description = 'Content Preview'
