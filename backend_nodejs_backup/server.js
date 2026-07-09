require("dotenv").config();

const express = require("express");
const cors = require("cors");
const { initStore } = require("./src/config/db");
const authRoutes = require("./src/routes/authRoutes");
const slotRoutes = require("./src/routes/slotRoutes");
const bookingRoutes = require("./src/routes/bookingRoutes");

const app = express();
const port = process.env.PORT || 5000;

initStore();

app.use(cors());
app.use(express.json());

app.get("/", (_req, res) => {
  res.json({
    message: "Smart Parking Management System API is running",
    health: "/api/health",
  });
});

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", service: "smart-parking-backend" });
});

app.use("/api/auth", authRoutes);
app.use("/api/slots", slotRoutes);
app.use("/api/bookings", bookingRoutes);

app.use((req, res) => {
  res.status(404).json({ message: `Route not found: ${req.method} ${req.originalUrl}` });
});

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(err.status || 500).json({ message: err.message || "Server error" });
});

app.listen(port, () => {
  console.log(`Smart Parking API running on http://localhost:${port}`);
});
