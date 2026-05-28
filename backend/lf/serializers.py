# lf/serializers.py
from rest_framework import serializers
from .models import (
    SteelGrade, LFHeat, LFTemperature,
    LFAnalysis, LFAddition, LFDelay
)
# ایمپورت مورد نیاز برای timezone
from django.utils import timezone
from django.db import models

class SteelGradeSerializer(serializers.ModelSerializer):
    """سریالایزر برای مدل SteelGrade"""

    class Meta:
        model = SteelGrade
        fields = [
            'id', 'code', 'name', 'description',
            'temp_min', 'temp_target', 'temp_max',
            'analysis_limits', 'is_active'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class LFTemperatureSerializer(serializers.ModelSerializer):
    """سریالایزر برای مدل LFTemperature"""
    time = serializers.SerializerMethodField()
    heat_number = serializers.IntegerField(source='heat.heat_number', read_only=True)

    class Meta:
        model = LFTemperature
        fields = [
            'id', 'heat', 'heat_number', 'temperature',
            'oxygen_activity', 'energy_supplied', 'phase',
            'measured_at', 'time'
        ]
        read_only_fields = ['id', 'measured_at']

    def get_time(self, obj):
        """بازگرداندن زمان به فرمت HH:MM:SS"""
        return obj.measured_at.strftime('%H:%M:%S')


class LFAnalysisSerializer(serializers.ModelSerializer):
    """سریالایزر برای مدل LFAnalysis"""
    time = serializers.SerializerMethodField()
    heat_number = serializers.IntegerField(source='heat.heat_number', read_only=True)
    elements = serializers.SerializerMethodField()

    class Meta:
        model = LFAnalysis
        fields = [
            'id', 'heat', 'heat_number', 'sample_id',
            'c', 'mn', 'si', 'p', 's', 'cr', 'ni', 'mo', 'al',
            'sample_time', 'analysis_time', 'time', 'elements'
        ]
        read_only_fields = ['id', 'analysis_time']

    def get_time(self, obj):
        """بازگرداندن زمان آنالیز به فرمت HH:MM:SS"""
        return obj.analysis_time.strftime('%H:%M:%S')

    def get_elements(self, obj):
        """بازگرداندن تمام عناصر به صورت دیکشنری"""
        return {
            'C': obj.c,
            'Mn': obj.mn,
            'Si': obj.si,
            'P': obj.p,
            'S': obj.s,
            'Cr': obj.cr,
            'Ni': obj.ni,
            'Mo': obj.mo,
            'Al': obj.al,
        }

    def create(self, validated_data):
        """ایجاد آنالیز جدید با استفاده از دیتای elements"""
        # اگر elements در داده ورودی وجود داشت، استخراج کن
        elements = self.context.get('request').data.get('elements', {})
        if elements:
            validated_data['c'] = elements.get('C', 0)
            validated_data['mn'] = elements.get('Mn', 0)
            validated_data['si'] = elements.get('Si', 0)
            validated_data['p'] = elements.get('P', 0)
            validated_data['s'] = elements.get('S', 0)
            validated_data['cr'] = elements.get('Cr', 0)
            validated_data['ni'] = elements.get('Ni', 0)
            validated_data['mo'] = elements.get('Mo', 0)
            validated_data['al'] = elements.get('Al', 0)
        return super().create(validated_data)


class LFAdditionSerializer(serializers.ModelSerializer):
    """سریالایزر برای مدل LFAddition"""
    material_display = serializers.CharField(source='get_material_name', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    added_to_display = serializers.CharField(source='get_added_to_display', read_only=True)

    class Meta:
        model = LFAddition
        fields = [
            'id', 'heat', 'material_code', 'material_name', 'material_display',
            'standard_qty', 'calculated_qty', 'confirmed_qty', 'actual_qty',
            'unit', 'added_to', 'added_to_display', 'status', 'status_display',
            'timestamp', 'confirmed_at', 'notes'
        ]
        read_only_fields = ['id', 'timestamp', 'confirmed_at']

    def update(self, instance, validated_data):
        """به‌روزرسانی افزودنی و تنظیم زمان تایید"""
        if 'confirmed_qty' in validated_data and validated_data['confirmed_qty'] > 0:
            validated_data['status'] = 'confirmed'
            validated_data['confirmed_at'] = timezone.now()
        return super().update(instance, validated_data)


class LFDelaySerializer(serializers.ModelSerializer):
    """سریالایزر برای مدل LFDelay"""
    category_display = serializers.CharField(source='get_category_display', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    duration_formatted = serializers.SerializerMethodField()

    class Meta:
        model = LFDelay
        fields = [
            'id', 'heat', 'category', 'category_display', 'code',
            'description', 'cause', 'start_time', 'end_time',
            'duration', 'duration_formatted', 'status', 'status_display',
            'created_at'
        ]
        read_only_fields = ['id', 'duration', 'created_at']

    def get_duration_formatted(self, obj):
        """بازگرداندن مدت زمان به فرمت MM:SS"""
        minutes = obj.duration // 60
        seconds = obj.duration % 60
        return f"{minutes}m {seconds}s"

    def create(self, validated_data):
        """ایجاد تأخیر جدید با زمان شروع خودکار"""
        if 'start_time' not in validated_data:
            validated_data['start_time'] = timezone.now()
        validated_data['status'] = 'active'
        return super().create(validated_data)


class LFHeatListSerializer(serializers.ModelSerializer):
    """سریالایزر ساده برای لیست ذوب‌ها"""
    steel_grade_code = serializers.CharField(source='steel_grade.code', read_only=True)
    steel_grade_name = serializers.CharField(source='steel_grade.name', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    current_phase_display = serializers.CharField(source='get_current_phase_display', read_only=True)

    class Meta:
        model = LFHeat
        fields = [
            'id', 'heat_number', 'steel_grade', 'steel_grade_code', 'steel_grade_name',
            'furnace_id', 'liquid_weight', 'target_liquid_weight',
            'status', 'status_display', 'current_phase', 'current_phase_display',
            'start_time', 'end_time'
        ]


class LFHeatDetailSerializer(serializers.ModelSerializer):
    """سریالایزر کامل برای جزئیات ذوب"""
    steel_grade_detail = SteelGradeSerializer(source='steel_grade', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    current_phase_display = serializers.CharField(source='get_current_phase_display', read_only=True)
    temperatures = LFTemperatureSerializer(many=True, read_only=True)
    analyses = LFAnalysisSerializer(many=True, read_only=True)
    additions = LFAdditionSerializer(many=True, read_only=True)
    delays = LFDelaySerializer(many=True, read_only=True)

    # آمار محاسباتی
    total_downtime = serializers.SerializerMethodField()
    avg_temperature = serializers.SerializerMethodField()
    last_temperature = serializers.SerializerMethodField()
    last_analysis = serializers.SerializerMethodField()

    class Meta:
        model = LFHeat
        fields = [
            'id', 'heat_number', 'steel_grade', 'steel_grade_detail',
            'furnace_id', 'liquid_weight', 'target_liquid_weight',
            'status', 'status_display', 'current_phase', 'current_phase_display',
            'start_time', 'end_time', 'phase_start_time',
            'heating_power', 'argon_flow', 'electrode_position',
            'production_standard', 'operator_name', 'shift_id', 'notes',
            'temperatures', 'analyses', 'additions', 'delays',
            'total_downtime', 'avg_temperature', 'last_temperature', 'last_analysis',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

    def get_total_downtime(self, obj):
        """محاسبه مجموع زمان توقف‌ها"""
        total = obj.delays.filter(status='completed').aggregate(
            total=models.Sum('duration')
        )['total'] or 0
        return total

    def get_avg_temperature(self, obj):
        """محاسبه میانگین دمای اندازه‌گیری شده"""
        avg = obj.temperatures.aggregate(
            avg=models.Avg('temperature')
        )['avg']
        return round(avg, 1) if avg else None

    def get_last_temperature(self, obj):
        """دریافت آخرین دمای اندازه‌گیری شده"""
        last = obj.temperatures.first()
        if last:
            return LFTemperatureSerializer(last).data
        return None

    def get_last_analysis(self, obj):
        """دریافت آخرین آنالیز انجام شده"""
        last = obj.analyses.first()
        if last:
            return LFAnalysisSerializer(last).data
        return None


class LFHeatCreateSerializer(serializers.ModelSerializer):
    """سریالایزر برای ایجاد ذوب جدید"""

    class Meta:
        model = LFHeat
        fields = [
            'heat_number', 'steel_grade', 'furnace_id',
            'liquid_weight', 'target_liquid_weight',
            'production_standard', 'operator_name', 'shift_id', 'notes'
        ]

    def validate_heat_number(self, value):
        """بررسی یکتایی شماره ذوب"""
        if LFHeat.objects.filter(heat_number=value).exists():
            raise serializers.ValidationError(f"Heat number {value} already exists")
        return value

    def create(self, validated_data):
        """ایجاد ذوب جدید با وضعیت pending"""
        validated_data['status'] = 'pending'
        validated_data['current_phase'] = 'preparation'
        return super().create(validated_data)


class LFHeatUpdateSerializer(serializers.ModelSerializer):
    """سریالایزر برای به‌روزرسانی ذوب"""

    class Meta:
        model = LFHeat
        fields = [
            'status', 'current_phase', 'heating_power',
            'argon_flow', 'electrode_position', 'notes', 'operator_name'
        ]

    def update(self, instance, validated_data):
        """به‌روزرسانی با مدیریت زمان فازها"""
        old_phase = instance.current_phase
        new_phase = validated_data.get('current_phase', old_phase)

        # اگر فاز تغییر کرده، زمان شروع فاز جدید را ثبت کن
        if new_phase != old_phase:
            validated_data['phase_start_time'] = timezone.now()

        # اگر وضعیت به running تغییر کرد، زمان شروع را ثبت کن
        if validated_data.get('status') == 'running' and not instance.start_time:
            validated_data['start_time'] = timezone.now()

        # اگر وضعیت به completed یا cancelled تغییر کرد، زمان پایان را ثبت کن
        if validated_data.get('status') in ['completed', 'cancelled']:
            validated_data['end_time'] = timezone.now()

        return super().update(instance, validated_data)


class LFHeatPhaseChangeSerializer(serializers.Serializer):
    """سریالایزر برای تغییر فاز ذوب"""
    phase = serializers.ChoiceField(choices=LFHeat.PHASE_CHOICES)

    def validate_phase(self, value):
        """اعتبارسنجی تغییر فاز"""
        instance = self.context.get('instance')
        if not instance:
            raise serializers.ValidationError("Heat instance not found")

        # لیست فازهای مجاز برای تغییر
        valid_transitions = {
            'preparation': ['ladle_arrival'],
            'ladle_arrival': ['heating'],
            'heating': ['alloying'],
            'alloying': ['trimming'],
            'trimming': ['holding'],
            'holding': ['tapping'],
            'tapping': ['completed'],
        }

        current = instance.current_phase
        if value not in valid_transitions.get(current, []):
            raise serializers.ValidationError(
                f"Cannot change phase from {current} to {value}"
            )

        return value


class AlloyCalculationSerializer(serializers.Serializer):
    """سریالایزر برای محاسبه فروآلیاژها"""
    liquid_weight = serializers.FloatField(min_value=0, help_text="وزن مذاب (تن)")
    current_analysis = serializers.DictField(help_text="آنالیز فعلی مذاب")
    target_steel_grade = serializers.CharField(help_text="کد گرید فولاد هدف")

    def validate_current_analysis(self, value):
        """اعتبارسنجی آنالیز ورودی"""
        required_elements = ['C', 'Mn', 'Si', 'P', 'S']
        for element in required_elements:
            if element not in value:
                value[element] = 0
        return value


class TemperatureRecordSerializer(serializers.Serializer):
    """سریالایزر برای ثبت دمای جدید"""
    temperature = serializers.FloatField(min_value=1400, max_value=1800, help_text="دما (°C)")
    oxygen_activity = serializers.FloatField(min_value=0, max_value=2000, required=False, allow_null=True,
                                             help_text="اکسیژن فعال (ppm)")


class ReadyToTapSerializer(serializers.Serializer):
    """سریالایزر برای تایید آمادگی تخلیه"""
    final_temperature = serializers.FloatField(min_value=1400, max_value=1800)
    final_analysis = serializers.DictField()
    notes = serializers.CharField(required=False, allow_blank=True)


