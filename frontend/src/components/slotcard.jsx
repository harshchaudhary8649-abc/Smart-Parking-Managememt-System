import { Link } from "react-router-dom";

export default function SlotCard({ slot, user }) {
  const totalAvailable = (slot.availableBike || 0) + (slot.availableCar || 0);
  const isAvailable = totalAvailable > 0 && slot.status === "available";

  // Generate 70 Car seats (Red if occupied, Green if available)
  const carSeats = [];
  const totalCarCapacity = slot.carCapacity || 70;
  const occupiedCars = totalCarCapacity - (slot.availableCar || 0);
  for (let i = 0; i < totalCarCapacity; i++) {
    carSeats.push(i < occupiedCars ? "occupied" : "available");
  }

  // Generate 30 Bike seats (Red if occupied, Green if available)
  const bikeSeats = [];
  const totalBikeCapacity = slot.bikeCapacity || 30;
  const occupiedBikes = totalBikeCapacity - (slot.availableBike || 0);
  for (let i = 0; i < totalBikeCapacity; i++) {
    bikeSeats.push(i < occupiedBikes ? "occupied" : "available");
  }

  return (
    <article className={`slot-card ${slot.status}`} style={{ minHeight: "auto", gap: "12px" }}>
      <div className="slot-card-top">
        <div>
          <p className="eyebrow">{slot.venue}</p>
          <h3>Floor {slot.label}</h3>
        </div>
        <span className={`bay-light ${isAvailable ? "green" : "red"}`} title="LED bay indicator" />
      </div>

      <div className="slot-meta" style={{ display: "grid", gap: "8px", background: "none", padding: 0 }}>
        <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 10px", background: "#f4f7fb", borderRadius: "6px", fontSize: "0.9rem" }}>
          <span>🚗 Cars:</span>
          <strong>{slot.availableCar} / {totalCarCapacity} Free (Rs {slot.carHourlyRate || 40}/hr)</strong>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 10px", background: "#f4f7fb", borderRadius: "6px", fontSize: "0.9rem" }}>
          <span>🏍️ Bikes:</span>
          <strong>{slot.availableBike} / {totalBikeCapacity} Free (Rs {slot.bikeHourlyRate || 20}/hr)</strong>
        </div>
      </div>

      {/* Visual Seats Grid */}
      <div style={{ border: "1px solid #e2ecf5", borderRadius: "8px", padding: "12px", background: "#fcfdfe" }}>
        <div style={{ marginBottom: "10px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
            <span style={{ fontSize: "0.8rem", fontWeight: "bold", color: "#526174" }}>🚗 Car Layout (70 Seats)</span>
            <span style={{ fontSize: "0.75rem", color: "#8898a9" }}>{occupiedCars} Filled</span>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(10, 1fr)", gap: "3px" }}>
            {carSeats.map((status, index) => (
              <div
                key={`car-${index}`}
                style={{
                  aspectRatio: "1",
                  borderRadius: "2px",
                  background: status === "occupied" ? "#e53e3e" : "#38a169",
                  transition: "background 0.3s ease",
                }}
                title={`Car Seat ${index + 1}: ${status}`}
              />
            ))}
          </div>
        </div>

        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
            <span style={{ fontSize: "0.8rem", fontWeight: "bold", color: "#526174" }}>🏍️ Bike Layout (30 Seats)</span>
            <span style={{ fontSize: "0.75rem", color: "#8898a9" }}>{occupiedBikes} Filled</span>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(10, 1fr)", gap: "3px" }}>
            {bikeSeats.map((status, index) => (
              <div
                key={`bike-${index}`}
                style={{
                  aspectRatio: "1",
                  borderRadius: "2px",
                  background: status === "occupied" ? "#e53e3e" : "#38a169",
                  transition: "background 0.3s ease",
                }}
                title={`Bike Seat ${index + 1}: ${status}`}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="guidance-line" style={{ marginTop: "4px" }}>
        <span>Walk {slot.walkingTime || 3} min</span>
        <span className={`status-pill ${isAvailable ? "available" : "occupied"}`}>
          {isAvailable ? `${totalAvailable} Free` : "Full"}
        </span>
      </div>
      
      {slot.priority && <p className="priority-note">{slot.priority}</p>}
      
      {isAvailable ? (
        user ? (
          <Link className="primary-button wide" to={`/book/${slot.id}`} style={{ marginTop: "4px" }}>
            Book Slot
          </Link>
        ) : (
          <Link className="primary-button wide" to="/login" style={{ marginTop: "4px" }}>
            Login to Book
          </Link>
        )
      ) : (
        <button className="disabled-button wide" disabled style={{ marginTop: "4px" }}>
          {slot.status === "maintenance" ? "Under Maintenance" : "Floor Full"}
        </button>
      )}
    </article>
  );
}
