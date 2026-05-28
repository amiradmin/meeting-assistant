# production/models.py
from django.db import models
from django.conf import settings
from django.utils import timezone
from lf.models import SteelGrade  # Remove LFHeat import - not needed directly


class OrderStatus(models.TextChoices):
    """Order status choices"""
    DRAFT = 'draft', 'Draft'
    CONFIRMED = 'confirmed', 'Confirmed'
    IN_PROGRESS = 'in_progress', 'In Progress'
    COMPLETED = 'completed', 'Completed'
    CANCELLED = 'cancelled', 'Cancelled'


class OrderPriority(models.TextChoices):
    """Order priority levels"""
    LOW = 'low', 'Low'
    NORMAL = 'normal', 'Normal'
    HIGH = 'high', 'High'
    URGENT = 'urgent', 'Urgent'


class BucketStatus(models.TextChoices):
    """Bucket status choices"""
    PLANNED = 'planned', 'Planned'
    IN_PROGRESS = 'in_progress', 'In Progress'
    COMPLETED = 'completed', 'Completed'
    CANCELLED = 'cancelled', 'Cancelled'


class ProductionOrder(models.Model):
    """
    Production Order - Customer request/contract that contains multiple buckets
    """
    order_number = models.CharField(max_length=50, unique=True, verbose_name="Order Number")
    customer_name = models.CharField(max_length=200, verbose_name="Customer Name")
    customer_po = models.CharField(max_length=100, blank=True, null=True, verbose_name="Customer PO Number")
    product_description = models.TextField(blank=True, verbose_name="Product Description")

    # Steel grade reference
    steel_grade = models.ForeignKey(
        SteelGrade,
        on_delete=models.PROTECT,
        related_name='production_orders',
        verbose_name="Steel Grade"
    )

    # Order quantities
    quantity_tons = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        verbose_name="Total Quantity (tons)"
    )
    quantity_heats = models.IntegerField(
        default=1,
        verbose_name="Number of Heats"
    )

    # Date requirements
    required_by_date = models.DateField(
        null=True,
        blank=True,
        verbose_name="Required By Date"
    )

    # Temperature specifications
    temp_target = models.IntegerField(
        default=1600,
        verbose_name="Target Temperature (°C)"
    )
    temp_min = models.IntegerField(
        default=1580,
        verbose_name="Minimum Temperature (°C)"
    )
    temp_max = models.IntegerField(
        default=1620,
        verbose_name="Maximum Temperature (°C)"
    )

    # Status and priority
    status = models.CharField(
        max_length=20,
        choices=OrderStatus.choices,
        default=OrderStatus.DRAFT,
        verbose_name="Order Status"
    )
    priority = models.CharField(
        max_length=10,
        choices=OrderPriority.choices,
        default=OrderPriority.NORMAL,
        verbose_name="Priority"
    )

    # Production timeline
    planned_start_date = models.DateTimeField(
        null=True,
        blank=True,
        verbose_name="Planned Start Date"
    )
    actual_start_date = models.DateTimeField(
        null=True,
        blank=True,
        verbose_name="Actual Start Date"
    )
    actual_end_date = models.DateTimeField(
        null=True,
        blank=True,
        verbose_name="Actual End Date"
    )

    # Additional information
    notes = models.TextField(blank=True, verbose_name="Notes")
    attachments = models.JSONField(
        default=list,
        blank=True,
        verbose_name="Attachments"
    )

    # Tracking
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name='created_orders',
        verbose_name="Created By"
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Production Order"
        verbose_name_plural = "Production Orders"
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['order_number']),
            models.Index(fields=['status']),
            models.Index(fields=['priority']),
            models.Index(fields=['required_by_date']),
        ]

    def __str__(self):
        return f"{self.order_number} - {self.customer_name} - {self.steel_grade.code}"

    def get_total_buckets(self):
        """Get total number of buckets in this order"""
        return self.buckets.count()

    def get_completed_buckets(self):
        """Get number of completed buckets"""
        return self.buckets.filter(status=BucketStatus.COMPLETED).count()

    def get_progress_percentage(self):
        """Calculate order progress based on completed buckets"""
        total_buckets = self.buckets.count()
        if total_buckets == 0:
            return 0
        completed_buckets = self.buckets.filter(status=BucketStatus.COMPLETED).count()
        return int((completed_buckets / total_buckets) * 100)

    def get_remaining_quantity(self):
        """Calculate remaining quantity to produce"""
        produced_quantity = 0
        for bucket in self.buckets.all():
            produced_quantity += bucket.get_actual_quantity()
        return float(self.quantity_tons) - produced_quantity

    def get_completed_quantity(self):
        """Calculate completed quantity"""
        produced_quantity = 0
        for bucket in self.buckets.all():
            produced_quantity += bucket.get_actual_quantity()
        return produced_quantity

    def can_start_production(self):
        """Check if order can start production"""
        return self.status == OrderStatus.CONFIRMED and self.buckets.exists()


class ProductionBucket(models.Model):
    """
    Production Bucket - Planning batch within an order
    Groups multiple heats together for production planning

    Relationship: One bucket has many heats (via LFHeat.bucket)
    """
    order = models.ForeignKey(
        ProductionOrder,
        on_delete=models.CASCADE,
        related_name='buckets',
        verbose_name="Production Order"
    )
    bucket_number = models.CharField(
        max_length=50,
        verbose_name="Bucket Number"
    )
    bucket_sequence = models.IntegerField(
        default=1,
        verbose_name="Bucket Sequence"
    )

    # Bucket quantities
    planned_quantity = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        verbose_name="Planned Quantity (tons)"
    )
    actual_quantity = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=0,
        verbose_name="Actual Quantity (tons)"
    )

    # Schedule
    planned_start_date = models.DateTimeField(
        null=True,
        blank=True,
        verbose_name="Planned Start Date"
    )
    planned_end_date = models.DateTimeField(
        null=True,
        blank=True,
        verbose_name="Planned End Date"
    )
    actual_start_date = models.DateTimeField(
        null=True,
        blank=True,
        verbose_name="Actual Start Date"
    )
    actual_end_date = models.DateTimeField(
        null=True,
        blank=True,
        verbose_name="Actual End Date"
    )

    # Status
    status = models.CharField(
        max_length=20,
        choices=BucketStatus.choices,
        default=BucketStatus.PLANNED,
        verbose_name="Bucket Status"
    )

    # Additional info
    notes = models.TextField(blank=True, verbose_name="Notes")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Production Bucket"
        verbose_name_plural = "Production Buckets"
        ordering = ['bucket_sequence']
        unique_together = [['order', 'bucket_number']]
        indexes = [
            models.Index(fields=['order', 'bucket_number']),
            models.Index(fields=['status']),
        ]

    def __str__(self):
        return f"{self.order.order_number} - Bucket {self.bucket_number}"

    def get_progress_percentage(self):
        """Calculate progress based on completed heats"""
        total_heats = self.heats.count()  # Direct access via related_name='heats'
        if total_heats == 0:
            return 0
        completed_heats = self.heats.filter(status='completed').count()
        return int((completed_heats / total_heats) * 100)

    def get_actual_quantity(self):
        """Calculate actual quantity from heats"""
        total = self.heats.aggregate(
            total=models.Sum('liquid_weight')
        )['total'] or 0
        return float(total)

    def get_remaining_quantity(self):
        """Calculate remaining quantity to produce"""
        return float(self.planned_quantity) - self.get_actual_quantity()

    def get_heats(self):
        """Get all heats in this bucket"""
        return self.heats.all().select_related('steel_grade')

    def can_start(self):
        """Check if bucket can start production"""
        return self.status == BucketStatus.PLANNED and self.heats.exists()

    def can_complete(self):
        """Check if bucket can be completed"""
        if self.status != BucketStatus.IN_PROGRESS:
            return False
        incomplete_heats = self.heats.exclude(status='completed').count()
        return incomplete_heats == 0

# REMOVED: OrderHeat model - No longer needed!
# The relationship is now directly: ProductionBucket -> LFHeat (via LFHeat.bucket)