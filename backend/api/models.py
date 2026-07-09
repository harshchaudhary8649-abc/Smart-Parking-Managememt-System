import uuid
import base64
import time
import random
from django.db import models
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.utils import timezone

class CustomUserManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError("The Email field must be set")
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        if password:
            user.set_password(password)
        else:
            user.set_unusable_password()
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('role', 'admin')
        return self.create_user(email, password, **extra_fields)

class CustomUser(AbstractBaseUser, PermissionsMixin):
    ROLE_CHOICES = (
        ('admin', 'Admin'),
        ('user', 'User'),
    )
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    email = models.EmailField(unique=True)
    name = models.CharField(max_length=255)
    role = models.CharField(max_length=10, choices=ROLE_CHOICES, default='user')
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    created_at = models.DateTimeField(default=timezone.now)

    objects = CustomUserManager()

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['name']

    def __str__(self):
        return self.email

class ParkingSlot(models.Model):
    STATUS_CHOICES = (
        ('available', 'Available'),
        ('occupied', 'Occupied'),
        ('maintenance', 'Maintenance'),
    )
    INDICATOR_CHOICES = (
        ('green', 'Green'),
        ('red', 'Red'),
    )
    id = models.CharField(max_length=50, primary_key=True) # e.g. MALL-A1
    label = models.CharField(max_length=50)
    floor = models.CharField(max_length=50)
    venue = models.CharField(max_length=100)
    type = models.CharField(max_length=50, default='Mixed')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='available')
    hourlyRate = models.DecimalField(max_digits=10, decimal_places=2, default=40)
    bikeHourlyRate = models.DecimalField(max_digits=10, decimal_places=2, default=20)
    carHourlyRate = models.DecimalField(max_digits=10, decimal_places=2, default=40)
    totalCapacity = models.IntegerField(default=100)
    bikeCapacity = models.IntegerField(default=30)
    carCapacity = models.IntegerField(default=70)
    availableBike = models.IntegerField(default=30)
    availableCar = models.IntegerField(default=70)
    walkingTime = models.IntegerField(default=3)
    indicator = models.CharField(max_length=10, choices=INDICATOR_CHOICES, default='green')
    priority = models.CharField(max_length=255, blank=True, default='')

    def __str__(self):
        return self.id

class Booking(models.Model):
    STATUS_CHOICES = (
        ('active', 'Active'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
    )
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='bookings')
    slot = models.ForeignKey(ParkingSlot, on_delete=models.CASCADE, related_name='bookings')
    slotLabel = models.CharField(max_length=50)
    vehicleNumber = models.CharField(max_length=50)
    vehicleType = models.CharField(max_length=10, default='Car') # Car or Bike
    venue = models.CharField(max_length=100)
    hours = models.IntegerField(default=1)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    paymentMethod = models.CharField(max_length=50, default='QR Code')
    paymentDetails = models.TextField(blank=True, default='')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='active')
    ticketCode = models.CharField(max_length=100, unique=True)
    qrCode = models.TextField(blank=True, default='')
    createdAt = models.DateTimeField(default=timezone.now)
    startsAt = models.DateTimeField(default=timezone.now)
    endsAt = models.DateTimeField(null=True, blank=True)
    completedAt = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return f"{self.ticketCode} - {self.vehicleNumber}"

def base_36_encode(number):
    alphabet = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ'
    base36 = ''
    sign = ''
    if number < 0:
        sign = '-'
        number = -number
    if 0 <= number < len(alphabet):
        return sign + alphabet[number]
    while number != 0:
        number, i = divmod(number, 36)
        base36 = alphabet[i] + base36
    return sign + base36

def make_ticket_code(slot_id):
    timestamp_36 = base_36_encode(int(time.time() * 1000))
    random_str = ''.join(random.choices('ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789', k=6))
    return f"SP-{slot_id}-{timestamp_36}-{random_str}"

def make_pseudo_qr(ticket_code):
    cells = 13
    seed = 0
    for char in ticket_code:
        seed = (seed * 31 + ord(char)) % 9973

    rects = ""
    for y in range(cells):
        for x in range(cells):
            finder = (x < 4 and y < 4) or (x > cells - 5 and y < 4) or (x < 4 and y > cells - 5)
            filled = finder or ((x * 17 + y * 23 + seed) % 5 < 2)
            if filled:
                rects += f'<rect x="{x}" y="{y}" width="1" height="1" />'

    svg = f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {cells} {cells}" shape-rendering="crispEdges"><rect width="{cells}" height="{cells}" fill="#fff"/><g fill="#111827">{rects}</g></svg>'
    b64_svg = base64.b64encode(svg.encode('utf-8')).decode('utf-8')
    return f"data:image/svg+xml;base64,{b64_svg}"
