# eaf/models.py
from django.db import models
from django.utils import timezone
from lf.models import SteelGrade


class EAFHeat(models.Model):
    """EAF Heat model for melting process"""

    STATUS_CHOICES = [
        ('planned', 'Planned'),
        ('charging', 'Charging'),
        ('melting', 'Melting'),
        ('refining', 'Refining'),
        ('tapping', 'Tapping'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
    ]

    PHASE_CHOICES = [
        ('preparation', 'Preparation'),
        ('charging', 'Charging'),
        ('melting', 'Melting'),
        ('foaming_slag', 'Foaming Slag'),
        ('refining', 'Refining'),
        ('tapping', 'Tapping'),
    ]

    # Basic Information
    heat_number = models.IntegerField(unique=True, verbose_name="Heat Number")
    steel_grade = models.ForeignKey(SteelGrade, on_delete=models.PROTECT, verbose_name="Steel Grade")
    furnace_id = models.IntegerField(default=1, verbose_name="Furnace ID")

    # Production Bucket relationship
    bucket = models.ForeignKey(
        'production.ProductionBucket',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='eaf_heats',
        verbose_name="Production Bucket"
    )
    heat_sequence = models.IntegerField(default=1, verbose_name="Heat Sequence in Bucket")

    # Weights
    scrap_weight = models.FloatField(default=0, verbose_name="Scrap Weight (tons)")
    dri_weight = models.FloatField(default=0, verbose_name="DRI Weight (tons)")
    liquid_weight = models.FloatField(default=0, verbose_name="Liquid Steel Weight (tons)")
    target_weight = models.FloatField(default=120, verbose_name="Target Weight (tons)")

    # Temperature specifications
    temp_target = models.FloatField(default=1620, verbose_name="Target Temperature (°C)")
    temp_min = models.FloatField(default=1600, verbose_name="Minimum Temperature (°C)")
    temp_max = models.FloatField(default=1640, verbose_name="Maximum Temperature (°C)")

    # Electrical parameters
    electrical_profile = models.CharField(max_length=50, default='STANDARD', verbose_name="Electrical Profile")
    working_point = models.IntegerField(default=1, verbose_name="Working Point")
    tap_position = models.IntegerField(default=1, verbose_name="Tap Position")
    power_consumption = models.FloatField(default=0, verbose_name="Power Consumption (kWh/ton)")
    electrode_position = models.FloatField(default=450, verbose_name="Electrode Position (mm)")

    # Status
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='planned', verbose_name="Status")
    current_phase = models.CharField(max_length=20, choices=PHASE_CHOICES, default='preparation',
                                     verbose_name="Current Phase")

    # Times
    start_time = models.DateTimeField(null=True, blank=True, verbose_name="Start Time")
    end_time = models.DateTimeField(null=True, blank=True, verbose_name="End Time")
    phase_start_time = models.DateTimeField(null=True, blank=True, verbose_name="Current Phase Start Time")

    # Operator information
    operator_name = models.CharField(max_length=100, blank=True, null=True, verbose_name="Operator Name")
    shift_id = models.CharField(max_length=20, blank=True, null=True, verbose_name="Shift ID")
    notes = models.TextField(blank=True, null=True, verbose_name="Notes")

    # Tracking
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "EAF Heat"
        verbose_name_plural = "EAF Heats"
        ordering = ['-heat_number']
        indexes = [
            models.Index(fields=['bucket', 'heat_sequence']),
            models.Index(fields=['status']),
        ]

    def __str__(self):
        bucket_info = f" (Bucket: {self.bucket.bucket_number})" if self.bucket else ""
        return f"EAF Heat #{self.heat_number} - {self.steel_grade.code}{bucket_info}"

    def save(self, *args, **kwargs):
        if not self.start_time and self.status == 'melting':
            self.start_time = timezone.now()
        if not self.end_time and self.status == 'completed':
            self.end_time = timezone.now()
        super().save(*args, **kwargs)

    def get_progress(self):
        """Get progress percentage based on current phase"""
        phase_progress = {
            'preparation': 0,
            'charging': 20,
            'melting': 50,
            'foaming_slag': 65,
            'refining': 80,
            'tapping': 95,
            'completed': 100,
        }
        return phase_progress.get(self.current_phase, 0)


class EAFElectricalProfile(models.Model):
    """Electrical profile for EAF melting"""

    PROFILE_CHOICES = [
        ('STANDARD', 'Standard Profile'),
        ('FAST', 'Fast Melting'),
        ('ECONOMY', 'Economy Mode'),
        ('PRECISE', 'Precise Control'),
    ]

    name = models.CharField(max_length=50, choices=PROFILE_CHOICES, unique=True)
    description = models.TextField(blank=True)

    # Working points (step 1-10)
    working_point_1 = models.JSONField(default=dict, help_text="Voltage, Current, Tap Position")
    working_point_2 = models.JSONField(default=dict)
    working_point_3 = models.JSONField(default=dict)
    working_point_4 = models.JSONField(default=dict)
    working_point_5 = models.JSONField(default=dict)
    working_point_6 = models.JSONField(default=dict)
    working_point_7 = models.JSONField(default=dict)
    working_point_8 = models.JSONField(default=dict)
    working_point_9 = models.JSONField(default=dict)
    working_point_10 = models.JSONField(default=dict)

    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.get_name_display()


class EAFCharging(models.Model):
    """Scrap and DRI charging information"""

    CHARGING_TYPE = [
        ('bucket', 'Bucket Charging'),
        ('continuous', 'Continuous Charging (DRI)'),
    ]

    heat = models.ForeignKey(EAFHeat, on_delete=models.CASCADE, related_name='chargings')
    charging_type = models.CharField(max_length=20, choices=CHARGING_TYPE)
    material = models.CharField(max_length=100)
    weight = models.FloatField()
    charging_time = models.DateTimeField(auto_now_add=True)
    operator_name = models.CharField(max_length=100, blank=True)

    def __str__(self):
        return f"Heat {self.heat.heat_number} - {self.material}: {self.weight} tons"


class EAFEnergy(models.Model):
    """Energy consumption tracking"""

    heat = models.ForeignKey(EAFHeat, on_delete=models.CASCADE, related_name='energy_data')
    timestamp = models.DateTimeField(auto_now_add=True)
    power_active = models.FloatField(default=0, verbose_name="Active Power (MW)")
    power_reactive = models.FloatField(default=0, verbose_name="Reactive Power (MVAR)")
    energy_consumed = models.FloatField(default=0, verbose_name="Energy Consumed (MWh)")
    electrode_position = models.FloatField(default=0, verbose_name="Electrode Position (mm)")
    tap_position = models.IntegerField(default=1, verbose_name="Tap Position")
    working_point = models.IntegerField(default=1, verbose_name="Working Point")

    class Meta:
        ordering = ['-timestamp']

    def __str__(self):
        return f"Heat {self.heat.heat_number} - {self.timestamp}"


class EAFDelay(models.Model):
    """Delays and stoppages for EAF"""

    CATEGORY_CHOICES = [
        ('electrical', 'Electrical'),
        ('mechanical', 'Mechanical'),
        ('material', 'Material'),
        ('process', 'Process'),
        ('maintenance', 'Maintenance'),
    ]

    heat = models.ForeignKey(EAFHeat, on_delete=models.CASCADE, related_name='delays')
    category = models.CharField(max_length=20, choices=CATEGORY_CHOICES)
    code = models.CharField(max_length=20)
    description = models.CharField(max_length=500)
    cause = models.TextField(blank=True, null=True)

    start_time = models.DateTimeField()
    end_time = models.DateTimeField(null=True, blank=True)
    duration = models.IntegerField(default=0, verbose_name="Duration (seconds)")
    status = models.CharField(max_length=20, default='active')

    def save(self, *args, **kwargs):
        if self.end_time and self.start_time:
            delta = self.end_time - self.start_time
            self.duration = int(delta.total_seconds())
        super().save(*args, **kwargs)