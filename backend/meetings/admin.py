from django.contrib import admin
from .models import Meeting

@admin.register(Meeting)
class MeetingAdmin(admin.ModelAdmin):
    list_display = ('title', 'status', 'created_at')
    list_filter = ('status', 'created_at')
    search_fields = ('title', 'transcription')
    readonly_fields = ('created_at', 'updated_at')