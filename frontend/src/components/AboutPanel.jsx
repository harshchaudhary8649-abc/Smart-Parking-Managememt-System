// Reusable About panel component - shown beside Slots and Ticket pages
export default function AboutPanel() {
  return (
    <div
      className="form-card"
      style={{
        padding: "28px",
        margin: 0,
        background: "rgba(255,255,255,0.95)",
        backdropFilter: "blur(10px)",
        border: "1px solid #e2e8f0",
        borderRadius: "14px",
        boxShadow: "0 4px 24px rgba(43,61,87,0.08)",
      }}
    >
      <p className="eyebrow" style={{ color: "#3b82f6" }}>
        System Info
      </p>
      <h2 style={{ fontSize: "1.4rem", marginBottom: "20px", color: "#0d1728" }}>
        About Smart Parking
      </h2>
      <ul
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "16px",
          paddingLeft: "0",
          listStyle: "none",
          margin: 0,
        }}
      >
        {[
          {
            title: "Real-time Slot Availability",
            desc: "Live monitoring across Mall, Hotel, School & Hospital venues.",
          },
          {
            title: "Multi-Vehicle Support",
            desc: "Separate rates and capacity for Cars (₹40/hr) and Bikes (₹20/hr).",
          },
          {
            title: "Flexible Payment Modes",
            desc: "Supports UPI QR Code, RFID, Contactless Card, and Cash.",
          },
          {
            title: "Overtime Penalty System",
            desc: "Auto-charges ₹5/hour extra if parking exceeds booked duration.",
          },
          {
            title: "Visual Admin Dashboard",
            desc: "Manage slots, track occupancy and real-time revenue from one panel.",
          },
          {
            title: "QR Ticket Verification",
            desc: "Instantly verify active tickets at entry/exit gates.",
          },
          {
            title: "Secure JWT Authentication",
            desc: "Role-based access for Admin and User with token-based login.",
          },
        ].map(({ title, desc }) => (
          <li
            key={title}
            style={{ display: "flex", gap: "12px", alignItems: "flex-start" }}
          >
            <span
              style={{
                color: "#3b82f6",
                fontWeight: "bold",
                fontSize: "1rem",
                marginTop: "2px",
                flexShrink: 0,
              }}
            >
              ✓
            </span>
            <div>
              <strong style={{ display: "block", color: "#1e293b", fontSize: "0.95rem" }}>
                {title}
              </strong>
              <span style={{ fontSize: "0.82rem", color: "#64748b", lineHeight: "1.4" }}>
                {desc}
              </span>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
