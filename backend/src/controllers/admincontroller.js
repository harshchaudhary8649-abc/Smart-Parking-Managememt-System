const { listBookings } = require("../models/booking");
const { listSlots } = require("../models/slot");

function dashboard(req, res) {
  const slots = listSlots();
  const bookings = listBookings();
  const activeBookings = bookings.filter((booking) => booking.status === "active");
  const revenue = bookings
    .filter((booking) => booking.status !== "cancelled")
    .reduce((sum, booking) => sum + booking.amount, 0);

  const totalCapacity = slots.reduce((sum, slot) => sum + Number(slot.totalCapacity || 100), 0);
  const availableBikes = slots.reduce((sum, slot) => sum + Number(slot.availableBike || 0), 0);
  const availableCars = slots.reduce((sum, slot) => sum + Number(slot.availableCar || 0), 0);
  const totalAvailable = availableBikes + availableCars;

  res.json({
    stats: {
      totalSlots: slots.length,
      totalCapacity,
      availableSlots: totalAvailable,
      occupiedSlots: totalCapacity - totalAvailable,
      activeBookings: activeBookings.length,
      totalRevenue: revenue,
    },
  });
}

module.exports = {
  dashboard,
};
