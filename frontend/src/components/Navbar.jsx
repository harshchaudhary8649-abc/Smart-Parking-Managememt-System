import { NavLink, Link } from "react-router-dom";
import { useState } from "react";

export default function Navbar({ user, onLogout }) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="navbar">
      <div className="navbar-container">
        <div className="navbar-left">
          <button
            className="hamburger"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            <span></span>
            <span></span>
            <span></span>
          </button>

          <Link className="brand" to="/">
            <span className="brand-mark">P</span>
            <span>SmartPark</span>
          </Link>

          <nav className="nav-desktop">
            <NavLink to="/slots">Slots</NavLink>
            <NavLink to="/ticket">Ticket</NavLink>
            <NavLink to="/about">About</NavLink>
            {user && <NavLink to="/dashboard">My Bookings</NavLink>}
            {user?.role === "admin" && <NavLink to="/admin">Admin</NavLink>}
          </nav>
        </div>

        <div className="nav-actions">
          {user ? (
            <>
              <span className="user-chip">{user.name}</span>
              <button className="ghost-button" onClick={onLogout}>
                Logout
              </button>
            </>
          ) : (
            <>
              <Link className="ghost-button" to="/login">
                Login
              </Link>
              <Link className="primary-button" to="/register">
                Register
              </Link>
            </>
          )}
        </div>
      </div>

      <nav className={`nav-mobile ${menuOpen ? "nav-open" : ""}`}>
        <NavLink to="/slots" onClick={() => setMenuOpen(false)}>Slots</NavLink>
        <NavLink to="/ticket" onClick={() => setMenuOpen(false)}>Ticket</NavLink>
        <NavLink to="/about" onClick={() => setMenuOpen(false)}>About</NavLink>
        {user && <NavLink to="/dashboard" onClick={() => setMenuOpen(false)}>My Bookings</NavLink>}
        {user?.role === "admin" && <NavLink to="/admin" onClick={() => setMenuOpen(false)}>Admin</NavLink>}
      </nav>
    </header>
  );
}
