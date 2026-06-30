const express = require("express");
const crypto = require("crypto");
const auth = require("../middleware/auth");
const requireRole = require("../middleware/role");
const { dashboard } = require("../controllers/admincontroller");
const {
  createBooking,
  findBookingById,
  findBookingByTicket,
  listBookings,
  saveBooking,
} = require("../models/booking");
const { findSlotById, saveSlot } = require("../models/slot");
const { makePseudoQr, makeTicketCode } = require("../utils/qrcode");

const router = express.Router();

router.get("/admin/dashboard", auth, requireRole("admin"), dashboard);

router.get("/", auth, (req, res) => {
  const bookings = listBookings();
  const visibleBookings =
    req.user.role === "admin"
      ? bookings
      : bookings.filter((booking) => booking.userId === req.user.id);

  res.json({ bookings: visibleBookings.sort((a, b) => b.createdAt.localeCompare(a.createdAt)) });
});

router.post("/", auth, (req, res) => {
  const { slotId, vehicleNumber, hours, paymentMethod, vehicleType, paymentDetails } = req.body;
  const slot = findSlotById(slotId);
  const bookingHours = Math.max(1, Number(hours || 1));
  const selectedVehicleType = vehicleType === "Bike" ? "Bike" : "Car";
  const availabilityKey = selectedVehicleType === "Bike" ? "availableBike" : "availableCar";

  if (!slot) {
    return res.status(404).json({ message: "Slot not found" });
  }

  if (slot.status !== "available" || Number(slot[availabilityKey] || 0) <= 0) {
    return res.status(409).json({ message: `${selectedVehicleType} parking is not available in this block` });
  }

  if (!vehicleNumber) {
    return res.status(400).json({ message: "Vehicle number is required" });
  }

  const ticketCode = makeTicketCode(slot.id);
  const now = new Date();
  const endsAt = new Date(now.getTime() + bookingHours * 60 * 60 * 1000);
  const booking = {
    id: crypto.randomUUID(),
    userId: req.user.id,
    userName: req.user.name,
    slotId: slot.id,
    slotLabel: slot.label,
    vehicleNumber: vehicleNumber.toUpperCase(),
    vehicleType: selectedVehicleType,
    venue: slot.venue,
    hours: bookingHours,
    amount:
      bookingHours *
      Number(selectedVehicleType === "Bike" ? slot.bikeHourlyRate || 20 : slot.carHourlyRate || slot.hourlyRate || 40),
    paymentMethod: paymentMethod || "QR Code",
    paymentDetails: paymentDetails || "",
    status: "active",
    ticketCode,
    qrCode: makePseudoQr(ticketCode),
    createdAt: now.toISOString(),
    startsAt: now.toISOString(),
    endsAt: endsAt.toISOString(),
  };

  createBooking(booking);
  const nextSlot = {
    ...slot,
    [availabilityKey]: Number(slot[availabilityKey]) - 1,
  };
  const hasSpaceLeft = Number(nextSlot.availableBike || 0) + Number(nextSlot.availableCar || 0) > 0;
  saveSlot({
    ...nextSlot,
    status: hasSpaceLeft ? "available" : "occupied",
    indicator: hasSpaceLeft ? "green" : "red",
  });

  res.status(201).json({ booking });
});

router.patch("/:id/complete", auth, (req, res) => {
  const booking = findBookingById(req.params.id);

  if (!booking) {
    return res.status(404).json({ message: "Booking not found" });
  }

  // Allow if the user is an admin OR if they are the owner of the booking
  if (req.user.role !== "admin" && booking.userId !== req.user.id) {
    return res.status(403).json({ message: "Unauthorized to complete this booking" });
  }

  const slot = findSlotById(booking.slotId);
  const completed = saveBooking({
    ...booking,
    status: "completed",
    completedAt: new Date().toISOString(),
  });

  if (slot) {
    const availabilityKey = booking.vehicleType === "Bike" ? "availableBike" : "availableCar";
    const maxCapacity = booking.vehicleType === "Bike" ? slot.bikeCapacity : slot.carCapacity;
    saveSlot({
      ...slot,
      [availabilityKey]: Math.min(Number(slot[availabilityKey] || 0) + 1, Number(maxCapacity || 0)),
      status: "available",
      indicator: "green",
    });
  }

  res.json({ booking: completed });
});

router.get("/verify/:ticketCode", (req, res) => {
  const booking = findBookingByTicket(req.params.ticketCode);

  if (!booking) {
    return res.status(404).json({ valid: false, message: "Ticket not found" });
  }

  res.json({
    valid: booking.status === "active",
    booking,
    message: booking.status === "active" ? "Ticket is active" : `Ticket is ${booking.status}`,
  });
});

module.exports = router;
