const fs = require("fs");
const path = require("path");
const bcrypt = require("bcryptjs");

const dataDir = path.join(__dirname, "..", "data");
const dataFile = path.join(dataDir, "store.json");

const venues = ["Mall", "Hotel", "School", "Hospital"];
const blocks = ["A1", "A2", "A3", "A4"];

const seedSlots = venues.flatMap((venue) =>
  blocks.map((block, index) => ({
    id: `${venue.toUpperCase()}-${block}`,
    label: block,
    floor: block,
    venue,
    type: "Mixed",
    status: "available",
    hourlyRate: 40,
    bikeHourlyRate: 20,
    carHourlyRate: 40,
    totalCapacity: 100,
    bikeCapacity: 30,
    carCapacity: 70,
    availableBike: 30,
    availableCar: 70,
    walkingTime: index + 2,
    indicator: "green",
    priority: venue === "Hospital" && block === "A1" ? "Emergency access priority" : "",
  }))
);

function defaultStore() {
  const adminPassword = bcrypt.hashSync("admin123", 10);
  const userPassword = bcrypt.hashSync("user123", 10);

  return {
    users: [
      {
        id: "admin-1",
        name: "Admin",
        email: "admin@parking.com",
        passwordHash: adminPassword,
        role: "admin",
        createdAt: new Date().toISOString(),
      },
      {
        id: "user-1",
        name: "Demo User",
        email: "user@parking.com",
        passwordHash: userPassword,
        role: "user",
        createdAt: new Date().toISOString(),
      },
    ],
    slots: seedSlots,
    bookings: [],
  };
}

function initStore() {
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  if (!fs.existsSync(dataFile)) {
    fs.writeFileSync(dataFile, JSON.stringify(defaultStore(), null, 2));
    return;
  }

  const store = JSON.parse(fs.readFileSync(dataFile, "utf8"));
  let changed = false;

  const oldDemoData =
    store.slots.length < seedSlots.length ||
    store.slots.some((slot) => !slot.totalCapacity || slot.availableBike === undefined || slot.availableCar === undefined);

  if (oldDemoData) {
    store.slots = seedSlots;
    store.bookings = [];
    changed = true;
  } else {
    store.slots = store.slots.map((slot, index) => {
      const seed = seedSlots[index] || seedSlots[0];
      const nextSlot = {
        venue: seed.venue,
        walkingTime: seed.walkingTime,
        indicator: slot.status === "occupied" ? "red" : slot.status === "available" ? "green" : "red",
        priority: "",
        totalCapacity: 100,
        bikeCapacity: 30,
        carCapacity: 70,
        availableBike: 30,
        availableCar: 70,
        bikeHourlyRate: 20,
        carHourlyRate: 40,
        ...slot,
      };

      if (!slot.venue || !slot.walkingTime || !slot.indicator || !slot.totalCapacity) {
        changed = true;
      }

      return nextSlot;
    });
  }

  if (changed) {
    fs.writeFileSync(dataFile, JSON.stringify(store, null, 2));
  }
}

function readStore() {
  initStore();
  const store = JSON.parse(fs.readFileSync(dataFile, "utf8"));
  
  let changed = false;
  const now = new Date();
  
  if (store.bookings && Array.isArray(store.bookings)) {
    store.bookings.forEach((booking) => {
      if (booking.status === "active" && booking.endsAt && new Date(booking.endsAt) <= now) {
        booking.status = "completed";
        booking.completedAt = booking.endsAt;
        changed = true;

        if (store.slots && Array.isArray(store.slots)) {
          const slot = store.slots.find((s) => s.id === booking.slotId);
          if (slot) {
            const availabilityKey = booking.vehicleType === "Bike" ? "availableBike" : "availableCar";
            const maxCapacity = booking.vehicleType === "Bike" ? slot.bikeCapacity : slot.carCapacity;
            slot[availabilityKey] = Math.min(Number(slot[availabilityKey] || 0) + 1, Number(maxCapacity || 0));
            
            const hasSpaceLeft = Number(slot.availableBike || 0) + Number(slot.availableCar || 0) > 0;
            slot.status = hasSpaceLeft ? "available" : "occupied";
            slot.indicator = hasSpaceLeft ? "green" : "red";
          }
        }
      }
    });
  }

  if (changed) {
    fs.writeFileSync(dataFile, JSON.stringify(store, null, 2));
  }

  return store;
}


function writeStore(store) {
  fs.writeFileSync(dataFile, JSON.stringify(store, null, 2));
  return store;
}

module.exports = {
  initStore,
  readStore,
  writeStore,
};
