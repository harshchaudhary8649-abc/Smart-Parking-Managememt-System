import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'parking_backend.settings')
django.setup()

from api.models import CustomUser, ParkingSlot

def seed_db():
    print("Seeding database...")

    # Create admin
    if not CustomUser.objects.filter(email='admin@parking.com').exists():
        CustomUser.objects.create_superuser(
            email='admin@parking.com',
            password='admin123',
            name='Admin',
            role='admin'
        )
        print("Admin created.")

    # Create demo user
    if not CustomUser.objects.filter(email='user@parking.com').exists():
        CustomUser.objects.create_user(
            email='user@parking.com',
            password='user123',
            name='Demo User',
            role='user'
        )
        print("Demo User created.")

    # Create slots
    venues = ["Mall", "Hotel", "School", "Hospital"]
    blocks = ["A1", "A2", "A3", "A4"]

    for venue in venues:
        for index, block in enumerate(blocks):
            slot_id = f"{venue.upper()}-{block}"
            if not ParkingSlot.objects.filter(id=slot_id).exists():
                ParkingSlot.objects.create(
                    id=slot_id,
                    label=block,
                    floor=block,
                    venue=venue,
                    type="Mixed",
                    status="available",
                    hourlyRate=40,
                    bikeHourlyRate=20,
                    carHourlyRate=40,
                    totalCapacity=100,
                    bikeCapacity=30,
                    carCapacity=70,
                    availableBike=30,
                    availableCar=70,
                    walkingTime=index + 2,
                    indicator="green",
                    priority="Emergency access priority" if venue == "Hospital" and block == "A1" else ""
                )
                print(f"Slot {slot_id} created.")

    print("Seeding completed successfully!")

if __name__ == '__main__':
    seed_db()
