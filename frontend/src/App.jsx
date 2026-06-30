import { useEffect, useMemo, useState } from "react";
import { Navigate, Route, Routes, useNavigate } from "react-router-dom";
import Navbar from "./components/Navbar.jsx";
import Toast from "./components/Toast.jsx";
import AdminDashboard from "./pages/AdminDashboard.jsx";
import BookingPage from "./pages/BookingPage.jsx";
import Landing from "./pages/Landing.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import SlotList from "./pages/SlotList.jsx";
import TicketChecker from "./pages/TicketChecker.jsx";
import UserDashboard from "./pages/UserDashboard.jsx";
import api, { getErrorMessage } from "./services/api.js";

function ProtectedRoute({ user, children, adminOnly = false }) {
  if (!user) return <Navigate to="/login" replace />;
  if (adminOnly && user.role !== "admin") return <Navigate to="/dashboard" replace />;
  return children;
}

export default function App() {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem("smartpark_user");
      return saved ? JSON.parse(saved) : null;
    } catch (_error) {
      localStorage.removeItem("smartpark_user");
      localStorage.removeItem("smartpark_token");
      return null;
    }
  });
  const [toast, setToast] = useState(null);
  const navigate = useNavigate();

  const auth = useMemo(
    () => ({
      user,
      setSession(nextUser, token) {
        setUser(nextUser);
        localStorage.setItem("smartpark_user", JSON.stringify(nextUser));
        localStorage.setItem("smartpark_token", token);
      },
      logout() {
        setUser(null);
        localStorage.removeItem("smartpark_user");
        localStorage.removeItem("smartpark_token");
        navigate("/");
      },
      notify(message, type = "success") {
        setToast({ message, type });
      },
    }),
    [navigate, user]
  );

  useEffect(() => {
    const token = localStorage.getItem("smartpark_token");
    if (!token) return;

    api
      .get("/auth/me")
      .then(({ data }) => {
        setUser(data.user);
        localStorage.setItem("smartpark_user", JSON.stringify(data.user));
      })
      .catch(() => auth.logout());
  }, []);

  return (
    <div className="app-shell">
      <Navbar user={user} onLogout={auth.logout} />
      <main>
        <Routes>
          <Route path="/" element={<Landing user={user} />} />
          <Route path="/login" element={<Login auth={auth} />} />
          <Route path="/register" element={<Register auth={auth} />} />
          <Route path="/slots" element={<SlotList auth={auth} />} />
          <Route
            path="/book/:slotId"
            element={
              <ProtectedRoute user={user}>
                <BookingPage auth={auth} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute user={user}>
                <UserDashboard auth={auth} />
              </ProtectedRoute>
            }
          />
          <Route path="/ticket" element={<TicketChecker />} />
          <Route
            path="/admin"
            element={
              <ProtectedRoute user={user} adminOnly>
                <AdminDashboard auth={auth} />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      {toast && <Toast toast={toast} onClose={() => setToast(null)} />}
    </div>
  );
}
