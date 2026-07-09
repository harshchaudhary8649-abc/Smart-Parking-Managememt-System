import { useEffect, useMemo, useState } from "react";
import SlotCard from "../components/slotcard.jsx";
import api, { getErrorMessage } from "../services/api.js";

export default function SlotList({ auth }) {
  const [slots, setSlots] = useState([]);
  const [filter, setFilter] = useState("all");
  const [venue, setVenue] = useState("all");
  const [loading, setLoading] = useState(true);

  async function loadSlots() {
    setLoading(true);
    try {
      const { data } = await api.get("/slots");
      setSlots(data.slots);
    } catch (error) {
      auth.notify(getErrorMessage(error), "error");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadSlots();
  }, []);

  const venueStats = useMemo(() => {
    const stats = { Mall: 0, Hotel: 0, School: 0, Hospital: 0 };
    slots.forEach((slot) => {
      if (stats[slot.venue] !== undefined) {
        stats[slot.venue] += Number(slot.availableBike || 0) + Number(slot.availableCar || 0);
      }
    });
    return stats;
  }, [slots]);

  const filteredSlots = useMemo(() => {
    return slots.filter((slot) => {
      const matchesVenue = venue === "all" || slot.venue.toLowerCase() === venue.toLowerCase();
      return matchesVenue;
    });
  }, [slots, venue]);

  const isAdmin = auth.user?.role === "admin";

  const venueDetails = {
    Mall: { emoji: "🛍️", desc: "Shopping Mall Parking - Floors A1-A4" },
    Hotel: { emoji: "🏨", desc: "Luxury Hotel Valet & Self-Parking" },
    School: { emoji: "🏫", desc: "Campus Parking & Drop-off Zones" },
    Hospital: { emoji: "🏥", desc: "Emergency & General Patient Parking" },
  };

  return (
    <section className="page">
      <div className="page-header" style={{ marginBottom: "30px" }}>
        <div>
          <p className="eyebrow">Smart Parking Management</p>
          <h2>{venue === "all" ? "Select Venue" : `${venue} Parking`}</h2>
        </div>
        {venue !== "all" && (
          <button className="ghost-button" onClick={() => setVenue("all")}>
            ← Back to Venues
          </button>
        )}
      </div>

      {loading ? (
        <p className="muted">Loading slots...</p>
      ) : venue === "all" && !isAdmin ? (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "24px", marginTop: "10px" }}>
          {["Mall", "Hotel", "School", "Hospital"].map((name) => {
            const details = venueDetails[name];
            const available = venueStats[name];
            return (
              <div
                key={name}
                onClick={() => setVenue(name)}
                style={{
                  padding: "24px", borderRadius: "12px", background: "#ffffff",
                  border: "1px solid #dce7f0", boxShadow: "0 10px 25px rgba(43,61,87,0.05)",
                  cursor: "pointer", transition: "transform 0.2s ease, border-color 0.2s ease",
                  display: "flex", flexDirection: "column", gap: "12px",
                }}
                onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.borderColor = "#127c71"; }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = "none"; e.currentTarget.style.borderColor = "#dce7f0"; }}
              >
                <div style={{ fontSize: "3rem" }}>{details.emoji}</div>
                <div>
                  <h3 style={{ fontSize: "1.5rem", margin: "0 0 4px 0", color: "#0d1728" }}>{name}</h3>
                  <p style={{ fontSize: "0.9rem", color: "#68778a", margin: 0 }}>{details.desc}</p>
                </div>
                <div style={{ marginTop: "auto", padding: "10px", borderRadius: "8px", background: available > 0 ? "#e6f7ee" : "#ffe8e8", color: available > 0 ? "#177245" : "#9a3030", fontWeight: "bold", textAlign: "center" }}>
                  {available > 0 ? `${available} Spaces Free` : "Fully Booked"}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div>
          {isAdmin && venue === "all" && (
            <div style={{ marginBottom: "20px", padding: "12px", background: "#eef4f8", borderRadius: "8px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontWeight: "bold" }}>Admin Mode: Viewing All Venues</span>
              <div style={{ display: "flex", gap: "8px" }}>
                {["Mall", "Hotel", "School", "Hospital"].map((v) => (
                  <button key={v} className="ghost-button" style={{ minHeight: "34px", padding: "4px 12px" }} onClick={() => setVenue(v)}>{v}</button>
                ))}
              </div>
            </div>
          )}
          <div className="slot-grid">
            {filteredSlots.map((slot) => (
              <SlotCard slot={slot} user={auth.user} key={slot.id} />
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
