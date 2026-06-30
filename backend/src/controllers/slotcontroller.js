const { listBookings } = require("../models/booking");
const { deleteSlot, findSlotById, listSlots, saveSlot } = require("../models/slot");

function withOccupancy(slot) {
  const activeBooking = listBookings().find(
    (booking) => booking.slotId === slot.id && booking.status === "active"
  );

  return {
    ...slot,
    activeBookingId: activeBooking ? activeBooking.id : null,
  };
}

function getSlots(req, res) {
  const { status, type, venue } = req.query;
  let slots = listSlots().map(withOccupancy);

  if (status) {
    slots = slots.filter((slot) => slot.status === status);
  }

  if (type && ["Bike", "Car"].includes(type)) {
    const key = type === "Bike" ? "availableBike" : "availableCar";
    slots = slots.filter((slot) => Number(slot[key] || 0) > 0);
  }

  if (venue) {
    slots = slots.filter((slot) => slot.venue.toLowerCase() === venue.toLowerCase());
  }

  res.json({ slots });
}

function createSlot(req, res) {
  const { id, label, floor, venue, type, hourlyRate, status, walkingTime, priority } = req.body;

  if (!id || !label || !floor || !venue || !type || !hourlyRate) {
    return res.status(400).json({ message: "id, label, floor, venue, type and hourlyRate are required" });
  }

  if (findSlotById(id)) {
    return res.status(409).json({ message: "Slot id already exists" });
  }

  const slot = saveSlot({
    id,
    label,
    floor,
    venue,
    type,
    hourlyRate: Number(hourlyRate),
    bikeHourlyRate: 20,
    carHourlyRate: Number(hourlyRate),
    totalCapacity: 100,
    bikeCapacity: 30,
    carCapacity: 70,
    availableBike: 30,
    availableCar: 70,
    walkingTime: Number(walkingTime || 3),
    priority: priority || "",
    indicator: status === "occupied" ? "red" : "green",
    status: status || "available",
  });

  res.status(201).json({ slot });
}

function updateSlot(req, res) {
  const slot = findSlotById(req.params.id);

  if (!slot) {
    return res.status(404).json({ message: "Slot not found" });
  }

  const updated = saveSlot({
    ...slot,
    ...req.body,
    hourlyRate: req.body.hourlyRate ? Number(req.body.hourlyRate) : slot.hourlyRate,
    walkingTime: req.body.walkingTime ? Number(req.body.walkingTime) : slot.walkingTime,
    indicator:
      req.body.status === "occupied" || req.body.status === "maintenance"
        ? "red"
        : req.body.status === "available"
          ? "green"
          : slot.indicator,
  });

  res.json({ slot: updated });
}

function removeSlot(req, res) {
  const removed = deleteSlot(req.params.id);

  if (!removed) {
    return res.status(404).json({ message: "Slot not found" });
  }

  res.json({ message: "Slot deleted" });
}

module.exports = {
  getSlots,
  createSlot,
  updateSlot,
  removeSlot,
};
