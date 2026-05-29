from rest_framework import serializers
from .models import Meeting


class MeetingSerializer(serializers.ModelSerializer):
    audio_url = serializers.SerializerMethodField()
    created_by_name = serializers.SerializerMethodField()

    class Meta:
        model = Meeting
        fields = [
            'id', 'title', 'description', 'audio_file', 'audio_url',
            'audio_duration', 'status', 'transcription', 'summary',
            'action_items', 'decisions', 'key_points', 'created_by',
            'created_by_name', 'created_at', 'updated_at'
        ]
        read_only_fields = [
            'id', 'status', 'transcription', 'summary', 'action_items',
            'decisions', 'key_points', 'created_by', 'created_at', 'updated_at'
        ]

    def get_audio_url(self, obj):
        return obj.get_audio_url

    def get_created_by_name(self, obj):
        if obj.created_by:
            return obj.created_by.username
        return None


class MeetingCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Meeting
        fields = ['id', 'title', 'description', 'audio_file']

    def create(self, validated_data):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            validated_data['created_by'] = request.user
        return super().create(validated_data)


class MeetingStatusSerializer(serializers.ModelSerializer):
    class Meta:
        model = Meeting
        fields = ['id', 'status', 'transcription', 'summary', 'action_items', 'decisions', 'key_points']