# lf/models.py
from django.db import models
from django.utils import timezone


class SteelGrade(models.Model):
    """Steel grade model"""
    code = models.CharField(max_length=20, unique=True, verbose_name="Steel Code")
    name = models.CharField(max_length=100, verbose_name="Steel Name")
    description = models.TextField(blank=True, null=True, verbose_name="Description")

    # Temperature range
    temp_min = models.FloatField(default=1570, verbose_name="Minimum Temperature (°C)")
    temp_target = models.FloatField(default=1600, verbose_name="Target Temperature (°C)")
    temp_max = models.FloatField(default=1620, verbose_name="Maximum Temperature (°C)")

    # Chemical analysis limits
    analysis_limits = models.JSONField(default=dict, verbose_name="Analysis Limits")

    is_active = models.BooleanField(default=True, verbose_name="Active")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Steel Grade"
        verbose_name_plural = "Steel Grades"
        ordering = ['code']

    def __str__(self):
        return f"{self.code} - {self.name}"


class LFHeat(models.Model):
    """Heat model for Ladle Furnace"""

    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('running', 'Running'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
        ('ready_to_tap', 'Ready to Tap'),
    ]

    PHASE_CHOICES = [
        ('preparation', 'Preparation'),
        ('ladle_arrival', 'Ladle Arrival'),
        ('heating', 'Heating'),
        ('alloying', 'Alloying'),
        ('trimming', 'Trimming'),
        ('holding', 'Holding'),
        ('tapping', 'Tapping'),
    ]

    heat_number = models.IntegerField(unique=True, verbose_name="Heat Number")
    steel_grade = models.ForeignKey(SteelGrade, on_delete=models.PROTECT, verbose_name="Steel Grade")
    furnace_id = models.IntegerField(default=1, verbose_name="Furnace ID")

    # Production Bucket relationship (One-to-Many: one bucket has many heats)
    bucket = models.ForeignKey(
        'production.ProductionBucket',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='heats',
        verbose_name="Production Bucket"
    )
    heat_sequence = models.IntegerField(
        default=1,
        verbose_name="Heat Sequence in Bucket"
    )

    # Temperature specifications (can be inherited from order/bucket)
    temp_target = models.FloatField(default=1600, verbose_name="Target Temperature (°C)")
    temp_min = models.FloatField(default=1580, verbose_name="Minimum Temperature (°C)")
    temp_max = models.FloatField(default=1620, verbose_name="Maximum Temperature (°C)")

    # Weights
    liquid_weight = models.FloatField(default=0, verbose_name="Liquid Weight (tons)")
    target_liquid_weight = models.FloatField(default=120, verbose_name="Target Weight (tons)")

    # Status
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending', verbose_name="Status")
    current_phase = models.CharField(max_length=20, choices=PHASE_CHOICES, default='preparation', verbose_name="Current Phase")

    # Times
    start_time = models.DateTimeField(null=True, blank=True, verbose_name="Start Time")
    end_time = models.DateTimeField(null=True, blank=True, verbose_name="End Time")
    phase_start_time = models.DateTimeField(null=True, blank=True, verbose_name="Current Phase Start Time")

    # Operational parameters
    heating_power = models.FloatField(default=15, verbose_name="Heating Power (MW)")
    argon_flow = models.FloatField(default=150, verbose_name="Argon Flow (L/min)")
    electrode_position = models.FloatField(default=450, verbose_name="Electrode Position (mm)")

    # Operator information
    production_standard = models.CharField(max_length=50, default='LF_STD_FAST', verbose_name="Production Standard")
    operator_name = models.CharField(max_length=100, blank=True, null=True, verbose_name="Operator Name")
    shift_id = models.CharField(max_length=20, blank=True, null=True, verbose_name="Shift ID")
    notes = models.TextField(blank=True, null=True, verbose_name="Notes")

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "LF Heat"
        verbose_name_plural = "LF Heats"
        ordering = ['-heat_number']
        indexes = [
            models.Index(fields=['bucket', 'heat_sequence']),
            models.Index(fields=['status']),
            models.Index(fields=['current_phase']),
        ]

    def __str__(self):
        bucket_info = f" (Bucket: {self.bucket.bucket_number})" if self.bucket else ""
        return f"Heat #{self.heat_number} - {self.steel_grade.code}{bucket_info}"

    def save(self, *args, **kwargs):
        if not self.start_time and self.status == 'running':
            self.start_time = timezone.now()
        if not self.end_time and self.status == 'completed':
            self.end_time = timezone.now()
        super().save(*args, **kwargs)

    def get_bucket_info(self):
        """Get bucket information for this heat"""
        if self.bucket:
            return {
                'bucket_number': self.bucket.bucket_number,
                'bucket_sequence': self.bucket.bucket_sequence,
                'order_number': self.bucket.order.order_number,
                'customer_name': self.bucket.order.customer_name,
            }
        return None

    def get_progress(self):
        """Get heat progress based on current phase"""
        phase_progress = {
            'preparation': 0,
            'ladle_arrival': 10,
            'heating': 45,
            'alloying': 65,
            'trimming': 80,
            'holding': 90,
            'tapping': 95,
            'completed': 100,
        }
        return phase_progress.get(self.current_phase, 0)

    def can_start(self):
        """Check if heat can be started"""
        return self.status == 'pending'

    def can_complete(self):
        """Check if heat can be completed"""
        return self.status in ['running', 'ready_to_tap']


class LFTemperature(models.Model):
    """Temperature measurement model"""
    heat = models.ForeignKey(LFHeat, on_delete=models.CASCADE, related_name='temperatures', verbose_name="Heat")
    temperature = models.FloatField(verbose_name="Temperature (°C)")
    oxygen_activity = models.FloatField(null=True, blank=True, verbose_name="Oxygen Activity (ppm)")
    energy_supplied = models.FloatField(default=0, verbose_name="Energy Supplied (kWh/t)")
    phase = models.CharField(max_length=50, blank=True, null=True, verbose_name="Phase")
    measured_at = models.DateTimeField(auto_now_add=True, verbose_name="Measurement Time")

    class Meta:
        verbose_name = "LF Temperature"
        verbose_name_plural = "LF Temperatures"
        ordering = ['-measured_at']

    def __str__(self):
        return f"Heat {self.heat.heat_number}: {self.temperature}°C"


class LFAnalysis(models.Model):
    """Chemical analysis model"""
    heat = models.ForeignKey(LFHeat, on_delete=models.CASCADE, related_name='analyses', verbose_name="Heat")
    sample_id = models.CharField(max_length=20, verbose_name="Sample ID")

    # Chemical elements
    c = models.FloatField(default=0, verbose_name="Carbon (C%)")
    mn = models.FloatField(default=0, verbose_name="Manganese (Mn%)")
    si = models.FloatField(default=0, verbose_name="Silicon (Si%)")
    p = models.FloatField(default=0, verbose_name="Phosphorus (P%)")
    s = models.FloatField(default=0, verbose_name="Sulfur (S%)")
    cr = models.FloatField(default=0, verbose_name="Chromium (Cr%)")
    ni = models.FloatField(default=0, verbose_name="Nickel (Ni%)")
    mo = models.FloatField(default=0, verbose_name="Molybdenum (Mo%)")
    al = models.FloatField(default=0, verbose_name="Aluminum (Al%)")

    sample_time = models.DateTimeField(verbose_name="Sample Time")
    analysis_time = models.DateTimeField(auto_now_add=True, verbose_name="Analysis Time")

    class Meta:
        verbose_name = "LF Analysis"
        verbose_name_plural = "LF Analyses"
        ordering = ['-analysis_time']

    def __str__(self):
        return f"Heat {self.heat.heat_number} - Sample {self.sample_id}"

    def to_dict(self):
        """Convert to dictionary"""
        return {
            'C': self.c,
            'Mn': self.mn,
            'Si': self.si,
            'P': self.p,
            'S': self.s,
            'Cr': self.cr,
            'Ni': self.ni,
            'Mo': self.mo,
            'Al': self.al,
        }


class LFAddition(models.Model):
    """Additives model (ferroalloys)"""

    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('confirmed', 'Confirmed'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
    ]

    ADDED_TO_CHOICES = [
        ('furnace', 'Furnace'),
        ('ladle', 'Ladle'),
    ]

    heat = models.ForeignKey(LFHeat, on_delete=models.CASCADE, related_name='additions', verbose_name="Heat")
    material_code = models.CharField(max_length=50, verbose_name="Material Code")
    material_name = models.CharField(max_length=200, verbose_name="Material Name")

    standard_qty = models.FloatField(default=0, verbose_name="Standard Quantity (kg)")
    calculated_qty = models.FloatField(default=0, verbose_name="Calculated Quantity (kg)")
    confirmed_qty = models.FloatField(default=0, verbose_name="Confirmed Quantity (kg)")
    actual_qty = models.FloatField(default=0, verbose_name="Actual Quantity (kg)")

    unit = models.CharField(max_length=10, default='kg', verbose_name="Unit")
    added_to = models.CharField(max_length=20, choices=ADDED_TO_CHOICES, default='ladle', verbose_name="Added To")
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending', verbose_name="Status")

    timestamp = models.DateTimeField(null=True, blank=True, verbose_name="Addition Time")
    confirmed_at = models.DateTimeField(null=True, blank=True, verbose_name="Confirmation Time")
    notes = models.TextField(blank=True, null=True, verbose_name="Notes")

    class Meta:
        verbose_name = "LF Addition"
        verbose_name_plural = "LF Additions"

    def __str__(self):
        return f"{self.material_name}: {self.confirmed_qty} kg"


class LFDelay(models.Model):
    """Stoppages and delays model"""

    STATUS_CHOICES = [
        ('active', 'Active'),
        ('completed', 'Completed'),
    ]

    CATEGORY_CHOICES = [
        ('electrical', 'Electrical'),
        ('mechanical', 'Mechanical'),
        ('process', 'Process'),
        ('material', 'Material'),
        ('maintenance', 'Maintenance'),
    ]

    heat = models.ForeignKey(LFHeat, on_delete=models.CASCADE, related_name='delays', verbose_name="Heat")
    category = models.CharField(max_length=20, choices=CATEGORY_CHOICES, verbose_name="Category")
    code = models.CharField(max_length=20, verbose_name="Stop Code")
    description = models.CharField(max_length=500, verbose_name="Description")
    cause = models.TextField(blank=True, null=True, verbose_name="Cause")

    start_time = models.DateTimeField(verbose_name="Start Time")
    end_time = models.DateTimeField(null=True, blank=True, verbose_name="End Time")
    duration = models.IntegerField(default=0, verbose_name="Duration (seconds)")
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='active', verbose_name="Status")

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "LF Delay"
        verbose_name_plural = "LF Delays"
        ordering = ['-start_time']

    def __str__(self):
        return f"{self.get_category_display()}: {self.code}"

    def save(self, *args, **kwargs):
        if self.end_time and self.start_time:
            delta = self.end_time - self.start_time
            self.duration = int(delta.total_seconds())
        super().save(*args, **kwargs)