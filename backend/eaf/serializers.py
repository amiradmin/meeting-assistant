# eaf/serializers.py
from rest_framework import serializers
from .models import EAFHeat, EAFElectricalProfile, EAFCharging, EAFEnergy, EAFDelay


class EAFHeatSerializer(serializers.ModelSerializer):
    """Base EAF Heat Serializer"""
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    phase_display = serializers.CharField(source='get_current_phase_display', read_only=True)
    progress_percentage = serializers.SerializerMethodField()
    steel_grade_code = serializers.CharField(source='steel_grade.code', read_only=True)
    steel_grade_name = serializers.CharField(source='steel_grade.name', read_only=True)
    bucket_number = serializers.CharField(source='bucket.bucket_number', read_only=True)
    order_number = serializers.CharField(source='bucket.order.order_number', read_only=True)

    class Meta:
        model = EAFHeat
        fields = [
            'id', 'heat_number', 'steel_grade', 'steel_grade_code', 'steel_grade_name',
            'furnace_id', 'bucket', 'bucket_number', 'order_number', 'heat_sequence',
            'scrap_weight', 'dri_weight', 'liquid_weight', 'target_weight',
            'temp_target', 'temp_min', 'temp_max',
            'electrical_profile', 'working_point', 'tap_position', 'power_consumption',
            'electrode_position', 'status', 'status_display', 'current_phase', 'phase_display',
            'start_time', 'end_time', 'phase_start_time', 'operator_name', 'shift_id',
            'notes', 'created_at', 'updated_at', 'progress_percentage'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

    def get_progress_percentage(self, obj):
        return obj.get_progress()


class EAFHeatCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating EAF Heat"""

    class Meta:
        model = EAFHeat
        fields = [
            'heat_number', 'steel_grade', 'furnace_id', 'bucket',
            'scrap_weight', 'dri_weight', 'target_weight',
            'temp_target', 'temp_min', 'temp_max',
            'electrical_profile', 'operator_name', 'shift_id', 'notes'
        ]


class EAFHeatUpdateSerializer(serializers.ModelSerializer):
    """Serializer for updating EAF Heat"""

    class Meta:
        model = EAFHeat
        fields = [
            'scrap_weight', 'dri_weight', 'liquid_weight',
            'temp_target', 'temp_min', 'temp_max',
            'electrical_profile', 'working_point', 'tap_position',
            'power_consumption', 'electrode_position', 'operator_name', 'notes'
        ]


class EAFElectricalProfileSerializer(serializers.ModelSerializer):
    """Serializer for Electrical Profile"""

    class Meta:
        model = EAFElectricalProfile
        fields = '__all__'


class EAFChargingSerializer(serializers.ModelSerializer):
    """Serializer for Charging"""
    class Meta:
        model = EAFCharging
        fields = ['id', 'heat', 'charging_type', 'material', 'weight', 'charging_time', 'operator_name']
        read_only_fields = ['id', 'charging_time']



class EAFEnergySerializer(serializers.ModelSerializer):
    """Serializer for Energy Data"""

    class Meta:
        model = EAFEnergy
        fields = ['id', 'heat', 'timestamp', 'power_active', 'power_reactive',
                  'energy_consumed', 'electrode_position', 'tap_position', 'working_point']
        read_only_fields = ['id', 'timestamp']


class EAFDelaySerializer(serializers.ModelSerializer):
    """Serializer for Delays"""

    class Meta:
        model = EAFDelay
        fields = ['id', 'heat', 'category', 'code', 'description', 'cause',
                  'start_time', 'end_time', 'duration', 'status']