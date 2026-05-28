# lf/admin.py
from django.contrib import admin
from .models import SteelGrade, LFHeat, LFTemperature, LFAnalysis, LFAddition, LFDelay


@admin.register(SteelGrade)
class SteelGradeAdmin(admin.ModelAdmin):
    list_display = ['code', 'name', 'temp_target', 'is_active']
    search_fields = ['code', 'name']
    list_filter = ['is_active']


@admin.register(LFHeat)
class LFHeatAdmin(admin.ModelAdmin):
    list_display = ['heat_number', 'steel_grade', 'status', 'current_phase', 'start_time']
    search_fields = ['heat_number', 'operator_name']
    list_filter = ['status', 'current_phase', 'furnace_id']
    readonly_fields = ['created_at', 'updated_at']


@admin.register(LFTemperature)
class LFTemperatureAdmin(admin.ModelAdmin):
    list_display = ['heat', 'temperature', 'measured_at']
    list_filter = ['heat__steel_grade']


@admin.register(LFAnalysis)
class LFAnalysisAdmin(admin.ModelAdmin):
    list_display = ['heat', 'sample_id', 'analysis_time']
    list_filter = ['heat__steel_grade']


@admin.register(LFAddition)
class LFAdditionAdmin(admin.ModelAdmin):
    list_display = ['heat', 'material_name', 'confirmed_qty', 'status']
    list_filter = ['status', 'added_to']


@admin.register(LFDelay)
class LFDelayAdmin(admin.ModelAdmin):
    list_display = ['heat', 'category', 'code', 'status', 'start_time']
    list_filter = ['category', 'status']