# lf/views.py
from rest_framework import viewsets, generics, status
from rest_framework.response import Response
from rest_framework.views import APIView
from django.shortcuts import get_object_or_404
from django.utils import timezone
from django.db import models
from .models import LFHeat, LFTemperature, LFAnalysis, LFAddition, SteelGrade, LFDelay
from .serializers import (
    LFHeatListSerializer, LFHeatDetailSerializer,
    LFHeatCreateSerializer, LFHeatUpdateSerializer,
    LFTemperatureSerializer, LFAnalysisSerializer,
    LFAdditionSerializer, LFDelaySerializer,
    SteelGradeSerializer, TemperatureRecordSerializer,
    ReadyToTapSerializer, AlloyCalculationSerializer
)
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.authentication import TokenAuthentication
from django_filters.rest_framework import DjangoFilterBackend  # Add this


class SteelGradeViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet برای مشاهده گریدهای فولاد"""
    queryset = SteelGrade.objects.filter(is_active=True)
    serializer_class = SteelGradeSerializer


class LFHeatViewSet(viewsets.ModelViewSet):
    """ViewSet برای مدیریت ذوب‌های LF"""
    queryset = LFHeat.objects.all()
    filter_backends = [DjangoFilterBackend]  # Add filter backend
    filterset_fields = ['bucket', 'status', 'steel_grade', 'current_phase']  # Add filter fields

    def get_serializer_class(self):
        if self.action == 'list':
            return LFHeatListSerializer
        elif self.action == 'retrieve':
            return LFHeatDetailSerializer
        elif self.action == 'create':
            return LFHeatCreateSerializer
        elif self.action in ['update', 'partial_update']:
            return LFHeatUpdateSerializer
        return LFHeatDetailSerializer

    def get_queryset(self):
        queryset = super().get_queryset()

        # Filter by furnace_id
        furnace_id = self.request.query_params.get('furnace_id')
        if furnace_id:
            queryset = queryset.filter(furnace_id=furnace_id)

        # Filter by bucket (important for your RecentOrders component)
        bucket_id = self.request.query_params.get('bucket')
        if bucket_id:
            queryset = queryset.filter(bucket_id=bucket_id)

        # Filter by status
        status = self.request.query_params.get('status')
        if status:
            queryset = queryset.filter(status=status)

        return queryset

    @action(detail=True, methods=['post'])
    def change_phase(self, request, pk=None):
        heat = self.get_object()
        new_phase = request.data.get('phase')

        if not new_phase:
            return Response(
                {'error': 'Phase is required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        valid_transitions = {
            'preparation': ['ladle_arrival'],
            'ladle_arrival': ['heating'],
            'heating': ['alloying'],
            'alloying': ['trimming'],
            'trimming': ['holding'],
            'holding': ['tapping'],
            'tapping': ['completed'],
        }

        current = heat.current_phase
        if new_phase not in valid_transitions.get(current, []):
            return Response(
                {'error': f'Cannot change phase from {current} to {new_phase}'},
                status=status.HTTP_400_BAD_REQUEST
            )

        heat.current_phase = new_phase
        heat.phase_start_time = timezone.now()

        if new_phase == 'tapping':
            heat.status = 'ready_to_tap'
        elif new_phase == 'completed':
            heat.status = 'completed'
            heat.end_time = timezone.now()

        heat.save()
        serializer = self.get_serializer(heat)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def record_temperature(self, request, pk=None):
        heat = self.get_object()
        serializer = TemperatureRecordSerializer(data=request.data)

        if serializer.is_valid():
            temperature = LFTemperature.objects.create(
                heat=heat,
                temperature=serializer.validated_data['temperature'],
                oxygen_activity=serializer.validated_data.get('oxygen_activity'),
                energy_supplied=heat.heating_power * 0.25,
                phase=heat.current_phase
            )
            return Response(
                LFTemperatureSerializer(temperature).data,
                status=status.HTTP_201_CREATED
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['post'])
    def record_analysis(self, request, pk=None):
        heat = self.get_object()
        elements = request.data.get('elements', {})

        analysis = LFAnalysis.objects.create(
            heat=heat,
            sample_id=f"S{heat.analyses.count() + 1}",
            c=elements.get('C', 0),
            mn=elements.get('Mn', 0),
            si=elements.get('Si', 0),
            p=elements.get('P', 0),
            s=elements.get('S', 0),
            cr=elements.get('Cr', 0),
            ni=elements.get('Ni', 0),
            mo=elements.get('Mo', 0),
            al=elements.get('Al', 0),
            sample_time=timezone.now()
        )
        return Response(
            LFAnalysisSerializer(analysis).data,
            status=status.HTTP_201_CREATED
        )

    @action(detail=True, methods=['post'])
    def calculate_alloys(self, request, pk=None):
        heat = self.get_object()
        current_analysis = request.data.get('current_analysis', {})

        if not current_analysis:
            last_analysis = heat.analyses.first()
            if last_analysis:
                current_analysis = last_analysis.to_dict()

        from .services import AlloyCalculationService
        result = AlloyCalculationService.calculate(
            liquid_weight=heat.liquid_weight,
            current_analysis=current_analysis,
            target_steel_grade=heat.steel_grade.code
        )
        return Response(result)

    @action(detail=True, methods=['post'])
    def ready_to_tap(self, request, pk=None):
        heat = self.get_object()
        serializer = ReadyToTapSerializer(data=request.data)

        if serializer.is_valid():
            heat.status = 'ready_to_tap'
            heat.current_phase = 'tapping'
            heat.save()
            return Response({
                'message': 'Heat marked as ready to tap',
                'heat': self.get_serializer(heat).data
            })
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class CurrentHeatView(APIView):
    """دریافت ذوب جاری برای یک کوره مشخص"""

    def get(self, request, furnace_id):
        # اولویت: running اول، سپس ready_to_tap، سپس pending
        heat = LFHeat.objects.filter(
            furnace_id=furnace_id,
            status='running'
        ).first()

        if not heat:
            heat = LFHeat.objects.filter(
                furnace_id=furnace_id,
                status='ready_to_tap'
            ).first()

        if not heat:
            heat = LFHeat.objects.filter(
                furnace_id=furnace_id,
                status='pending'
            ).first()

        if heat:
            serializer = LFHeatDetailSerializer(heat)
            return Response(serializer.data)

        return Response(
            {'detail': 'No active heat found', 'has_active': False},
            status=status.HTTP_200_OK
        )


class TemperatureHistoryView(generics.ListAPIView):
    """دریافت تاریخچه دما"""
    serializer_class = LFTemperatureSerializer

    def get_queryset(self):
        heat_id = self.kwargs['heat_id']
        limit = self.request.query_params.get('limit', 50)
        return LFTemperature.objects.filter(heat_id=heat_id)[:int(limit)]


class TemperatureDetailView(APIView):
    """حذف و ویرایش رکوردهای دما"""

    def delete(self, request, pk):
        """حذف یک رکورد دما با شناسه مشخص"""
        try:
            temperature = get_object_or_404(LFTemperature, id=pk)
            temperature.delete()
            return Response(
                {'message': 'Temperature record deleted successfully'},
                status=status.HTTP_204_NO_CONTENT
            )
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )

    def get(self, request, pk):
        """دریافت یک رکورد دما (اختیاری)"""
        try:
            temperature = get_object_or_404(LFTemperature, id=pk)
            serializer = LFTemperatureSerializer(temperature)
            return Response(serializer.data)
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_404_NOT_FOUND
            )

    def put(self, request, pk):
        """ویرایش یک رکورد دما (اختیاری)"""
        try:
            temperature = get_object_or_404(LFTemperature, id=pk)
            serializer = TemperatureRecordSerializer(data=request.data)

            if serializer.is_valid():
                temperature.temperature = serializer.validated_data.get('temperature', temperature.temperature)
                temperature.oxygen_activity = serializer.validated_data.get('oxygen_activity',
                                                                            temperature.oxygen_activity)
                temperature.save()

                return Response(
                    LFTemperatureSerializer(temperature).data,
                    status=status.HTTP_200_OK
                )
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )


class AnalysisHistoryView(generics.ListAPIView):
    """دریافت تاریخچه آنالیزها"""
    serializer_class = LFAnalysisSerializer

    def get_queryset(self):
        heat_id = self.kwargs['heat_id']
        return LFAnalysis.objects.filter(heat_id=heat_id)


class AdditionsView(generics.ListCreateAPIView):
    """دریافت و ایجاد افزودنی‌ها"""
    serializer_class = LFAdditionSerializer

    def get_queryset(self):
        heat_id = self.kwargs['heat_id']
        return LFAddition.objects.filter(heat_id=heat_id)

    def perform_create(self, serializer):
        heat_id = self.kwargs['heat_id']
        heat = get_object_or_404(LFHeat, id=heat_id)
        serializer.save(heat=heat)


class DelaysView(generics.ListCreateAPIView):
    """دریافت و ایجاد تأخیرها"""
    serializer_class = LFDelaySerializer

    def get_queryset(self):
        heat_id = self.kwargs['heat_id']
        return LFDelay.objects.filter(heat_id=heat_id)

    def perform_create(self, serializer):
        heat_id = self.kwargs['heat_id']
        heat = get_object_or_404(LFHeat, id=heat_id)
        serializer.save(heat=heat)


class ActiveDelayView(APIView):
    """دریافت تأخیر فعال و پایان آن"""

    def get(self, request, heat_id):
        delay = LFDelay.objects.filter(
            heat_id=heat_id,
            status='active'
        ).first()

        if delay:
            serializer = LFDelaySerializer(delay)
            return Response(serializer.data)

        return Response({'has_active': False}, status=status.HTTP_200_OK)

    def post(self, request, heat_id):
        delay = LFDelay.objects.filter(
            heat_id=heat_id,
            status='active'
        ).first()

        if not delay:
            return Response(
                {'error': 'No active delay found'},
                status=status.HTTP_404_NOT_FOUND
            )

        delay.end_time = timezone.now()
        delay.status = 'completed'
        delay.save()

        return Response(LFDelaySerializer(delay).data)


class ProcessPhasesView(APIView):
    """دریافت لیست فازهای فرآیند"""

    def get(self, request):
        phases = [
            {'id': 'preparation', 'name': 'Preparation (Ladle Preheating)', 'order': 1, 'icon': 'fa-fire',
             'color': '#ff6b35'},
            {'id': 'ladle_arrival', 'name': 'Ladle Arrival & Sampling', 'order': 2, 'icon': 'fa-truck',
             'color': '#4299e1'},
            {'id': 'heating', 'name': 'Arc Heating', 'order': 3, 'icon': 'fa-bolt', 'color': '#ecc94b'},
            {'id': 'alloying', 'name': 'Alloying & Deslagging', 'order': 4, 'icon': 'fa-cubes', 'color': '#48bb78'},
            {'id': 'trimming', 'name': 'Fine Trimming', 'order': 5, 'icon': 'fa-sliders-h', 'color': '#9f7aea'},
            {'id': 'holding', 'name': 'Holding & Homogenization', 'order': 6, 'icon': 'fa-spinner', 'color': '#ed8936'},
            {'id': 'tapping', 'name': 'Ready to Tap', 'order': 7, 'icon': 'fa-check-circle', 'color': '#38a169'},
        ]
        return Response(phases)


class AdditionDetailView(APIView):
    """View for single addition operations (update, delete)"""

    def get(self, request, pk):
        """Get a single addition record"""
        try:
            addition = get_object_or_404(LFAddition, id=pk)
            serializer = LFAdditionSerializer(addition)
            return Response(serializer.data)
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_404_NOT_FOUND
            )

    def patch(self, request, pk):
        """Update an addition record"""
        try:
            addition = get_object_or_404(LFAddition, id=pk)
            serializer = LFAdditionSerializer(addition, data=request.data, partial=True)

            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )

    def delete(self, request, pk):
        """Delete an addition record"""
        try:
            addition = get_object_or_404(LFAddition, id=pk)
            addition.delete()
            return Response(
                {'message': 'Addition deleted successfully'},
                status=status.HTTP_204_NO_CONTENT
            )
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )