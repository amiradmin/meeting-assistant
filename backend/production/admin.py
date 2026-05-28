# production/admin.py
from django.contrib import admin
from .models import ProductionOrder, ProductionBucket
# Remove LFHeat import - it's in lf.models, not production.models


@admin.register(ProductionOrder)
class ProductionOrderAdmin(admin.ModelAdmin):
    list_display = [
        'order_number', 'customer_name', 'steel_grade', 'quantity_tons',
        'status', 'priority', 'required_by_date'
    ]
    search_fields = ['order_number', 'customer_name', 'customer_po']
    list_filter = ['status', 'priority', 'steel_grade']
    readonly_fields = ['created_at', 'updated_at']


@admin.register(ProductionBucket)
class ProductionBucketAdmin(admin.ModelAdmin):
    list_display = [
        'order', 'bucket_number', 'planned_quantity', 'actual_quantity',
        'status', 'planned_start_date'
    ]
    search_fields = ['bucket_number', 'order__order_number']
    list_filter = ['status', 'order__status']
    readonly_fields = ['created_at', 'updated_at']