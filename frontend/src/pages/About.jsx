export default function About() {
  const features = [
    {
      icon: "📍",
      title: "Real-time Slot Availability",
      desc: "Live monitoring across Mall, Hotel, School & Hospital venues with color-coded indicators (green = available, red = full).",
    },
    {
      icon: "🚗",
      title: "Multi-Vehicle Support",
      desc: "Separate capacity and pricing for Cars (₹40/hr) and Bikes (₹20/hr) across all parking blocks.",
    },
    {
      icon: "💳",
      title: "Flexible Payment Modes",
      desc: "Supports UPI QR Code (GPay, PhonePe, Paytm), RFID Card, Contactless Card, and Cash payment options.",
    },
    {
      icon: "⏱️",
      title: "Overtime Penalty System",
      desc: "Automatically calculates and charges ₹5/hour penalty if a vehicle exceeds its booked parking duration.",
    },
    {
      icon: "📊",
      title: "Visual Admin Dashboard",
      desc: "Admin panel to manage parking slots, view live occupancy stats, track active bookings, and monitor total revenue.",
    },
    {
      icon: "🎫",
      title: "QR Ticket Generation",
      desc: "Unique QR ticket generated for every booking. Can be verified at entry/exit gates instantly using the Ticket page.",
    },
    {
      icon: "✅",
      title: "Ticket Verification",
      desc: "Gate staff can verify any ticket code or QR scan to check if the booking is active, completed, or cancelled.",
    },
    {
      icon: "🔐",
      title: "Secure JWT Authentication",
      desc: "Role-based access control (Admin vs User) using secure JSON Web Tokens. Admin-only features are protected.",
    },
    {
      icon: "🏥",
      title: "Priority Parking",
      desc: "Hospital Block A1 is marked with emergency access priority for quick identification in critical situations.",
    },
    {
      icon: "🗄️",
      title: "Django REST + SQL Backend",
      desc: "Built on Python's Django REST Framework with SQLite database — fast, reliable, and production-ready.",
    },
  ];

  return (
    <section className="page">
      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: "48px" }}>
        <p className="eyebrow" style={{ color: "#3b82f6", fontSize: "0.9rem", letterSpacing: "0.1em" }}>
          System Overview
        </p>
        <h2 style={{ fontSize: "2.2rem", color: "#0d1728", marginBottom: "12px" }}>
          About Smart Parking
        </h2>
        <p style={{ color: "#64748b", fontSize: "1rem", maxWidth: "560px", margin: "0 auto", lineHeight: "1.7" }}>
          A complete Smart Parking Management System built with <strong>React.js</strong> frontend and <strong>Django REST Framework</strong> backend. Manage multiple venues, vehicles, and bookings — all in one place.
        </p>
      </div>

      {/* Features Grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: "20px",
        }}
      >
        {features.map(({ icon, title, desc }) => (
          <div
            key={title}
            style={{
              padding: "24px",
              borderRadius: "14px",
              background: "#ffffff",
              border: "1px solid #e2e8f0",
              boxShadow: "0 4px 16px rgba(43,61,87,0.06)",
              display: "flex",
              flexDirection: "column",
              gap: "10px",
              transition: "transform 0.2s ease, box-shadow 0.2s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-4px)";
              e.currentTarget.style.boxShadow = "0 10px 28px rgba(43,61,87,0.12)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "none";
              e.currentTarget.style.boxShadow = "0 4px 16px rgba(43,61,87,0.06)";
            }}
          >
            <div style={{ fontSize: "2rem" }}>{icon}</div>
            <strong style={{ fontSize: "1rem", color: "#1e293b" }}>{title}</strong>
            <p style={{ fontSize: "0.85rem", color: "#64748b", margin: 0, lineHeight: "1.6" }}>{desc}</p>
          </div>
        ))}
      </div>

      {/* Tech Stack Footer */}
      <div
        style={{
          marginTop: "48px",
          padding: "28px",
          borderRadius: "14px",
          background: "linear-gradient(135deg, #0d1728 0%, #1a3a5c 100%)",
          color: "#ffffff",
          textAlign: "center",
        }}
      >
        <p style={{ fontSize: "0.85rem", color: "#94a3b8", marginBottom: "12px", letterSpacing: "0.08em" }}>
          TECH STACK
        </p>
        <div style={{ display: "flex", justifyContent: "center", flexWrap: "wrap", gap: "16px" }}>
          {[
            { label: "React.js", sub: "Frontend" },
            { label: "Vite", sub: "Build Tool" },
            { label: "Tailwind CSS", sub: "Styling" },
            { label: "Django REST", sub: "Backend" },
            { label: "SQLite", sub: "Database" },
            { label: "JWT", sub: "Auth" },
          ].map(({ label, sub }) => (
            <div
              key={label}
              style={{
                padding: "10px 20px",
                borderRadius: "8px",
                background: "rgba(255,255,255,0.08)",
                border: "1px solid rgba(255,255,255,0.12)",
              }}
            >
              <div style={{ fontWeight: "bold", fontSize: "0.95rem" }}>{label}</div>
              <div style={{ fontSize: "0.75rem", color: "#94a3b8" }}>{sub}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
