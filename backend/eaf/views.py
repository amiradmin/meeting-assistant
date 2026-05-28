# eaf/views.py
from rest_framework import viewsets, status, generics
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from django.utils import timezone
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter
from .models import EAFHeat, EAFElectricalProfile, EAFCharging, EAFEnergy, EAFDelay
from .serializers import (
    EAFHeatSerializer, EAFHeatCreateSerializer, EAFHeatUpdateSerializer,
    EAFElectricalProfileSerializer, EAFChargingSerializer,
    EAFEnergySerializer, EAFDelaySerializer
)


class EAFHeatViewSet(viewsets.ModelViewSet):
    """ViewSet for EAF Heats"""
    queryset = EAFHeat.objects.all()
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['status', 'current_phase', 'furnace_id', 'bucket']
    search_fields = ['heat_number', 'operator_name', 'steel_grade__code']
    ordering_fields = ['heat_number', 'start_time', 'created_at']
    ordering = ['-heat_number']

    def get_serializer_class(self):
        if self.action == 'create':
            return EAFHeatCreateSerializer
        elif self.action in ['update', 'partial_update']:
            return EAFHeatUpdateSerializer
        return EAFHeatSerializer

    @action(detail=True, methods=['post'])
    def start_melting(self, request, pk=None):
        """Start melting process"""
        heat = self.get_object()

        if heat.status != 'planned':
            return Response(
                {'error': f'Cannot start melting. Current status: {heat.status}'},
                status=status.HTTP_400_BAD_REQUEST
            )

        heat.status = 'melting'
        heat.current_phase = 'melting'
        heat.start_time = timezone.now()
        heat.phase_start_time = timezone.now()
        heat.save()

        return Response({'message': 'Melting started', 'status': heat.status})

    @action(detail=True, methods=['post'])
    def change_phase(self, request, pk=None):
        """Change current phase"""
        heat = self.get_object()
        new_phase = request.data.get('phase')

        if not new_phase:
            return Response({'error': 'Phase is required'}, status=status.HTTP_400_BAD_REQUEST)

        valid_phases = ['preparation', 'charging', 'melting', 'foaming_slag', 'refining', 'tapping']

        if new_phase not in valid_phases:
            return Response({'error': 'Invalid phase'}, status=status.HTTP_400_BAD_REQUEST)

        heat.current_phase = new_phase
        heat.phase_start_time = timezone.now()

        if new_phase == 'tapping':
            heat.status = 'tapping'
        elif new_phase == 'refining':
            heat.status = 'refining'

        heat.save()

        return Response({'message': f'Phase changed to {new_phase}', 'phase': new_phase})

    @action(detail=True, methods=['post'])
    def complete(self, request, pk=None):
        """Complete the heat"""
        heat = self.get_object()

        if heat.status not in ['tapping', 'refining']:
            return Response(
                {'error': f'Cannot complete. Current status: {heat.status}'},
                status=status.HTTP_400_BAD_REQUEST
            )

        heat.status = 'completed'
        heat.current_phase = 'completed'
        heat.end_time = timezone.now()
        heat.save()

        return Response({'message': 'Heat completed', 'status': heat.status})

    @action(detail=True, methods=['post'])
    def record_charging(self, request, pk=None):
        """Record scrap/DRI charging"""
        heat = self.get_object()

        # Create a mutable copy of request data
        data = request.data.copy()

        # Remove heat if present (it will be set automatically)
        if 'heat' in data:
            del data['heat']

        serializer = EAFChargingSerializer(data=data)

        if serializer.is_valid():
            serializer.save(heat=heat)
            return Response(serializer.data, status=status.HTTP_201_CREATED)

        # Log the errors for debugging
        print("Serializer errors:", serializer.errors)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['post'])
    def record_energy(self, request, pk=None):
        """Record energy consumption"""
        heat = self.get_object()
        serializer = EAFEnergySerializer(data=request.data)

        if serializer.is_valid():
            serializer.save(heat=heat)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['get'])
    def energy_data(self, request, pk=None):
        """Get all energy data for this heat"""
        heat = self.get_object()
        energy_data = heat.energy_data.all()
        serializer = EAFEnergySerializer(energy_data, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['get'])
    def chargings(self, request, pk=None):
        """Get all charging records for this heat"""
        heat = self.get_object()
        chargings = heat.chargings.all()
        serializer = EAFChargingSerializer(chargings, many=True)
        return Response(serializer.data)


class EAFElectricalProfileViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet for Electrical Profiles"""
    queryset = EAFElectricalProfile.objects.filter(is_active=True)
    serializer_class = EAFElectricalProfileSerializer
    permission_classes = [IsAuthenticated]


class EAFDelayViewSet(viewsets.ModelViewSet):
    """ViewSet for EAF Delays"""
    queryset = EAFDelay.objects.all()
    serializer_class = EAFDelaySerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['heat', 'category', 'status']

    @action(detail=True, methods=['post'])
    def end_delay(self, request, pk=None):
        """End an active delay"""
        delay = self.get_object()

        if delay.status != 'active':
            return Response({'error': 'Delay is not active'}, status=status.HTTP_400_BAD_REQUEST)

        delay.end_time = timezone.now()
        delay.status = 'completed'
        delay.save()

        return Response({'message': 'Delay ended', 'duration': delay.duration})



    #test