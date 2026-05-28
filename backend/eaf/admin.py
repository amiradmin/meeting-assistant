# eaf/admin.py
from django.contrib import admin
from .models import EAFHeat, EAFElectricalProfile, EAFCharging, EAFEnergy, EAFDelay


@admin.register(EAFHeat)
class EAFHeatAdmin(admin.ModelAdmin):
    list_display = ['heat_number', 'steel_grade', 'status', 'current_phase', 'liquid_weight', 'start_time']
    search_fields = ['heat_number', 'operator_name', 'steel_grade__code']
    list_filter = ['status', 'current_phase', 'furnace_id']
    readonly_fields = ['created_at', 'updated_at']


@admin.register(EAFElectricalProfile)
class EAFElectricalProfileAdmin(admin.ModelAdmin):
    list_display = ['name', 'is_active']
    search_fields = ['name']
    list_filter = ['is_active']


@admin.register(EAFCharging)
class EAFChargingAdmin(admin.ModelAdmin):
    list_display = ['heat', 'charging_type', 'material', 'weight', 'charging_time']
    search_fields = ['heat__heat_number', 'material']
    list_filter = ['charging_type']
    readonly_fields = ['charging_time']


@admin.register(EAFEnergy)
class EAFEnergyAdmin(admin.ModelAdmin):
    list_display = ['heat', 'timestamp', 'power_active', 'energy_consumed', 'tap_position']
    search_fields = ['heat__heat_number']
    list_filter = ['working_point']
    readonly_fields = ['timestamp']


@admin.register(EAFDelay)
class EAFDelayAdmin(admin.ModelAdmin):
    list_display = ['heat', 'category', 'code', 'status', 'start_time', 'duration']
    search_fields = ['heat__heat_number', 'code', 'description']
    list_filter = ['category', 'status']