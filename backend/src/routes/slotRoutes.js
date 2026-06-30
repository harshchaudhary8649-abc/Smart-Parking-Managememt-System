const express = require("express");
const auth = require("../middleware/auth");
const requireRole = require("../middleware/role");
const {
  createSlot,
  getSlots,
  removeSlot,
  updateSlot,
} = require("../controllers/slotcontroller");

const router = express.Router();

router.get("/", getSlots);
router.post("/", auth, requireRole("admin"), createSlot);
router.patch("/:id", auth, requireRole("admin"), updateSlot);
router.delete("/:id", auth, requireRole("admin"), removeSlot);

module.exports = router;
