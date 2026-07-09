import jwt
import datetime
from django.conf import settings
from django.utils import timezone
from rest_framework import authentication, exceptions, status
from rest_framework.decorators import api_view, authentication_classes, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response

from .models import CustomUser, ParkingSlot, Booking, make_ticket_code, make_pseudo_qr
from .serializers import UserSerializer, ParkingSlotSerializer, BookingSerializer

from .authentication import CustomJWTAuthentication

def sign_token(user):
    secret = getattr(settings, 'JWT_SECRET', 'smart_parking_local_secret')
    payload = {
        'id': str(user.id),
        'role': user.role,
        'exp': datetime.datetime.utcnow() + datetime.timedelta(days=7)
    }
    return jwt.encode(payload, secret, algorithm='HS256')

# Permission class for Admin only
class IsAdminUserRole(IsAuthenticated):
    def has_permission(self, request, view):
        is_auth = super().has_permission(request, view)
        return is_auth and getattr(request.user, 'role', '') == 'admin'

# --- Auth Views ---
@api_view(['POST'])
@permission_classes([AllowAny])
def register_view(request):
    name = request.data.get('name')
    email = request.data.get('email')
    password = request.data.get('password')

    if not name or not email or not password:
        return Response({'message': 'Name, email and password are required'}, status=status.HTTP_400_BAD_REQUEST)

    if len(password) < 6:
        return Response({'message': 'Password must be at least 6 characters'}, status=status.HTTP_400_BAD_REQUEST)

    if CustomUser.objects.filter(email__iexact=email).exists():
        return Response({'message': 'Email is already registered'}, status=status.HTTP_409_CONFLICT)

    user = CustomUser.objects.create_user(email=email, password=password, name=name, role='user')
    serializer = UserSerializer(user)
    token = sign_token(user)

    return Response({'user': serializer.data, 'token': token}, status=status.HTTP_201_CREATED)

@api_view(['POST'])
@permission_classes([AllowAny])
def login_view(request):
    email = request.data.get('email')
    password = request.data.get('password')

    if not email or not password:
        return Response({'message': 'Email and password are required'}, status=status.HTTP_400_BAD_REQUEST)

    user = CustomUser.objects.filter(email__iexact=email).first()
    if not user or not user.check_password(password):
        return Response({'message': 'Invalid email or password'}, status=status.HTTP_401_UNAUTHORIZED)

    serializer = UserSerializer(user)
    token = sign_token(user)

    return Response({'user': serializer.data, 'token': token})

@api_view(['GET'])
@authentication_classes([CustomJWTAuthentication])
@permission_classes([IsAuthenticated])
def me_view(request):
    serializer = UserSerializer(request.user)
    return Response({'user': serializer.data})

# --- Slot Views ---
@api_view(['GET', 'POST'])
@authentication_classes([CustomJWTAuthentication])
def slots_list_create_view(request):
    if request.method == 'GET':
        status_query = request.query_params.get('status')
        type_query = request.query_params.get('type')
        venue_query = request.query_params.get('venue')

        slots = ParkingSlot.objects.all()

        if status_query:
            slots = slots.filter(status=status_query)

        if type_query and type_query in ['Bike', 'Car']:
            key = 'availableBike' if type_query == 'Bike' else 'availableCar'
            # Filter where available capacity is greater than 0
            if type_query == 'Bike':
                slots = slots.filter(availableBike__gt=0)
            else:
                slots = slots.filter(availableCar__gt=0)

        if venue_query:
            slots = slots.filter(venue__iexact=venue_query)

        serializer = ParkingSlotSerializer(slots, many=True)
        return Response({'slots': serializer.data})

    elif request.method == 'POST':
        # Admin only
        if request.user.role != 'admin':
            return Response({'message': 'Admin role required'}, status=status.HTTP_403_FORBIDDEN)

        data = request.data
        slot_id = data.get('id')
        label = data.get('label')
        floor = data.get('floor')
        venue = data.get('venue')
        slot_type = data.get('type')
        hourly_rate = data.get('hourlyRate')

        if not slot_id or not label or not floor or not venue or not slot_type or hourly_rate is None:
            return Response({'message': 'id, label, floor, venue, type and hourlyRate are required'}, status=status.HTTP_400_BAD_REQUEST)

        if ParkingSlot.objects.filter(id=slot_id).exists():
            return Response({'message': 'Slot id already exists'}, status=status.HTTP_409_CONFLICT)

        slot = ParkingSlot.objects.create(
            id=slot_id,
            label=label,
            floor=floor,
            venue=venue,
            type=slot_type,
            hourlyRate=float(hourly_rate),
            carHourlyRate=float(hourly_rate),
            bikeHourlyRate=20,
            totalCapacity=100,
            bikeCapacity=30,
            carCapacity=70,
            availableBike=30,
            availableCar=70,
            walkingTime=int(data.get('walkingTime', 3)),
            priority=data.get('priority', ''),
            status=data.get('status', 'available'),
            indicator='red' if data.get('status') == 'occupied' else 'green'
        )
        serializer = ParkingSlotSerializer(slot)
        return Response({'slot': serializer.data}, status=status.HTTP_201_CREATED)

@api_view(['PATCH', 'DELETE'])
@authentication_classes([CustomJWTAuthentication])
@permission_classes([IsAdminUserRole])
def slot_detail_view(request, pk):
    slot = ParkingSlot.objects.filter(id=pk).first()
    if not slot:
        return Response({'message': 'Slot not found'}, status=status.HTTP_404_NOT_FOUND)

    if request.method == 'PATCH':
        data = request.data
        if 'label' in data:
            slot.label = data['label']
        if 'floor' in data:
            slot.floor = data['floor']
        if 'venue' in data:
            slot.venue = data['venue']
        if 'type' in data:
            slot.type = data['type']
        if 'hourlyRate' in data:
            slot.hourlyRate = float(data['hourlyRate'])
            slot.carHourlyRate = float(data['hourlyRate'])
        if 'walkingTime' in data:
            slot.walkingTime = int(data['walkingTime'])
        if 'priority' in data:
            slot.priority = data['priority']
        if 'status' in data:
            slot.status = data['status']
            if data['status'] in ['occupied', 'maintenance']:
                slot.indicator = 'red'
            elif data['status'] == 'available':
                slot.indicator = 'green'

        slot.save()
        serializer = ParkingSlotSerializer(slot)
        return Response({'slot': serializer.data})

    elif request.method == 'DELETE':
        slot.delete()
        return Response({'message': 'Slot deleted'})

# --- Booking Views ---
@api_view(['GET', 'POST'])
@authentication_classes([CustomJWTAuthentication])
@permission_classes([IsAuthenticated])
def bookings_list_create_view(request):
    if request.method == 'GET':
        bookings = Booking.objects.all()
        if request.user.role != 'admin':
            bookings = bookings.filter(user=request.user)
        
        bookings = bookings.order_by('-createdAt')
        serializer = BookingSerializer(bookings, many=True)
        return Response({'bookings': serializer.data})

    elif request.method == 'POST':
        data = request.data
        slot_id = data.get('slotId')
        vehicle_number = data.get('vehicleNumber')
        hours = max(1, int(data.get('hours', 1)))
        payment_method = data.get('paymentMethod', 'QR Code')
        payment_details = data.get('paymentDetails', '')
        vehicle_type = 'Bike' if data.get('vehicleType') == 'Bike' else 'Car'

        slot = ParkingSlot.objects.filter(id=slot_id).first()
        if not slot:
            return Response({'message': 'Slot not found'}, status=status.HTTP_404_NOT_FOUND)

        availability_key = 'availableBike' if vehicle_type == 'Bike' else 'availableCar'
        available_count = getattr(slot, availability_key)

        if slot.status != 'available' or available_count <= 0:
            return Response({'message': f'{vehicle_type} parking is not available in this block'}, status=status.HTTP_409_CONFLICT)

        if not vehicle_number:
            return Response({'message': 'Vehicle number is required'}, status=status.HTTP_400_BAD_REQUEST)

        hourly_rate = float(slot.bikeHourlyRate if vehicle_type == 'Bike' else slot.carHourlyRate)
        amount = hours * hourly_rate
        ticket_code = make_ticket_code(slot.id)
        qr_code = make_pseudo_qr(ticket_code)

        now = timezone.now()
        ends_at = now + datetime.timedelta(hours=hours)

        # Update slot capacity
        setattr(slot, availability_key, available_count - 1)
        total_available = slot.availableBike + slot.availableCar
        if total_available <= 0:
            slot.status = 'occupied'
            slot.indicator = 'red'
        else:
            slot.status = 'available'
            slot.indicator = 'green'
        slot.save()

        booking = Booking.objects.create(
            user=request.user,
            slot=slot,
            slotLabel=slot.label,
            vehicleNumber=vehicle_number.upper(),
            vehicleType=vehicle_type,
            venue=slot.venue,
            hours=hours,
            amount=amount,
            paymentMethod=payment_method,
            paymentDetails=payment_details,
            status='active',
            ticketCode=ticket_code,
            qrCode=qr_code,
            createdAt=now,
            startsAt=now,
            endsAt=ends_at
        )

        serializer = BookingSerializer(booking)
        return Response({'booking': serializer.data}, status=status.HTTP_201_CREATED)

@api_view(['PATCH'])
@authentication_classes([CustomJWTAuthentication])
@permission_classes([IsAuthenticated])
def booking_complete_view(request, pk):
    booking = Booking.objects.filter(id=pk).first()
    if not booking:
        return Response({'message': 'Booking not found'}, status=status.HTTP_404_NOT_FOUND)

    # Admin or booking owner can complete
    if request.user.role != 'admin' and booking.user != request.user:
        return Response({'message': 'Unauthorized to complete this booking'}, status=status.HTTP_403_FORBIDDEN)

    booking.status = 'completed'
    now = timezone.now()
    booking.completedAt = now

    # Calculate penalty if they stayed past endsAt
    if booking.endsAt and now > booking.endsAt:
        time_diff = now - booking.endsAt
        hours_overdue = time_diff.total_seconds() / 3600.0
        import math
        hours_to_charge = math.ceil(hours_overdue)
        penalty = hours_to_charge * 5
        booking.amount = float(booking.amount) + penalty
        
        overdue_msg = f"Overdue by {hours_to_charge} hour(s). Charged penalty of Rs. {penalty}."
        if booking.paymentDetails:
            booking.paymentDetails += f" | {overdue_msg}"
        else:
            booking.paymentDetails = overdue_msg

    booking.save()

    # Release slot capacity
    slot = booking.slot
    if slot:
        availability_key = 'availableBike' if booking.vehicleType == 'Bike' else 'availableCar'
        max_capacity = slot.bikeCapacity if booking.vehicleType == 'Bike' else slot.carCapacity
        current_available = getattr(slot, availability_key)
        setattr(slot, availability_key, min(current_available + 1, max_capacity))
        slot.status = 'available'
        slot.indicator = 'green'
        slot.save()

    serializer = BookingSerializer(booking)
    return Response({'booking': serializer.data})

@api_view(['GET'])
@permission_classes([AllowAny])
def booking_verify_view(request, ticket_code):
    booking = Booking.objects.filter(ticketCode=ticket_code).first()
    if not booking:
        return Response({'valid': False, 'message': 'Ticket not found'}, status=status.HTTP_404_NOT_FOUND)

    is_active = (booking.status == 'active')
    serializer = BookingSerializer(booking)
    message = 'Ticket is active' if is_active else f'Ticket is {booking.status}'
    return Response({
        'valid': is_active,
        'booking': serializer.data,
        'message': message
    })

# --- Admin Dashboard View ---
@api_view(['GET'])
@authentication_classes([CustomJWTAuthentication])
@permission_classes([IsAdminUserRole])
def admin_dashboard_view(request):
    slots = ParkingSlot.objects.all()
    bookings = Booking.objects.all()

    active_bookings = bookings.filter(status='active')
    revenue = sum(float(b.amount) for b in bookings.exclude(status='cancelled'))

    total_capacity = sum(s.totalCapacity for s in slots)
    available_bikes = sum(s.availableBike for s in slots)
    available_cars = sum(s.availableCar for s in slots)
    total_available = available_bikes + available_cars

    return Response({
        'stats': {
            'totalSlots': slots.count(),
            'totalCapacity': total_capacity,
            'availableSlots': total_available,
            'occupiedSlots': total_capacity - total_available,
            'activeBookings': active_bookings.count(),
            'totalRevenue': revenue
        }
    })

# --- Health check ---
@api_view(['GET'])
@permission_classes([AllowAny])
def health_check(request):
    return Response({'status': 'ok', 'service': 'smart-parking-backend'})
