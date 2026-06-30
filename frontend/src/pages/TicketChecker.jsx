import { useState } from "react";
import api, { getErrorMessage } from "../services/api.js";

export default function TicketChecker() {
  const [ticketCode, setTicketCode] = useState("");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  async function checkTicket(event) {
    event.preventDefault();
    setResult(null);
    setError("");

    try {
      const { data } = await api.get(`/bookings/verify/${ticketCode}`);
      setResult(data);
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }

  return (
    <section className="page narrow">
      <form className="form-card" onSubmit={checkTicket}>
        <p className="eyebrow">Gate verification</p>
        <h2>Check Ticket</h2>
        <label>
          Ticket Code
          <input value={ticketCode} onChange={(event) => setTicketCode(event.target.value)} required />
        </label>
        <button className="primary-button wide">Verify</button>
      </form>
      {error && <div className="notice error">{error}</div>}
      {result && (
        <div className={`notice ${result.valid ? "success" : "error"}`}>
          <strong>{result.message}</strong>
          <span>
            {result.booking.venue || "Parking"} - {result.booking.slotLabel} - {result.booking.vehicleNumber}
          </span>
        </div>
      )}
    </section>
  );
}
