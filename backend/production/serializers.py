# production/serializers.py
from rest_framework import serializers
from .models import ProductionOrder, ProductionBucket  # Remove OrderHeat
from lf.models import LFHeat
from lf.serializers import LFHeatDetailSerializer


class ProductionOrderSerializer(serializers.ModelSerializer):
    """Serializer for Production Order"""
    progress_percentage = serializers.SerializerMethodField()
    remaining_quantity = serializers.SerializerMethodField()
    completed_quantity = serializers.SerializerMethodField()
    steel_grade_code = serializers.CharField(source='steel_grade.code', read_only=True)
    steel_grade_name = serializers.CharField(source='steel_grade.name', read_only=True)
    bucket_count = serializers.SerializerMethodField()
    completed_bucket_count = serializers.SerializerMethodField()
    total_heats = serializers.SerializerMethodField()
    completed_heats = serializers.SerializerMethodField()
    buckets = serializers.SerializerMethodField()

    class Meta:
        model = ProductionOrder
        fields = [
            'id', 'order_number', 'customer_name', 'customer_po', 'product_description',
            'steel_grade', 'steel_grade_code', 'steel_grade_name',
            'quantity_tons', 'quantity_heats', 'required_by_date',
            'temp_target', 'temp_min', 'temp_max',
            'status', 'priority', 'planned_start_date', 'actual_start_date', 'actual_end_date',
            'notes', 'created_by', 'created_at', 'updated_at',
            'progress_percentage', 'remaining_quantity', 'completed_quantity',
            'bucket_count', 'completed_bucket_count', 'total_heats', 'completed_heats',
            'buckets'
        ]
        read_only_fields = ['created_at', 'updated_at', 'created_by']

    def get_progress_percentage(self, obj):
        return obj.get_progress_percentage()

    def get_remaining_quantity(self, obj):
        return obj.get_remaining_quantity()

    def get_completed_quantity(self, obj):
        return obj.get_completed_quantity()

    def get_bucket_count(self, obj):
        return obj.buckets.count()

    def get_completed_bucket_count(self, obj):
        return obj.buckets.filter(status='completed').count()

    def get_total_heats(self, obj):
        total = 0
        for bucket in obj.buckets.all():
            total += bucket.heats.count()
        return total

    def get_completed_heats(self, obj):
        completed = 0
        for bucket in obj.buckets.all():
            completed += bucket.heats.filter(status='completed').count()
        return completed

    def get_buckets(self, obj):
        from .serializers import ProductionBucketSerializer
        return ProductionBucketSerializer(obj.buckets.all(), many=True).data


class ProductionBucketSerializer(serializers.ModelSerializer):
    """Serializer for Production Bucket"""
    progress_percentage = serializers.SerializerMethodField()
    actual_quantity = serializers.SerializerMethodField()
    remaining_quantity = serializers.SerializerMethodField()
    heat_count = serializers.SerializerMethodField()
    completed_heat_count = serializers.SerializerMethodField()
    order_number = serializers.CharField(source='order.order_number', read_only=True)
    customer_name = serializers.CharField(source='order.customer_name', read_only=True)
    heats = serializers.SerializerMethodField()

    class Meta:
        model = ProductionBucket
        fields = [
            'id', 'order', 'order_number', 'customer_name', 'bucket_number', 'bucket_sequence',
            'planned_quantity', 'actual_quantity', 'remaining_quantity',
            'planned_start_date', 'planned_end_date', 'actual_start_date', 'actual_end_date',
            'status', 'notes', 'created_at', 'updated_at',
            'progress_percentage', 'heat_count', 'completed_heat_count', 'heats'
        ]

    def get_progress_percentage(self, obj):
        return obj.get_progress_percentage()

    def get_actual_quantity(self, obj):
        return obj.get_actual_quantity()

    def get_remaining_quantity(self, obj):
        return obj.get_remaining_quantity()

    def get_heat_count(self, obj):
        return obj.heats.count()

    def get_completed_heat_count(self, obj):
        return obj.heats.filter(status='completed').count()

    def get_heats(self, obj):
        heats = obj.heats.all()
        return LFHeatDetailSerializer(heats, many=True).data


class ProductionOrderCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating Production Order"""

    class Meta:
        model = ProductionOrder
        fields = [
            'order_number', 'customer_name', 'customer_po', 'product_description',
            'steel_grade', 'quantity_tons', 'quantity_heats', 'required_by_date',
            'temp_target', 'temp_min', 'temp_max', 'priority', 'notes'
        ]

    def validate_order_number(self, value):
        if ProductionOrder.objects.filter(order_number=value).exists():
            raise serializers.ValidationError("Order number already exists")
        return value


class ProductionOrderUpdateSerializer(serializers.ModelSerializer):
    """Serializer for updating Production Order"""

    class Meta:
        model = ProductionOrder
        fields = [
            'customer_name', 'customer_po', 'product_description',
            'quantity_tons', 'quantity_heats', 'required_by_date',
            'temp_target', 'temp_min', 'temp_max', 'priority', 'notes', 'status'
        ]


class ProductionBucketCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating Production Bucket"""

    class Meta:
        model = ProductionBucket
        fields = [
            'bucket_number', 'planned_quantity',
            'planned_start_date', 'planned_end_date', 'notes'
        ]

    def validate_bucket_number(self, value):
        view = self.context.get('view')
        if view and hasattr(view, 'kwargs'):
            order_id = view.kwargs.get('pk')
            if order_id and ProductionBucket.objects.filter(order_id=order_id, bucket_number=value).exists():
                raise serializers.ValidationError("Bucket number already exists for this order")
        return value


class ProductionBucketUpdateSerializer(serializers.ModelSerializer):
    """Serializer for updating Production Bucket"""

    class Meta:
        model = ProductionBucket
        fields = [
            'planned_quantity', 'planned_start_date', 'planned_end_date', 'status', 'notes'
        ]


class AddHeatToBucketSerializer(serializers.Serializer):
    """Serializer for adding a heat to a bucket"""
    heat_number = serializers.IntegerField()
    furnace_id = serializers.IntegerField(default=1)
    liquid_weight = serializers.DecimalField(max_digits=10, decimal_places=2)
    operator_name = serializers.CharField(max_length=100, required=False, allow_blank=True)
    shift_id = serializers.CharField(max_length=10, default='A')

    def validate_heat_number(self, value):
        if LFHeat.objects.filter(heat_number=value).exists():
            raise serializers.ValidationError(f"Heat number {value} already exists")
        return value


class AddHeatToOrderSerializer(serializers.Serializer):
    """Serializer for adding a heat directly to an order (for backward compatibility)"""
    heat_number = serializers.IntegerField()
    furnace_id = serializers.IntegerField(default=1)
    liquid_weight = serializers.DecimalField(max_digits=10, decimal_places=2)
    operator_name = serializers.CharField(max_length=100, required=False, allow_blank=True)
    shift_id = serializers.CharField(max_length=10, default='A')

    def validate_heat_number(self, value):
        if LFHeat.objects.filter(heat_number=value).exists():
            raise serializers.ValidationError(f"Heat number {value} already exists")
        return value