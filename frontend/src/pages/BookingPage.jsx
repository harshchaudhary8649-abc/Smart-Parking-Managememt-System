import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import api, { getErrorMessage } from "../services/api.js";

export default function BookingPage({ auth }) {
  const { slotId } = useParams();
  const navigate = useNavigate();
  const [slot, setSlot] = useState(null);

  const [form, setForm] = useState({
    vehicleNumber: "",
    hours: 1,
    paymentMethod: "QR Code",
    vehicleType: "Car",
    upiId: "",
    rfidTag: "",
    cardNumber: "",
    cardExpiry: "",
    cardCvv: "",
  });

  const [booking, setBooking] = useState(null);

  useEffect(() => {
    api.get("/slots").then(({ data }) => {
      setSlot(data.slots.find((item) => item.id === slotId));
    });
  }, [slotId]);

  const currentRate = form.vehicleType === "Bike" ? (slot?.bikeHourlyRate || 20) : (slot?.carHourlyRate || 40);
  const totalAmount = currentRate * Number(form.hours || 1);

  // Dynamically generate a real UPI payment link
  const upiUrl = `upi://pay?pa=smartpark@paytm&pn=SmartParking&am=${totalAmount}&cu=INR&tn=ParkingFloor-${slot?.label}`;
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(upiUrl)}`;

  async function handleSubmit(event) {
    event.preventDefault();

    let paymentDetails = "";
    if (form.paymentMethod === "UPI") {
      if (!form.upiId) return auth.notify("Please enter your UPI ID", "error");
      paymentDetails = `UPI: ${form.upiId}`;
    } else if (form.paymentMethod === "RFID") {
      if (!form.rfidTag) return auth.notify("Please enter your RFID Tag number", "error");
      paymentDetails = `RFID Tag: ${form.rfidTag}`;
    } else if (form.paymentMethod === "Contactless Card") {
      if (!form.cardNumber || !form.cardExpiry || !form.cardCvv) {
        return auth.notify("Please fill in all card details", "error");
      }
      paymentDetails = `Card: **** **** **** ${form.cardNumber.slice(-4)}`;
    } else if (form.paymentMethod === "QR Code") {
      paymentDetails = "Paid via QR Scan";
    } else {
      paymentDetails = "Pay at Counter";
    }

    try {
      const { data } = await api.post("/bookings", {
        slotId,
        vehicleNumber: form.vehicleNumber,
        hours: form.hours,
        paymentMethod: form.paymentMethod,
        vehicleType: form.vehicleType,
        paymentDetails,
      });
      setBooking(data.booking);
      auth.notify("Slot booked successfully");
    } catch (error) {
      auth.notify(getErrorMessage(error), "error");
    }
  }

  if (booking) {
    return (
      <section className="page narrow">
        <div className="ticket-card">
          <p className="eyebrow">Booking confirmed</p>
          <h2>Ticket Generated</h2>
          <img className="qr" src={booking.qrCode} alt="Ticket QR" />
          <p className="ticket-code">{booking.ticketCode}</p>
          <div className="ticket-details">
            <span>Slot / Floor</span>
            <strong>{booking.slotLabel} ({booking.venue})</strong>
            <span>Vehicle</span>
            <strong>{booking.vehicleNumber} ({booking.vehicleType})</strong>
            <span>Payment Method</span>
            <strong>{booking.paymentMethod}</strong>
            {booking.paymentDetails && (
              <>
                <span>Payment Info</span>
                <strong>{booking.paymentDetails}</strong>
              </>
            )}
            <span>Amount</span>
            <strong>Rs {booking.amount}</strong>
          </div>
          <button className="primary-button wide" onClick={() => navigate("/dashboard")}>
            Go to Dashboard
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="page narrow">
      <form className="form-card" onSubmit={handleSubmit}>
        <p className="eyebrow">Reserve slot</p>
        <h2>Book {slot?.venue} - Floor {slot?.label || slotId}</h2>

        <label>
          Vehicle Type
          <select
            value={form.vehicleType}
            onChange={(event) => setForm({ ...form, vehicleType: event.target.value })}
          >
            <option value="Car">Car (Rs {slot?.carHourlyRate || 40}/hr)</option>
            <option value="Bike">Bike (Rs {slot?.bikeHourlyRate || 20}/hr)</option>
          </select>
        </label>

        <label>
          Vehicle Number
          <input
            placeholder="DL 01 AB 1234"
            value={form.vehicleNumber}
            onChange={(event) => setForm({ ...form, vehicleNumber: event.target.value })}
            required
          />
        </label>
        <label>
          Parking Hours
          <input
            type="number"
            min="1"
            max="24"
            value={form.hours}
            onChange={(event) => setForm({ ...form, hours: event.target.value })}
            required
          />
        </label>
        <label>
          Payment Mode
          <select
            value={form.paymentMethod}
            onChange={(event) => setForm({ ...form, paymentMethod: event.target.value })}
          >
            <option>QR Code</option>
            <option>UPI</option>
            <option>RFID</option>
            <option>Contactless Card</option>
            <option>Cash</option>
          </select>
        </label>

        {/* Conditional Payment Inputs */}
        {form.paymentMethod === "QR Code" && (
          <div style={{ margin: "20px 0", padding: "16px", background: "#f8fafc", borderRadius: "8px", border: "1px dashed #cbd5e1", display: "flex", flexDirection: "column", alignItems: "center", gap: "10px" }}>
            <span style={{ fontSize: "0.85rem", fontWeight: "bold", color: "#475569" }}>Scan this UPI QR Code to Pay</span>
            <img src={qrCodeUrl} alt="UPI Payment QR" style={{ border: "1px solid #e2e8f0", padding: "8px", background: "#fff", borderRadius: "6px" }} />
            <span style={{ fontSize: "1.1rem", fontWeight: "bold", color: "#1e293b" }}>Rs {totalAmount}</span>
            <span style={{ fontSize: "0.75rem", color: "#64748b" }}>Open any UPI App (GPay, PhonePe, Paytm) to scan</span>
          </div>
        )}

        {form.paymentMethod === "UPI" && (
          <div style={{ margin: "14px 0", padding: "12px", background: "#f8fafc", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
            <label style={{ marginTop: 0 }}>
              UPI ID
              <input
                type="text"
                placeholder="username@upi"
                value={form.upiId}
                onChange={(event) => setForm({ ...form, upiId: event.target.value })}
                required
              />
            </label>
          </div>
        )}

        {form.paymentMethod === "RFID" && (
          <div style={{ margin: "14px 0", padding: "12px", background: "#f8fafc", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
            <label style={{ marginTop: 0 }}>
              RFID Tag Card Number
              <input
                type="text"
                placeholder="RFID-9988776655"
                value={form.rfidTag}
                onChange={(event) => setForm({ ...form, rfidTag: event.target.value })}
                required
              />
            </label>
          </div>
        )}

        {form.paymentMethod === "Contactless Card" && (
          <div style={{ margin: "14px 0", padding: "16px", background: "#f8fafc", borderRadius: "8px", border: "1px solid #e2e8f0", display: "grid", gap: "10px" }}>
            <label style={{ marginTop: 0 }}>
              Card Number
              <input
                type="text"
                maxLength="16"
                placeholder="1234 5678 9012 3456"
                value={form.cardNumber}
                onChange={(event) => setForm({ ...form, cardNumber: event.target.value })}
                required
              />
            </label>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
              <label style={{ marginTop: 0 }}>
                Expiry Date
                <input
                  type="text"
                  maxLength="5"
                  placeholder="MM/YY"
                  value={form.cardExpiry}
                  onChange={(event) => setForm({ ...form, cardExpiry: event.target.value })}
                  required
                />
              </label>
              <label style={{ marginTop: 0 }}>
                CVV
                <input
                  type="password"
                  maxLength="3"
                  placeholder="123"
                  value={form.cardCvv}
                  onChange={(event) => setForm({ ...form, cardCvv: event.target.value })}
                  required
                />
              </label>
            </div>
          </div>
        )}

        {form.paymentMethod === "Cash" && (
          <div style={{ margin: "16px 0", padding: "14px", background: "#fef3c7", borderRadius: "8px", border: "1px solid #fde68a", color: "#92400e", fontSize: "0.85rem", lineHeight: "1.5" }}>
            <strong>Note:</strong> Please pay <strong>Rs {totalAmount}</strong> in cash directly at the parking entry gate counter when you arrive.
          </div>
        )}

        {slot && (
          <div className="guidance-card">
            <strong>{slot.venue} guidance</strong>
            <span>Floor {slot.floor} - estimated walk {slot.walkingTime || 3} minutes</span>
            <span>Available: {form.vehicleType === "Bike" ? `${slot.availableBike} / 30 Bikes` : `${slot.availableCar} / 70 Cars`}</span>
          </div>
        )}
        <div className="price-line">
          <span>Estimated Amount</span>
          <strong>Rs {totalAmount}</strong>
        </div>
        <button className="primary-button wide">Confirm Booking & Pay</button>
        <Link className="ghost-button wide center" to="/slots">
          Back to Slots
        </Link>
      </form>
    </section>
  );
}
