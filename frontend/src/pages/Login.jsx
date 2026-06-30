import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api, { getErrorMessage } from "../services/api.js";

export default function Login({ auth }) {
  const [form, setForm] = useState({ email: "user@parking.com", password: "user123" });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function handleSubmit(event) {
    event.preventDefault();
    setLoading(true);

    try {
      const { data } = await api.post("/auth/login", form);
      auth.setSession(data.user, data.token);
      auth.notify("Login successful");
      navigate(data.user.role === "admin" ? "/admin" : "/dashboard");
    } catch (error) {
      auth.notify(getErrorMessage(error), "error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="auth-page">
      <form className="form-card" onSubmit={handleSubmit}>
        <p className="eyebrow">Welcome back</p>
        <h2>Login</h2>
        <label>
          Email
          <input
            type="email"
            value={form.email}
            onChange={(event) => setForm({ ...form, email: event.target.value })}
            required
          />
        </label>
        <label>
          Password
          <input
            type="password"
            value={form.password}
            onChange={(event) => setForm({ ...form, password: event.target.value })}
            required
          />
        </label>
        <button className="primary-button wide" disabled={loading}>
          {loading ? "Logging in..." : "Login"}
        </button>
        <p className="muted">
          Admin demo: admin@parking.com / admin123
          <br />
          No account? <Link to="/register">Create one</Link>
        </p>
      </form>
    </section>
  );
}
