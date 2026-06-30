const { readStore, writeStore } = require("../config/db");

function listBookings() {
  return readStore().bookings;
}

function findBookingById(id) {
  return readStore().bookings.find((booking) => booking.id === id);
}

function findBookingByTicket(ticketCode) {
  return readStore().bookings.find((booking) => booking.ticketCode === ticketCode);
}

function createBooking(booking) {
  const store = readStore();
  store.bookings.push(booking);
  writeStore(store);
  return booking;
}

function saveBooking(booking) {
  const store = readStore();
  const index = store.bookings.findIndex((item) => item.id === booking.id);

  if (index === -1) {
    store.bookings.push(booking);
  } else {
    store.bookings[index] = booking;
  }

  writeStore(store);
  return booking;
}

module.exports = {
  listBookings,
  findBookingById,
  findBookingByTicket,
  createBooking,
  saveBooking,
};
