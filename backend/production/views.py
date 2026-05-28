# production/views.py
from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.decorators import action
from django.utils import timezone
from .models import ProductionOrder, ProductionBucket, OrderStatus, BucketStatus  # Remove OrderHeat
from .serializers import (
    ProductionOrderSerializer, ProductionOrderCreateSerializer,
    ProductionOrderUpdateSerializer, AddHeatToOrderSerializer,
    ProductionBucketSerializer, ProductionBucketCreateSerializer,
    ProductionBucketUpdateSerializer, AddHeatToBucketSerializer
)
from lf.models import LFHeat
from lf.serializers import LFHeatDetailSerializer


class ProductionOrderViewSet(viewsets.ModelViewSet):
    """ViewSet for Production Orders"""
    queryset = ProductionOrder.objects.all()

    def get_serializer_class(self):
        if self.action == 'create':
            return ProductionOrderCreateSerializer
        elif self.action in ['update', 'partial_update']:
            return ProductionOrderUpdateSerializer
        return ProductionOrderSerializer

    def get_queryset(self):
        queryset = super().get_queryset()

        # Filter by status
        status = self.request.query_params.get('status')
        if status:
            queryset = queryset.filter(status=status)

        # Filter by priority
        priority = self.request.query_params.get('priority')
        if priority:
            queryset = queryset.filter(priority=priority)

        # Filter by customer
        customer = self.request.query_params.get('customer')
        if customer:
            queryset = queryset.filter(customer_name__icontains=customer)

        return queryset

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)

    @action(detail=True, methods=['post'])
    def confirm(self, request, pk=None):
        """Confirm the order"""
        order = self.get_object()

        if order.status != OrderStatus.DRAFT:
            return Response(
                {'error': f'Order status is {order.status}, cannot confirm'},
                status=status.HTTP_400_BAD_REQUEST
            )

        order.status = OrderStatus.CONFIRMED
        order.save()

        return Response({'message': 'Order confirmed', 'status': order.status})

    @action(detail=True, methods=['post'])
    def start_production(self, request, pk=None):
        """Start production for an order"""
        order = self.get_object()

        if order.status != OrderStatus.CONFIRMED:
            return Response(
                {'error': 'Order must be confirmed before starting production'},
                status=status.HTTP_400_BAD_REQUEST
            )

        if not order.buckets.exists():
            return Response(
                {'error': 'Cannot start production. No buckets added to order'},
                status=status.HTTP_400_BAD_REQUEST
            )

        order.status = OrderStatus.IN_PROGRESS
        order.actual_start_date = timezone.now()
        order.save()

        return Response({'message': 'Production started', 'status': order.status})

    @action(detail=True, methods=['post'])
    def complete(self, request, pk=None):
        """Mark order as completed"""
        order = self.get_object()

        if order.status != OrderStatus.IN_PROGRESS:
            return Response(
                {'error': 'Order must be in progress to complete'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Check if all buckets are completed
        incomplete_buckets = order.buckets.exclude(status=BucketStatus.COMPLETED).count()
        if incomplete_buckets > 0:
            return Response(
                {'error': f'Cannot complete order. {incomplete_buckets} bucket(s) are not completed'},
                status=status.HTTP_400_BAD_REQUEST
            )

        order.status = OrderStatus.COMPLETED
        order.actual_end_date = timezone.now()
        order.save()

        return Response({'message': 'Order completed', 'status': order.status})

    @action(detail=True, methods=['post'])
    def cancel(self, request, pk=None):
        """Cancel the order"""
        order = self.get_object()

        if order.status in [OrderStatus.COMPLETED, OrderStatus.CANCELLED]:
            return Response(
                {'error': f'Order already {order.status}'},
                status=status.HTTP_400_BAD_REQUEST
            )

        order.status = OrderStatus.CANCELLED
        order.save()

        return Response({'message': 'Order cancelled', 'status': order.status})

    @action(detail=True, methods=['post'])
    def add_bucket(self, request, pk=None):
        """Add a new bucket to the order"""
        order = self.get_object()
        serializer = ProductionBucketCreateSerializer(data=request.data, context={'view': self})

        if serializer.is_valid():
            if order.status not in [OrderStatus.DRAFT, OrderStatus.CONFIRMED]:
                return Response(
                    {'error': f'Cannot add bucket to order with status: {order.status}'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            next_sequence = order.buckets.count() + 1

            bucket = ProductionBucket.objects.create(
                order=order,
                bucket_number=serializer.validated_data['bucket_number'],
                bucket_sequence=next_sequence,
                planned_quantity=serializer.validated_data['planned_quantity'],
                planned_start_date=serializer.validated_data.get('planned_start_date'),
                planned_end_date=serializer.validated_data.get('planned_end_date'),
                notes=serializer.validated_data.get('notes', '')
            )

            return Response(
                ProductionBucketSerializer(bucket).data,
                status=status.HTTP_201_CREATED
            )

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['get'])
    def buckets(self, request, pk=None):
        """Get all buckets for this order"""
        order = self.get_object()
        buckets = order.buckets.all()
        serializer = ProductionBucketSerializer(buckets, many=True)
        return Response(serializer.data)


class ProductionBucketViewSet(viewsets.ModelViewSet):
    """ViewSet for Production Buckets"""
    queryset = ProductionBucket.objects.all()

    def get_serializer_class(self):
        if self.action == 'create':
            return ProductionBucketCreateSerializer
        elif self.action in ['update', 'partial_update']:
            return ProductionBucketUpdateSerializer
        return ProductionBucketSerializer

    def get_queryset(self):
        queryset = super().get_queryset()

        order_id = self.request.query_params.get('order_id')
        if order_id:
            queryset = queryset.filter(order_id=order_id)

        status = self.request.query_params.get('status')
        if status:
            queryset = queryset.filter(status=status)

        return queryset.select_related('order')

    @action(detail=True, methods=['post'])
    def start(self, request, pk=None):
        """Start production for a bucket"""
        bucket = self.get_object()

        if bucket.status != BucketStatus.PLANNED:
            return Response(
                {'error': f'Bucket status is {bucket.status}, cannot start'},
                status=status.HTTP_400_BAD_REQUEST
            )

        bucket.status = BucketStatus.IN_PROGRESS
        bucket.actual_start_date = timezone.now()
        bucket.save()

        return Response({'message': 'Bucket production started', 'status': bucket.status})

    @action(detail=True, methods=['post'])
    def complete(self, request, pk=None):
        """Complete a bucket"""
        bucket = self.get_object()

        if bucket.status != BucketStatus.IN_PROGRESS:
            return Response(
                {'error': f'Bucket status is {bucket.status}, cannot complete'},
                status=status.HTTP_400_BAD_REQUEST
            )

        bucket.status = BucketStatus.COMPLETED
        bucket.actual_end_date = timezone.now()
        bucket.save()

        return Response({'message': 'Bucket completed', 'status': bucket.status})

    @action(detail=True, methods=['post'])
    def add_heat(self, request, pk=None):
        """Add a heat to the bucket"""
        bucket = self.get_object()
        serializer = AddHeatToBucketSerializer(data=request.data)

        if serializer.is_valid():
            next_sequence = bucket.heats.count() + 1

            heat = LFHeat.objects.create(
                heat_number=serializer.validated_data['heat_number'],
                steel_grade=bucket.order.steel_grade,
                furnace_id=serializer.validated_data['furnace_id'],
                liquid_weight=serializer.validated_data['liquid_weight'],
                target_liquid_weight=float(bucket.planned_quantity) / (next_sequence) if next_sequence > 0 else bucket.planned_quantity,
                temp_target=bucket.order.temp_target,
                temp_min=bucket.order.temp_min,
                temp_max=bucket.order.temp_max,
                bucket=bucket,
                heat_sequence=next_sequence,
                operator_name=serializer.validated_data.get('operator_name', ''),
                shift_id=serializer.validated_data.get('shift_id', 'A'),
                status='pending',
                current_phase='preparation'
            )

            # Update bucket's actual quantity
            bucket.actual_quantity = bucket.get_actual_quantity()
            bucket.save()

            return Response(LFHeatDetailSerializer(heat).data, status=status.HTTP_201_CREATED)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['get'])
    def heats(self, request, pk=None):
        """Get all heats in this bucket"""
        bucket = self.get_object()
        heats = bucket.heats.all()
        serializer = LFHeatDetailSerializer(heats, many=True)
        return Response(serializer.data)