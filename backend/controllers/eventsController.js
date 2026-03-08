const eventsModel = require("../models/eventsModel");

exports.getEvents = (req, res) => res.json({ events: eventsModel.getEvents() });
exports.getEvent = (req, res) => {
  const event = eventsModel.getEventById(parseInt(req.params.id));
  if (!event) return res.status(404).json({ error: "Event not found" });
  res.json({ event });
};
exports.createEvent = (req, res) => {
  const { title, date } = req.body;
  const event = eventsModel.createEvent(title, date);
  res.status(201).json({ message: "Event created", event });
};
exports.updateEvent = (req, res) => {
  const event = eventsModel.updateEvent(parseInt(req.params.id), req.body);
  if (!event) return res.status(404).json({ error: "Event not found" });
  res.json({ message: "Event updated", event });
};
exports.deleteEvent = (req, res) => {
  const success = eventsModel.deleteEvent(parseInt(req.params.id));
  if (!success) return res.status(404).json({ error: "Event not found" });
  res.json({ message: "Event deleted" });
};