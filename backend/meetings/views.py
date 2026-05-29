from rest_framework import viewsets, status, generics
from rest_framework.decorators import action, api_view
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticatedOrReadOnly, AllowAny, IsAuthenticated
from django.shortcuts import get_object_or_404
from django.core.files.storage import default_storage
from django.core.files.base import ContentFile
from django.db.models import Q
from rest_framework.views import APIView
import os
import uuid
import logging

from .models import Meeting
from .serializers import MeetingSerializer, MeetingCreateSerializer, MeetingStatusSerializer
from .tasks import process_meeting_audio

logger = logging.getLogger(__name__)

class MeetingViewSet(viewsets.ModelViewSet):
    queryset = Meeting.objects.all()
    permission_classes = [AllowAny]  # برای تست، بعداً به IsAuthenticated تغییر بده

    def get_serializer_class(self):
        if self.action == 'create':
            return MeetingCreateSerializer
        elif self.action == 'status':
            return MeetingStatusSerializer
        return MeetingSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        # ذخیره فایل صوتی
        audio_file = request.FILES.get('audio_file')
        if audio_file:
            # ایجاد نام یکتا برای فایل
            file_extension = os.path.splitext(audio_file.name)[1]
            new_filename = f"{uuid.uuid4().hex}{file_extension}"
            file_path = default_storage.save(f'audio/{new_filename}', ContentFile(audio_file.read()))
            serializer.validated_data['audio_file'] = file_path

        meeting = serializer.save()

        # اجرای تسک پس‌زمینه برای پردازش با error handling
        try:
            process_meeting_audio.delay(meeting.id)
            logger.info(f"Task started for meeting {meeting.id}")
        except Exception as e:
            logger.error(f"Failed to start task for meeting {meeting.id}: {str(e)}")
            # اگر celery در دسترس نبود، meeting را با status pending نگه دار
            meeting.status = 'pending'
            meeting.save()

        return Response(
            MeetingSerializer(meeting).data,
            status=status.HTTP_201_CREATED
        )

    @action(detail=True, methods=['get'])
    def status(self, request, pk=None):
        meeting = self.get_object()
        serializer = MeetingStatusSerializer(meeting)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def retry(self, request, pk=None):
        meeting = self.get_object()
        if meeting.status in ['failed', 'pending']:
            meeting.status = 'pending'
            meeting.save()
            try:
                process_meeting_audio.delay(meeting.id)
            except Exception as e:
                logger.error(f"Failed to retry task: {str(e)}")
                return Response({'error': 'خطا در شروع پردازش مجدد'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            return Response({'message': 'پردازش مجدد شروع شد'}, status=status.HTTP_200_OK)
        return Response(
            {'error': 'فقط جلسات خطا خورده یا در انتظار را می‌توان مجدداً پردازش کرد'},
            status=status.HTTP_400_BAD_REQUEST
        )

    @action(detail=False, methods=['get'])
    def my_meetings(self, request):
        if request.user.is_authenticated:
            meetings = self.queryset.filter(created_by=request.user)
        else:
            meetings = self.queryset
        serializer = self.get_serializer(meetings, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def stats(self, request):
        total = self.queryset.count()
        completed = self.queryset.filter(status='completed').count()
        processing = self.queryset.filter(status__in=['processing', 'transcribing', 'summarizing']).count()
        failed = self.queryset.filter(status='failed').count()

        return Response({
            'total': total,
            'completed': completed,
            'processing': processing,
            'failed': failed
        })


@api_view(['GET'])
def health_check(request):
    return Response({
        'status': 'ok',
        'service': 'backend',
        'version': '1.0.0'
    })


class UserInfoView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        return Response({
            'id': user.id,
            'username': user.username,
            'email': user.email,
            'first_name': user.first_name,
            'last_name': user.last_name,
        })