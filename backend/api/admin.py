from django.contrib import admin
from .models import CustomUser, ParkingSlot, Booking

admin.site.register(CustomUser)
admin.site.register(ParkingSlot)
admin.site.register(Booking)

