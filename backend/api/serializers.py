from rest_framework import serializers
from .models import CustomUser, ParkingSlot, Booking

class UserSerializer(serializers.ModelSerializer):
    createdAt = serializers.DateTimeField(source='created_at', format='%Y-%m-%dT%H:%M:%S.%fZ', read_only=True)
    id = serializers.CharField(read_only=True)

    class Meta:
        model = CustomUser
        fields = ('id', 'name', 'email', 'role', 'createdAt')

class ParkingSlotSerializer(serializers.ModelSerializer):
    activeBookingId = serializers.SerializerMethodField()
    hourlyRate = serializers.SerializerMethodField()
    bikeHourlyRate = serializers.SerializerMethodField()
    carHourlyRate = serializers.SerializerMethodField()

    class Meta:
        model = ParkingSlot
        fields = (
            'id', 'label', 'floor', 'venue', 'type', 'status', 
            'hourlyRate', 'bikeHourlyRate', 'carHourlyRate', 
            'totalCapacity', 'bikeCapacity', 'carCapacity', 
            'availableBike', 'availableCar', 'walkingTime', 
            'indicator', 'priority', 'activeBookingId'
        )

    def get_activeBookingId(self, obj):
        active_booking = Booking.objects.filter(slot=obj, status='active').first()
        return str(active_booking.id) if active_booking else None

    # Coerce Decimal to float/int to match Node JS number format
    def get_hourlyRate(self, obj):
        return float(obj.hourlyRate)
    
    def get_bikeHourlyRate(self, obj):
        return float(obj.bikeHourlyRate)

    def get_carHourlyRate(self, obj):
        return float(obj.carHourlyRate)

class BookingSerializer(serializers.ModelSerializer):
    userId = serializers.CharField(source='user.id', read_only=True)
    userName = serializers.CharField(source='user.name', read_only=True)
    slotId = serializers.CharField(source='slot.id', read_only=True)
    amount = serializers.SerializerMethodField()
    createdAt = serializers.DateTimeField(format='%Y-%m-%dT%H:%M:%S.%fZ', read_only=True)
    startsAt = serializers.DateTimeField(format='%Y-%m-%dT%H:%M:%S.%fZ', read_only=True)
    endsAt = serializers.DateTimeField(format='%Y-%m-%dT%H:%M:%S.%fZ', read_only=True)
    completedAt = serializers.DateTimeField(format='%Y-%m-%dT%H:%M:%S.%fZ', read_only=True)

    class Meta:
        model = Booking
        fields = (
            'id', 'userId', 'userName', 'slotId', 'slotLabel', 
            'vehicleNumber', 'vehicleType', 'venue', 'hours', 
            'amount', 'paymentMethod', 'paymentDetails', 'status', 
            'ticketCode', 'qrCode', 'createdAt', 'startsAt', 'endsAt', 'completedAt'
        )

    def get_amount(self, obj):
        return float(obj.amount)
