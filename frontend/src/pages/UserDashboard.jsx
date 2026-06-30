import { useEffect, useState } from "react";
import api, { getErrorMessage } from "../services/api.js";

export default function UserDashboard({ auth }) {
  const [bookings, setBookings] = useState([]);

  async function loadBookings() {
    try {
      const { data } = await api.get("/bookings");
      setBookings(data.bookings);
    } catch (error) {
      auth.notify(getErrorMessage(error), "error");
    }
  }

  async function handleLeaveSlot(bookingId) {
    if (!window.confirm("Are you sure you want to leave the parking slot now?")) return;
    
    try {
      await api.patch(`/bookings/${bookingId}/complete`);
      auth.notify("Checkout successful. You have left the slot.");
      loadBookings();
    } catch (error) {
      auth.notify(getErrorMessage(error), "error");
    }
  }

  useEffect(() => {
    loadBookings();
  }, []);

  return (
    <section className="page">
      <div className="page-header">
        <div>
          <p className="eyebrow">Your account</p>
          <h2>My Bookings</h2>
        </div>
      </div>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Ticket</th>
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
                <td>{booking.ticketCode}</td>
                <td>{booking.slotLabel}</td>
                <td>{booking.venue || "General"}</td>
                <td>{booking.vehicleNumber} ({booking.vehicleType || "Car"})</td>
                <td>{booking.paymentMethod || "QR Code"}</td>
                <td>Rs {booking.amount}</td>
                <td>
                  <span className={`status-pill ${booking.status}`}>{booking.status}</span>
                </td>
                <td>
                  {booking.status === "active" && (
                    <button
                      className="primary-button"
                      style={{ minHeight: "32px", padding: "4px 10px", fontSize: "0.85rem", background: "#e53e3e" }}
                      onClick={() => handleLeaveSlot(booking.id)}
                    >
                      Leave Slot
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {!bookings.length && <p className="muted">No bookings yet. Book an available slot to see tickets here.</p>}
    </section>
  );
}
