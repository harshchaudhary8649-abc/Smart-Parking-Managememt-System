from django.urls import path
from . import views

urlpatterns = [
    # Auth
    path('auth/register', views.register_view, name='register'),
    path('auth/login', views.login_view, name='login'),
    path('auth/me', views.me_view, name='me'),

    # Slots
    path('slots', views.slots_list_create_view, name='slots_list_create'),
    path('slots/<str:pk>', views.slot_detail_view, name='slot_detail'),

    # Bookings
    path('bookings', views.bookings_list_create_view, name='bookings_list_create'),
    path('bookings/<str:pk>/complete', views.booking_complete_view, name='booking_complete'),
    path('bookings/verify/<str:ticket_code>', views.booking_verify_view, name='booking_verify'),
    path('bookings/admin/dashboard', views.admin_dashboard_view, name='admin_dashboard'),

    # Health check
    path('health', views.health_check, name='health'),
]
