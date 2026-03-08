const express = require("express");
const router = express.Router();
const bookingsController = require("../controllers/bookingsController");

router.get("/", bookingsController.getBookings);
router.get("/:id", bookingsController.getBooking);
router.post("/", bookingsController.createBooking);
router.put("/:id", bookingsController.updateBooking);
router.delete("/:id", bookingsController.deleteBooking);

module.exports = router;