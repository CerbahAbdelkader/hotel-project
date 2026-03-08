const bookingsModel = require("../models/bookingsModel");

exports.getBookings = (req, res) => res.json({ bookings: bookingsModel.getBookings() });
exports.getBooking = (req, res) => {
  const booking = bookingsModel.getBookingById(parseInt(req.params.id));
  if (!booking) return res.status(404).json({ error: "Booking not found" });
  res.json({ booking });
};
exports.createBooking = (req, res) => {
  const { roomId, user, date, nights } = req.body;
  const booking = bookingsModel.createBooking(roomId, user, date, nights);
  res.status(201).json({ message: "Booking created", booking });
};
exports.updateBooking = (req, res) => {
  const booking = bookingsModel.updateBooking(parseInt(req.params.id), req.body);
  if (!booking) return res.status(404).json({ error: "Booking not found" });
  res.json({ message: "Booking updated", booking });
};
exports.deleteBooking = (req, res) => {
  const success = bookingsModel.deleteBooking(parseInt(req.params.id));
  if (!success) return res.status(404).json({ error: "Booking not found" });
  res.json({ message: "Booking deleted" });
};