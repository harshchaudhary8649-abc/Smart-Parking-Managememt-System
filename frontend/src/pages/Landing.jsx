import { Link } from "react-router-dom";

export default function Landing({ user }) {
  return (
    <section className="hero">
      <div className="hero-content">
        <p className="eyebrow">Smart Parking Management System</p>
        <h1>SmartPark</h1>
        <p>
          Smarter parking starts here. Locate available spaces, book in seconds, receive a digital pass, and enjoy hassle-free parking management.
        </p>
        <div className="hero-actions">
          <Link className="primary-button" to="/slots">
            View Slots
          </Link>
          <Link className="ghost-button" to={user ? "/dashboard" : "/login"}>
            {user ? "My Bookings" : "Login"}
          </Link>
        </div>
      </div>
      <div className="hero-panel">
        <div className="garage-grid">
          {["A1", "A2", "A3", "B1", "B2", "C1"].map((slot, index) => (
            <div className={index === 5 ? "garage-slot offline" : index === 2 ? "garage-slot ev" : "garage-slot"} key={slot}>
              <span>{slot}</span>
            </div>
          ))}
        </div>
        <div className="venue-strip">
          {["Hotels", "Schools", "Malls", "Hospitals"].map((venue) => (
            <span key={venue}>{venue}</span>
          ))}
        </div>
      </div>
      <div className="venue-features">
        {[
          [
            <svg width="32" height="32" viewBox="0 0 24 24" fill="#2563eb"><path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z" /></svg>,
            "Smart Parking",
            "Real-time availability"
          ],
          [
            <svg width="32" height="32" viewBox="0 0 24 24" fill="#10b981"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" /></svg>,
            "Find Space",
            "Easily & Quickly"
          ],
          [
            <svg width="32" height="32" viewBox="0 0 24 24" fill="#2563eb"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-2 16l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z" /></svg>,
            "Secure Parking",
            "Safe & Reliable"
          ],
          [
            <svg width="32" height="32" viewBox="0 0 24 24" fill="#10b981"><rect x="4" y="14" width="3" height="6" /><rect x="9" y="10" width="3" height="10" /><rect x="14" y="6" width="3" height="14" /><rect x="19" y="2" width="3" height="18" /></svg>,
            "Better Management",
            "Data-driven Insights"
          ],
        ].map(([icon, title, subtitle], index) => (
          <div className="venue-feature-item" key={title}>
            <div className="venue-icon-circle">
              {icon}
            </div>
            <h3 className="venue-title">{title}</h3>
            <p className="venue-subtitle">{subtitle}</p>
            {index < 3 && <div className="venue-divider" />}
          </div>
        ))}
      </div>
    </section>
  );
}
