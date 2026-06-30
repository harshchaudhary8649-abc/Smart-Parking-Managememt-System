import { useEffect, useState } from "react";
import api, { getErrorMessage } from "../services/api.js";

const emptySlot = {
  id: "",
  label: "",
  floor: "Ground",
  venue: "Mall",
  type: "Car",
  hourlyRate: 40,
  walkingTime: 3,
  status: "available",
  priority: "",
};

export default function AdminDashboard({ auth }) {
  const [stats, setStats] = useState(null);
  const [slots, setSlots] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [form, setForm] = useState(emptySlot);

  async function loadAdminData() {
    try {
      const [dashboardRes, slotsRes, bookingsRes] = await Promise.all([
        api.get("/bookings/admin/dashboard"),
        api.get("/slots"),
        api.get("/bookings"),
      ]);
      setStats(dashboardRes.data.stats);
      setSlots(slotsRes.data.slots);
      setBookings(bookingsRes.data.bookings);
    } catch (error) {
      auth.notify(getErrorMessage(error), "error");
    }
  }

  useEffect(() => {
    loadAdminData();
  }, []);

  async function saveNewSlot(event) {
    event.preventDefault();
    try {
      await api.post("/slots", form);
      auth.notify("Slot added");
      setForm(emptySlot);
      loadAdminData();
    } catch (error) {
      auth.notify(getErrorMessage(error), "error");
    }
  }

  async function updateSlot(slot, status) {
    try {
      await api.patch(`/slots/${slot.id}`, { status });
      loadAdminData();
    } catch (error) {
      auth.notify(getErrorMessage(error), "error");
    }
  }

  async function completeBooking(bookingId) {
    try {
      await api.patch(`/bookings/${bookingId}/complete`);
      auth.notify("Booking completed");
      loadAdminData();
    } catch (error) {
      auth.notify(getErrorMessage(error), "error");
    }
  }

  return (
    <section className="page">
      <div className="page-header">
        <div>
          <p className="eyebrow">Operations</p>
          <h2>Admin Dashboard</h2>
        </div>
      </div>
      <div className="stats-grid">
        {stats &&
          [
            ["Total Floors", stats.totalSlots],
            ["Total Capacity", stats.totalCapacity || stats.totalSlots * 100],
            ["Available Spaces", stats.availableSlots],
            ["Occupied Spaces", stats.occupiedSlots],
            ["Revenue", `Rs ${stats.totalRevenue}`],
          ].map(([label, value]) => (
            <div className="stat-card" key={label}>
              <span>{label}</span>
              <strong>{value}</strong>
            </div>
          ))}
      </div>
      <div className="admin-layout">
        <form className="form-card compact" onSubmit={saveNewSlot}>
          <h3>Add Slot</h3>
          <label>
            Slot Id
            <input value={form.id} onChange={(event) => setForm({ ...form, id: event.target.value })} required />
          </label>
          <label>
            Label
            <input value={form.label} onChange={(event) => setForm({ ...form, label: event.target.value })} required />
          </label>
          <label>
            Floor
            <input value={form.floor} onChange={(event) => setForm({ ...form, floor: event.target.value })} required />
          </label>
          <label>
            Venue
            <select value={form.venue} onChange={(event) => setForm({ ...form, venue: event.target.value })}>
              <option>Hotel</option>
              <option>School</option>
              <option>Mall</option>
              <option>Hospital</option>
            </select>
          </label>
          <label>
            Type
            <select value={form.type} onChange={(event) => setForm({ ...form, type: event.target.value })}>
              <option>Car</option>
              <option>Bike</option>
              <option>EV</option>
            </select>
          </label>
          <label>
            Hourly Rate
            <input
              type="number"
              value={form.hourlyRate}
              onChange={(event) => setForm({ ...form, hourlyRate: event.target.value })}
              required
            />
          </label>
          <label>
            Walking Time
            <input
              type="number"
              min="1"
              value={form.walkingTime}
              onChange={(event) => setForm({ ...form, walkingTime: event.target.value })}
              required
            />
          </label>
          <label>
            Priority Note
            <input value={form.priority} onChange={(event) => setForm({ ...form, priority: event.target.value })} />
          </label>
          <button className="primary-button wide">Add Slot</button>
        </form>
        <div className="panel">
          <h3>Slot Control</h3>
          <div className="mini-list">
            {slots.map((slot) => (
              <div className="mini-row" key={slot.id}>
                <span>
                  <strong>{slot.label}</strong> {slot.type} - {slot.floor}
                  <small>{slot.venue} - LED {slot.indicator || "green"}</small>
                </span>
                <select value={slot.status} onChange={(event) => updateSlot(slot, event.target.value)}>
                  <option value="available">available</option>
                  <option value="occupied">occupied</option>
                  <option value="maintenance">maintenance</option>
                </select>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="panel">
        <h3>Bookings</h3>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>User</th>
                <th>Slot</th>
                <th>Venue</th>
                <th>Vehicle</th>
                <th>Payment</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((booking) => (
                <tr key={booking.id}>
                  <td>{booking.userName}</td>
                  <td>{booking.slotLabel}</td>
                  <td>{booking.venue || "General"}</td>
                  <td>{booking.vehicleNumber}</td>
                  <td>{booking.paymentMethod || "QR Code"}</td>
                  <td>Rs {booking.amount}</td>
                  <td>{booking.status}</td>
                  <td>
                    {booking.status === "active" && (
                      <button className="ghost-button" onClick={() => completeBooking(booking.id)}>
                        Complete
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
